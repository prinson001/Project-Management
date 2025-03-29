import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Loader } from "lucide-react";

function DocumentTemplateAccordion({ data }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) {
    return (
      <div className="flex justify-center items-center py-12 dark:text-gray-300">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading document template data...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Accordion Header */}
      <div
        className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="text-blue-600 dark:text-blue-400" size={20} />
        ) : (
          <ChevronRight
            className="text-blue-600 dark:text-blue-400"
            size={20}
          />
        )}
        <FileText className="ml-2 text-blue-600 dark:text-blue-400" size={20} />
        <h2 className="ml-2 font-semibold dark:text-gray-200">
          Document Template: {data.name}
        </h2>
      </div>

      {/* Accordion Content */}
      {expanded && (
        <div className="p-4 overflow-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                {[
                  "ID",
                  "Name",
                  "Arabic Name",
                  "Description",
                  "Capex",
                  "Opex",
                  "Internal",
                  "External",
                  "Phase",
                  "Document Path",
                  "Document Name",
                  "Document URL",
                  "Required",
                  "Created At",
                  "Updated At",
                ].map((header) => (
                  <th key={header} className="border p-2 dark:text-gray-300">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className="border p-2">{data.id}</td>
                <td className="border p-2">{data.name}</td>
                <td className="border p-2" dir="rtl">
                  {data.arabic_name}
                </td>
                <td className="border p-2">{data.description}</td>
                <td className="border p-2">{data.is_capex ? "Yes" : "No"}</td>
                <td className="border p-2">{data.is_opex ? "Yes" : "No"}</td>
                <td className="border p-2">
                  {data.is_internal ? "Yes" : "No"}
                </td>
                <td className="border p-2">
                  {data.is_external ? "Yes" : "No"}
                </td>
                <td className="border p-2">{data.phase}</td>
                <td className="border p-2">{data.document_path}</td>
                <td className="border p-2">{data.document_name}</td>
                <td className="border p-2">
                  <a
                    href={data.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open
                  </a>
                </td>
                <td className="border p-2">{data.isrequired ? "Yes" : "No"}</td>
                <td className="border p-2">
                  {new Date(data.created_at).toLocaleString()}
                </td>
                <td className="border p-2">
                  {new Date(data.updated_at).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DocumentTemplateAccordion;
