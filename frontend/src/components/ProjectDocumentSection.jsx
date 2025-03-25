import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { supabase } from "../libs/supabase";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";

const ProjectDocumentSection = ({
  projectPhase = "Execution",
  projectId = null,
  formMethods,
  localFiles,
  setLocalFiles,
  getCurrentPhaseDocumentTemplates,
}) => {
  const { setValue, watch } = formMethods;
  const {
    projectPhases,
    documents,
    setDocuments: setStoreDocuments,
  } = useAuthStore();

  // Remove local documents state since we're using store
  // const [documents, setDocumentsState] = useState([]);

  // Update handleUpload to use store documents
  const handleUpload = (index, file) => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    const newDocs = [...documents];
    newDocs[index].file = file;
    newDocs[index].filename = file.name;
    newDocs[index].date = new Date().toLocaleDateString();
    newDocs[index].uploaded = true;

    setLocalFiles((prev) => {
      const filtered = prev.filter((item) => item.index !== index);
      return [...filtered, { index, file }];
    });

    setStoreDocuments(newDocs);
  };

  const uploadDocuments = async (projectId) => {
    console.log("Uploading documents for project ID:", projectId);
    for (const { index, file } of localFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      formData.append("template_id", documents[index].id);

      const uploadResponse = await axiosInstance.post(
        `/data-management/addProjectDocument`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.data && uploadResponse.data.status !== "success") {
        throw new Error(
          `Failed to upload document: ${uploadResponse.data.message}`
        );
      }
    }
  };

  const handleRemove = (index) => {
    const newDocs = [...documents];
    newDocs[index].file = null;
    newDocs[index].date = null;
    setLocalFiles((prev) => prev.filter((file) => file.index !== index));
    setDocumentsState(newDocs);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-semibold mb-4">Documentation</h2>
      <table className="w-full border-collapse border text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Document Name</th>
            <th className="p-2 border">Required</th>
            <th className="p-2 border">File Name</th>
            <th className="p-2 border">Uploaded Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr key={index} className="border">
              <td className="p-2 border">{doc.name}</td>
              <td className="p-2 border">
                {doc.isrequired ? "Yes" : "Optional"}
              </td>
              <td className="p-2 border">{doc.file ? doc.file.name : "-"}</td>
              <td className="p-2 border">{doc.date || "-"}</td>
              <td className="p-2 border flex items-center gap-2">
                <label>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUpload(index, e.target.files[0])}
                  />
                  <Upload className="text-blue-500 cursor-pointer" size={20} />
                </label>
                {doc.file && (
                  <X
                    className="text-red-500 cursor-pointer"
                    size={20}
                    onClick={() => handleRemove(index)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between w-full mt-4"></div>
    </div>
  );
};

export default ProjectDocumentSection;
