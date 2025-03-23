import { useState, useEffect } from "react";
import { Upload, X, FileText, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const PORT = import.meta.env.VITE_PORT;

const UpdateProjectDocumentSection = ({
  projectId,
  projectPhaseId,
  phaseName,
  formMethods,
  localFiles,
  setLocalFiles,
}) => {
  const { setValue, watch } = formMethods;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch both document templates and uploaded project documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId || !phaseName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch document templates for the current phase using phase name
        const templatesResponse = await axios.post(
          `/data-management/getCurrentPhaseDocumentTemplates`,
          { phase: phaseName }
        );
        const templates = templatesResponse.data.data || [];

        // Fetch uploaded project documents
        const projectDocsResponse = await axios.post(
          `/data-management/getProjectDocuments`,
          { project_id: projectId }
        );
        const projectDocs = projectDocsResponse.data.result || [];

        // Merge templates with uploaded documents
        const mergedDocuments = templates.map((template) => {
          const uploadedDoc = projectDocs.find(
            (doc) => doc.template_id === template.id
          );
          return uploadedDoc
            ? {
                ...template,
                file: {
                  id: uploadedDoc.id,
                  name: uploadedDoc.document_name,
                  url: uploadedDoc.file_url,
                },
                date: new Date(uploadedDoc.uploaded_at).toLocaleDateString(),
                document_id: uploadedDoc.id,
              }
            : template;
        });

        setDocuments(mergedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load project documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, phaseName]);

  // Handle file upload
  const handleUpload = async (index, file) => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    try {
      // Add file to localFiles for later processing during form submission
      setLocalFiles((prev) => [
        ...prev,
        {
          index,
          file,
          template_id: documents[index].id,
          phase: projectPhaseId, // Use phase ID for database storage
        },
      ]);

      // Update UI immediately
      const newDocs = [...documents];
      newDocs[index] = {
        ...newDocs[index],
        file: {
          name: file.name,
          // We don't have a URL yet as it's not uploaded to the server
        },
        date: new Date().toLocaleDateString(),
      };
      setDocuments(newDocs);

      toast.success(
        "File selected for upload. It will be uploaded when you save the project."
      );
    } catch (error) {
      console.error("Error preparing file for upload:", error);
      toast.error("Failed to prepare file for upload");
    }
  };

  // Handle file download
  const handleDownload = async (fileUrl, fileName) => {
    try {
      // For Supabase storage URLs, we can use them directly
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle file removal
  const handleRemove = async (index, documentId) => {
    if (!documentId) {
      // If the document hasn't been uploaded to the server yet, just remove it from localFiles
      setLocalFiles((prev) => prev.filter((file) => file.index !== index));

      // Update UI
      const newDocs = [...documents];
      newDocs[index] = {
        ...newDocs[index],
        file: null,
        date: null,
      };
      setDocuments(newDocs);
      return;
    }

    try {
      // Call API to delete the document from the server
      await axios.post(`/data-management/deleteProjectDocument`, {
        project_id: projectId,
        document_id: documentId,
      });

      // Update UI
      const newDocs = [...documents];
      newDocs[index] = {
        ...newDocs[index],
        file: null,
        date: null,
        document_id: null,
      };
      setDocuments(newDocs);

      // Remove from localFiles if it exists there
      setLocalFiles((prev) => prev.filter((file) => file.index !== index));

      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading documents...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-semibold mb-4">Project Documentation</h2>

      {documents.length === 0 ? (
        <p className="text-center text-gray-500 my-4">
          No document templates available for this phase.
        </p>
      ) : (
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
                    <Upload
                      className="text-blue-500 cursor-pointer"
                      size={20}
                      title="Upload document"
                    />
                  </label>

                  {doc.file && (
                    <>
                      {doc.file.url && (
                        <Download
                          className="text-green-500 cursor-pointer"
                          size={20}
                          onClick={() =>
                            handleDownload(doc.file.url, doc.file.name)
                          }
                          title="Download document"
                        />
                      )}
                      <X
                        className="text-red-500 cursor-pointer"
                        size={20}
                        onClick={() => handleRemove(index, doc.document_id)}
                        title="Remove document"
                      />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UpdateProjectDocumentSection;
