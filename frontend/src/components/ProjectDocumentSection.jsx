import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { supabase } from "../libs/supabase";
import { toast } from "sonner";

const PORT = import.meta.env.VITE_PORT;

const ProjectDocumentSection = ({
  projectPhase = "Execution",
  projectId = null,
  formMethods,
  documents: initialDocuments = [],
  setDocuments,
  localFiles,
  setLocalFiles,
}) => {
  const { setValue, watch } = formMethods;
  const [documents, setDocumentsState] = useState([]);

  // Fetch document templates and merge with uploaded documents
  const getCurrentPhaseDocumentTemplates = async () => {
    try {
      const result = await axiosInstance.post(
        `/data-management/getCurrentPhaseDocumentTemplates`,
        {
          phase: projectPhase,
        }
      );
      console.log("The retrieved documents:", result.data.data);
      // Update both the local state and parent state
      setDocumentsState(result.data.data);
      setDocuments(result.data.data);
    } catch (e) {
      console.error("Error retrieving document templates:", e);
    }
  };

  const getCurrentPhaseUploadedProjectDocuments = async () => {
    try {
      const result = await axiosInstance.post(
        "http://localhost:4000/data-management/getCurrentPhaseUploadedProjectDocuments",
        {
          phase: projectPhase,
          projectId,
        }
      );
      console.log("The retrieved project documents:", result);
      
      // If we have project documents, merge them with templates
      if (result.data && result.data.data && result.data.data.length > 0) {
        const uploadedDocs = result.data.data;
        
        // Create a map of template documents by ID for easier lookup
        const updatedDocs = [...documents];
        
        // Update the documents with uploaded file information
        uploadedDocs.forEach(uploadedDoc => {
          const index = updatedDocs.findIndex(doc => doc.id === uploadedDoc.template_id);
          if (index !== -1) {
            updatedDocs[index] = {
              ...updatedDocs[index],
              filename: uploadedDoc.filename,
              date: new Date(uploadedDoc.created_at).toLocaleDateString(),
              uploaded: true,
              file_id: uploadedDoc.id
            };
          }
        });
        
        // Update both states
        setDocumentsState(updatedDocs);
        setDocuments(updatedDocs);
      }
    } catch (e) {
      console.log(
        "There was an error retrieving project documents:",
        e.message
      );
    }
  };

  useEffect(() => {
    if (projectPhase) { // Only fetch if projectPhase has a value
      getCurrentPhaseDocumentTemplates();
      // Only fetch project documents if we have a projectId
      if (projectId) {
        getCurrentPhaseUploadedProjectDocuments(); 
      }
    }
  }, [projectPhase]); // Only depend on projectPhase changes

  // Handle file upload
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
    
    // Update local files for later upload
    setLocalFiles((prev) => {
      // Remove any existing file at this index
      const filtered = prev.filter(item => item.index !== index);
      return [...filtered, { index, file }];
    });
    
    // Update both states
    setDocumentsState(newDocs);
    setDocuments(newDocs);
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
    setDocuments(newDocs);
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
