import React, { useState } from "react";
import ProjectViewOnly from "./ProjectViewOnly";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

function ProjectAccordion({ data, title, projectType }) {
  const [expandedProject, setExpandedProject] = useState(false);

  const toggleSection = () => {
    setExpandedProject(!expandedProject);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Project Section */}
      <div className="border-b dark:border-gray-700">
        <div
          className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 cursor-pointer"
          onClick={toggleSection}
        >
          {expandedProject ? (
            <ChevronDown size={20} className="dark:text-gray-200" />
          ) : (
            <ChevronRight size={20} className="dark:text-gray-200" />
          )}
          <FileText
            className="ml-2 text-green-600 dark:text-green-400"
            size={20}
          />
          <h2 className="text-lg font-semibold ml-2 dark:text-gray-200">
            {title || data.name || `Project ${data.id}`}
          </h2>
          {data.arabic_name && (
            <p
              className="ml-2 text-sm text-gray-600 dark:text-gray-300"
              dir="rtl"
            >
              {data.arabic_name}
            </p>
          )}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            (ID: {data.id})
          </span>
        </div>

        {expandedProject && (
          <div className="p-4">
            <ProjectViewOnly projectData={data} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectAccordion;
