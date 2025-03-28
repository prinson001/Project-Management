import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import UpdateProjectModal from "./UpdateProjectModal"; // Import your UpdateProjectModal
import { ChevronDown, ChevronRight, FileText, Loader } from "lucide-react";

function ProjectAccordion({ data, title, projectType }) {
  const [projectData, setProjectData] = useState(null);
  const [expandedProject, setExpandedProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details
  const getProjectDetails = async () => {
    if (!data?.id) {
      setError("No project ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getProjectDetails",
        { projectId: data.id }
      );

      const fetchedData = result.data?.result;
      setProjectData(fetchedData);
    } catch (e) {
      console.error("API Error:", e);
      setError(e.message || "Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProjectDetails();
  }, [data?.id]);

  const toggleSection = () => {
    setExpandedProject(!expandedProject);
  };

  const handleProjectUpdate = (updatedData) => {
    // Update projectData with the new data from UpdateProjectModal
    setProjectData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading project data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
        <button
          onClick={getProjectDetails}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="text-center py-4">
        No project data available. Try refreshing the page.
      </div>
    );
  }

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
            {title || projectData.name || `Project ${projectData.id}`}
          </h2>
          {projectData.arabic_name && (
            <p
              className="ml-2 text-sm text-gray-600 dark:text-gray-300"
              dir="rtl"
            >
              {projectData.arabic_name}
            </p>
          )}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            (ID: {projectData.id})
          </span>
        </div>

        {expandedProject && (
          <div className="p-4">
            <UpdateProjectModal
              isEmbedded={true}
              projectData={projectData}
              projectType={
                projectType || projectData.project_type_id?.toString()
              } // Assuming project_type_id exists
              onSubmit={handleProjectUpdate}
              // Pass any additional props required by UpdateProjectModal (e.g., users, portfolios)
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectAccordion;
