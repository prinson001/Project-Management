import { useForm } from "react-hook-form";
import { useState } from "react";
import { Upload, X } from "lucide-react";

const ProjectDocumentSection = () => {
  const { register, setValue, watch } = useForm();
  const [documents, setDocuments] = useState([
    { name: "Business case", required: true, file: "Business_case.doc", date: "5- May -23" },
    { name: "Request for Proposal", required: true, file: "RFP_version_Final.pdf", date: "5- May -23" },
    { name: "Execution phase closure", required: true, file: "", date: "" },
    { name: "Contract", required: true, file: "", date: "" },
    { name: "Technical evaluation", required: false, file: "", date: "" },
    { name: "Financial evaluation", required: false, file: "", date: "" },
  ]);

  const handleUpload = (index, file) => {
    const newDocs = [...documents];
    newDocs[index].file = file.name;
    newDocs[index].date = new Date().toLocaleDateString();
    setDocuments(newDocs);
  };

  const handleRemove = (index) => {
    const newDocs = [...documents];
    newDocs[index].file = "";
    newDocs[index].date = "";
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
              <td className="p-2 border">{doc.required ? "Yes" : "Optional"}</td>
              <td className="p-2 border">{doc.file || "-"}</td>
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
      <div className="flex justify-between w-full mt-4">
        <button className="bg-blue-500 text-white px-6 py-2 rounded w-1/4 cursor-pointer">Save as draft</button>
        <button className="bg-green-500 text-white px-6 py-2 rounded w-1/4 cursor-pointer">Save and send for approval</button>
        <button className="bg-red-300 text-white px-4 py-3 rounded w-1/4 cursor-pointer">Clear fields</button>
      </div>
    </div>
  );
};

export default ProjectDocumentSection;
