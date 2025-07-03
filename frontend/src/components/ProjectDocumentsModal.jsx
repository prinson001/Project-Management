import React, { useState, useEffect } from "react";
import { X, Upload, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
import useAuthStore from "../store/authStore";

const ProjectDocumentsModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName,
  currentPhase 
}) => {
  const [documents, setDocuments] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const { projectPhases } = useAuthStore();

  useEffect(() => {
    if (isOpen && projectId && currentPhase) {
      fetchDocumentTemplates();
    }
  }, [isOpen, projectId, currentPhase]);

  const fetchDocumentTemplates = async () => {
    setLoading(true);
    try {
      // Get current phase name
      const phase = projectPhases.find(p => p.id === currentPhase);
      if (!phase) {
        toast.error("Invalid project phase");
        return;
      }

      const response = await axiosInstance.post(
        "/data-management/getCurrentPhaseDocumentTemplates",
        { phase: phase.name }
      );

      if (response.data.status === "success") {
        setDocuments(response.data.data.map(doc => ({
          id: doc.id,
          name: doc.name,
          arabic_name: doc.arabic_name,
          isrequired: doc.isrequired,
          file: null,
          filename: null,
          date: null,
          uploaded: false
        })));
      }
    } catch (error) {
      console.error("Error fetching document templates:", error);
      toast.error("Failed to load document templates");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (index, file) => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }

    setUploadingIndex(index);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      formData.append("template_id", documents[index].id);
      formData.append("phase", projectPhases.find(p => p.id === currentPhase)?.name || "");

      const response = await axiosInstance.post(
        "/data-management/addProjectDocument",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        const newDocs = [...documents];
        newDocs[index].file = file;
        newDocs[index].filename = file.name;
        newDocs[index].date = new Date().toLocaleDateString();
        newDocs[index].uploaded = true;
        setDocuments(newDocs);
        
        toast.success("Document uploaded successfully!");
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemove = (index) => {
    const newDocs = [...documents];
    newDocs[index].file = null;
    newDocs[index].filename = null;
    newDocs[index].date = null;
    newDocs[index].uploaded = false;
    setDocuments(newDocs);
    
    setLocalFiles(prev => prev.filter(file => file.index !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Project Documents</h2>
            <p className="text-gray-600">Upload documents for: {projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Document Name</th>
                  <th className="border p-3 text-left">Arabic Name</th>
                  <th className="border p-3 text-left">Required</th>
                  <th className="border p-3 text-left">File Name</th>
                  <th className="border p-3 text-left">Upload Date</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3">{doc.name}</td>
                    <td className="border p-3">{doc.arabic_name || "-"}</td>
                    <td className="border p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.isrequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.isrequired ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="border p-3">
                      {doc.filename || "-"}
                    </td>
                    <td className="border p-3">{doc.date || "-"}</td>
                    <td className="border p-3">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUpload(index, e.target.files[0])}
                            disabled={uploadingIndex === index}
                          />
                          {uploadingIndex === index ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Upload 
                              className="text-blue-500 hover:text-blue-700 transition-colors" 
                              size={20} 
                            />
                          )}
                        </label>
                        {doc.uploaded && (
                          <>
                            <button
                              onClick={() => handleRemove(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X size={20} />
                            </button>
                            <button className="text-green-500 hover:text-green-700 transition-colors">
                              <Eye size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsModal;
