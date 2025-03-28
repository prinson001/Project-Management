import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  FolderOpen,
  Archive,
  FileText,
  Loader,
} from "lucide-react";

function ProgramAccordion({ data }) {
  const [programData, setProgramData] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRelatedRecords = async () => {
    if (!data?.id) {
      setError("No program ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getProgramWithRelatedData",
        { programId: data.id }
      );

      const fetchedData = result.data?.result;

      const processedData = {
        ...fetchedData,
        projects: (fetchedData.projects || []).filter(
          (project) => project.program_id === fetchedData.program.id
        ),
      };

      setProgramData(processedData);
    } catch (e) {
      console.error("API Error:", e);
      setError(e.message || "Failed to load program data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRelatedRecords();
  }, [data?.id]);

  const renderProjectBox = (project) => (
    <div
      key={project.id}
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
              {project.name || "Project Name N/A"}
            </h3>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-300">
              (ID: {project.id})
            </span>
          </div>
          {project.arabic_name && (
            <div className="text-sm text-gray-600 dark:text-gray-300" dir="rtl">
              {project.arabic_name}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 dark:text-gray-300">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading program data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500 dark:text-red-400">
        <p>{error}</p>
        <button
          onClick={getRelatedRecords}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="text-center py-4 dark:text-gray-300">
        No program data available
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Initiative Name */}
      {programData.initiative && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Layers
              className="mr-2 text-blue-600 dark:text-blue-400"
              size={18}
            />
            <div className="flex-1">
              <p className="font-medium">
                Initiative: {programData.initiative.name}
              </p>
              {programData.initiative.arabic_name && (
                <p className="text-sm mt-1" dir="rtl">
                  {programData.initiative.arabic_name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Name */}
      {programData.portfolio && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FolderOpen
              className="mr-2 text-amber-600 dark:text-amber-400"
              size={18}
            />
            <div className="flex-1">
              <p className="font-medium">
                Portfolio: {programData.portfolio.name}
              </p>
              {programData.portfolio.arabic_name && (
                <p className="text-sm mt-1" dir="rtl">
                  {programData.portfolio.arabic_name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Program Section */}
      <div className="border-b dark:border-gray-700">
        <div
          className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => setExpandedProgram(!expandedProgram)}
        >
          {expandedProgram ? (
            <ChevronDown
              className="text-purple-600 dark:text-purple-400"
              size={20}
            />
          ) : (
            <ChevronRight
              className="text-purple-600 dark:text-purple-400"
              size={20}
            />
          )}
          <Archive
            className="ml-2 text-purple-600 dark:text-purple-400"
            size={20}
          />
          <div className="ml-2 flex-1">
            <h2 className="font-semibold dark:text-gray-200">
              Program: {programData.program.name}
            </h2>
            {programData.program.arabic_name && (
              <p className="text-sm mt-1" dir="rtl">
                {programData.program.arabic_name}
              </p>
            )}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            ({programData.projects?.length || 0} projects)
          </span>
        </div>

        {expandedProgram && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {programData.projects?.length > 0 ? (
                programData.projects.map(renderProjectBox)
              ) : (
                <div className="col-span-full text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
                  No projects found in this program
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramAccordion;
