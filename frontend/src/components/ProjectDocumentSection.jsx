import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";
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
      const result = await axios.post(
        `http://localhost:${PORT}/data-management/getCurrentPhaseDocumentTemplates`,
        { phase: projectPhase }
      );
      const templates = result.data.data;

      // If projectId exists, fetch uploaded documents and merge with templates
      if (projectId) {
        const uploadedDocsResponse = await axios.post(
          `http://localhost:${PORT}/data-management/getProjectDocuments`,
          { project_id: projectId }
        );
        const uploadedDocs = uploadedDocsResponse.data.result;
        console.log(uploadedDocs);
        // Merge templates with uploaded documents
        const mergedDocuments = templates.map((template) => {
          const uploadedDoc = uploadedDocs.find((doc) => doc.template_id === template.id);
          return uploadedDoc
            ? { ...template, file: uploadedDoc.file, date: uploadedDoc.uploaded_date }
            : template;
        });

        setDocumentsState(mergedDocuments);
        setDocuments(mergedDocuments);
      } else {
        // For new projects, just set the templates
        setDocumentsState(templates);
        setDocuments(templates);
      }
    } catch (error) {
      console.error("Error retrieving document templates:", error);
      toast.error("Failed to load document templates");
    }
  };

  useEffect(() => {
    getCurrentPhaseDocumentTemplates();
  }, [projectPhase, projectId]);

  // Handle file upload
  const handleUpload = (index, file) => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    const newDocs = [...documents];
    newDocs[index].file = file;
    newDocs[index].date = new Date().toLocaleDateString();
    setLocalFiles((prev) => [...prev, { index, file }]);
    setDocumentsState(newDocs);
    setDocuments(newDocs);
  };

  // Handle file removal
  const handleRemove = async (index) => {
    const newDocs = [...documents];
    const fileToRemove = newDocs[index].file;

    if (projectId && fileToRemove) {
      try {
        // Call API to delete the document from the server
        await axios.post(`http://localhost:${PORT}/data-management/deleteProjectDocument`, {
          project_id: projectId,
          document_id: fileToRemove.id, // Assuming the file object has an `id`
        });
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document");
        return;
      }
    }

    // Update local state
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
              <td className="p-2 border">{doc.isrequired ? "Yes" : "Optional"}</td>
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
    </div>
  );
};

export default ProjectDocumentSection;