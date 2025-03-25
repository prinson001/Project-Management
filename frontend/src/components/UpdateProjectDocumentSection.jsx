import { useState, useEffect } from "react";
import { Upload, X, FileText, Download } from "lucide-react";
import axiosInstance from "../axiosInstance"; // Use axiosInstance for consistency
import { toast } from "sonner";

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
  const [error, setError] = useState(null);

  // Fetch both document templates and uploaded project documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId || !phaseName) {
        setError("Project ID or phase name is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch document templates for the current phase using phase name
        const templatesResponse = await axiosInstance.post(
          `/data-management/getCurrentPhaseDocumentTemplates`,
          { phase: phaseName }
        );
        if (templatesResponse.data.status !== "success") {
          throw new Error("Failed to fetch document templates");
        }
        const templates = templatesResponse.data.data || [];

        // Fetch uploaded project documents
        const projectDocsResponse = await axiosInstance.post(
          `/data-management/getProjectDocuments`,
          { project_id: projectId }
        );
        if (projectDocsResponse.data.status !== "success") {
          throw new Error("Failed to fetch project documents");
        }
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
                date: new Date(uploadedDoc.uploaded_at).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                ),
                document_id: uploadedDoc.id,
              }
            : { ...template, file: null, date: null, document_id: null };
        });

        setDocuments(mergedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to load project documents. Please try again.");
        toast.error("Failed to load project documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, phaseName]);

  // Handle file upload
  const handleUpload = (index, file) => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    try {
      // Validate file type and size (optional, adjust as needed)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and Word documents are allowed.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }

      // Add file to localFiles for later processing during form submission
      setLocalFiles((prev) => [
        ...prev.filter((f) => f.index !== index), // Remove any existing file at this index
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
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        document_id: null, // Reset document_id since this is a new file
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
    if (!fileUrl) {
      toast.error("No file URL available for download.");
      return;
    }

    try {
      // For Supabase storage URLs, we can use them directly
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle file removal
  const handleRemove = async (index, documentId) => {
    try {
      if (documentId) {
        // Call API to delete the document from the server
        const response = await axiosInstance.post(
          `/data-management/deleteProjectDocument`,
          {
            project_id: projectId,
            document_id: documentId,
          }
        );

        if (response.data.status !== "success") {
          throw new Error("Failed to delete document from server");
        }
      }

      // Remove from localFiles if it exists there
      setLocalFiles((prev) => prev.filter((file) => file.index !== index));

      // Update UI
      const newDocs = [...documents];
      newDocs[index] = {
        ...newDocs[index],
        file: null,
        date: null,
        document_id: null,
      };
      setDocuments(newDocs);

      toast.success("Document removed successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to remove document");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading documents...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Project Documentation
      </h2>

      {documents.length === 0 ? (
        <p className="text-center text-gray-500 my-4">
          No document templates available for this phase.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b font-semibold text-gray-700">
                  Document Name
                </th>
                <th className="p-3 border-b font-semibold text-gray-700">
                  Required
                </th>
                <th className="p-3 border-b font-semibold text-gray-700">
                  File Name
                </th>
                <th className="p-3 border-b font-semibold text-gray-700">
                  Uploaded Date
                </th>
                <th className="p-3 border-b font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-800">{doc.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        doc.isrequired
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {doc.isrequired ? "Yes" : "Optional"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-800">
                    {doc.file ? (
                      <span className="flex items-center gap-1">
                        <FileText size={16} className="text-blue-500" />
                        {doc.file.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3 text-gray-800">{doc.date || "-"}</td>
                  <td className="p-3 flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUpload(index, e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                      <Upload
                        className="text-blue-500 hover:text-blue-700"
                        size={20}
                        title="Upload document"
                      />
                    </label>

                    {doc.file && (
                      <>
                        {doc.file.url && (
                          <Download
                            className="text-green-500 hover:text-green-700 cursor-pointer"
                            size={20}
                            onClick={() =>
                              handleDownload(doc.file.url, doc.file.name)
                            }
                            title="Download document"
                          />
                        )}
                        <X
                          className="text-red-500 hover:text-red-700 cursor-pointer"
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
        </div>
      )}
    </div>
  );
};

export default UpdateProjectDocumentSection;
