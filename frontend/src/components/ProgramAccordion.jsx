import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import UpdateDynamicForm from "./UpdateDynamicForm";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  FolderOpen,
  Archive,
  FileText,
  Loader,
} from "lucide-react";

function ProgramAccordion({ data, title }) {
  const [programData, setProgramData] = useState(null);
  const [expandedInitiative, setExpandedInitiative] = useState(true);
  const [expandedPortfolio, setExpandedPortfolio] = useState(true);
  const [expandedProgram, setExpandedProgram] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRelatedRecords = async () => {
    if (!data || !data.id) {
      setError("No program data provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getProgramWithRelatedData",
        {
          programId: data.id,
        }
      );
      const fetchedData = result.data.result;
      setProgramData(fetchedData);
    } catch (e) {
      console.error("Error fetching related data:", e);
      setError("Failed to load related records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRelatedRecords();
  }, [data?.id]);

  const toggleInitiativeExpand = () => {
    setExpandedInitiative(!expandedInitiative);
  };

  const togglePortfolioExpand = () => {
    setExpandedPortfolio(!expandedPortfolio);
  };

  const toggleProgramExpand = () => {
    setExpandedProgram(!expandedProgram);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading program hierarchy...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
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

  // No data state
  if (!programData) {
    return <div className="text-center py-4">No program data available</div>;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
      {/* Initiative Section */}
      {programData.initiative && (
        <div className="border-b dark:border-gray-700">
          <div
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 cursor-pointer"
            onClick={toggleInitiativeExpand}
          >
            {expandedInitiative ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            <Layers className="ml-2 text-blue-600" size={20} />
            <h2 className="text-lg font-semibold ml-2">
              Initiative:{" "}
              {programData.initiative.name ||
                `Initiative ${programData.initiative.id}`}
            </h2>
          </div>

          {expandedInitiative && (
            <div className="p-4">
              <UpdateDynamicForm
                isEmbedded={true}
                title=""
                tableName="initiative"
                data={programData.initiative}
                viewData={true}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Portfolio Section */}
      {programData.portfolio && (
        <div className="border-b dark:border-gray-700">
          <div
            className="flex items-center p-4 bg-amber-50 dark:bg-amber-900 cursor-pointer"
            onClick={togglePortfolioExpand}
          >
            {expandedPortfolio ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            <FolderOpen className="ml-2 text-amber-600" size={20} />
            <h2 className="text-lg font-semibold ml-2">
              Portfolio:{" "}
              {programData.portfolio.name ||
                `Portfolio ${programData.portfolio.id}`}
            </h2>
          </div>

          {expandedPortfolio && (
            <div className="p-4">
              <UpdateDynamicForm
                isEmbedded={true}
                title=""
                tableName="portfolio"
                data={programData.portfolio}
                viewData={true}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Program Section */}
      <div className="border-b dark:border-gray-700">
        <div
          className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 cursor-pointer"
          onClick={toggleProgramExpand}
        >
          {expandedProgram ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
          <Archive className="ml-2 text-purple-600" size={20} />
          <h2 className="text-lg font-semibold ml-2">
            Program:{" "}
            {programData.program.name || `Program ${programData.program.id}`}
          </h2>
        </div>

        {expandedProgram && (
          <div className="p-4">
            <UpdateDynamicForm
              isEmbedded={true}
              title=""
              tableName="program"
              data={programData.program}
              viewData={true}
              className="w-full"
            />

            {/* Projects Section */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-gray-700">
                Projects ({programData.projects?.length || 0})
              </h3>

              {programData.projects?.length > 0 ? (
                programData.projects.map((project) => (
                  <div key={project.id} className="mb-3 border rounded-md">
                    <div className="flex items-center p-3 bg-gray-50">
                      <FileText className="text-green-600" size={18} />
                      <h4 className="font-medium ml-2 text-sm">
                        {project.name || `Project ${project.id}`}
                      </h4>
                    </div>

                    <div className="p-3">
                      <UpdateDynamicForm
                        isEmbedded={true}
                        title=""
                        tableName="project"
                        data={project}
                        viewData={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2">
                  No projects found
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
