import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { FileText } from "lucide-react"; // Ensure FileText is imported

function DepartmentAccordion({ departmentId }) {
  const [projects, setProjects] = useState([]);

  const getRelatedProjects = async () => {
    try {
      console.log("The department ID:", departmentId);
      const result = await axiosInstance.post(
        "/data-management/getDepartmentProjects",
        { departmentId }
      );
      console.log("The result:", result);
      setProjects(result.data.result || []);
    } catch (e) {
      console.error("There was an error getting the projects:", e);
    }
  };

  useEffect(() => {
    if (departmentId) {
      getRelatedProjects();
    }
  }, [departmentId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {projects.map((project) => (
        <div
          key={project.project_id} // Use correct key
          className="p-4 border rounded-lg mb-4 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                <FileText
                  className="mr-2 text-green-600 dark:text-green-400"
                  size={16}
                />
                <h3 className="font-medium dark:text-gray-200">
                  {project.project_name || "Project Name N/A"}
                </h3>
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-300">
                  (ID: {project.project_id})
                </span>
              </div>
              {project.arabic_name && (
                <div
                  className="text-sm text-gray-600 dark:text-gray-300"
                  dir="rtl"
                >
                  {project.arabic_name}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DepartmentAccordion;
