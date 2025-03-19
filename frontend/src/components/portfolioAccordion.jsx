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

function PortfolioAccordion({ data, title }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [expandedInitiative, setExpandedInitiative] = useState(true);
  const [expandedPortfolio, setExpandedPortfolio] = useState(true);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRelatedRecords = async () => {
    if (!data || !data.id) {
      setError("No portfolio data provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getPortfolioWithRelatedData",
        {
          portfolioId: data.id,
        }
      );

      const fetchedData = result.data.result;
      setPortfolioData(fetchedData);

      // Initialize program expand states
      const programStates = {};
      if (fetchedData?.programs?.length > 0) {
        fetchedData.programs.forEach((program) => {
          programStates[program.id] = false;
        });
      }
      setExpandedPrograms(programStates);
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

  const toggleProgramExpand = (programId) => {
    setExpandedPrograms({
      ...expandedPrograms,
      [programId]: !expandedPrograms[programId],
    });
  };

  const getRelatedProjects = (programId) => {
    return (
      portfolioData?.projects?.filter(
        (project) => project.program_id === programId
      ) || []
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading portfolio hierarchy...</span>
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
  if (!portfolioData) {
    return <div className="text-center py-4">No portfolio data available</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {/* Initiative Section - if there is an initiative */}
      {portfolioData.initiative && (
        <div className="border-b">
          <div
            className="flex items-center p-4 bg-blue-50 cursor-pointer"
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
              {portfolioData.initiative.name ||
                `Initiative ${portfolioData.initiative.id}`}
            </h2>
          </div>

          {expandedInitiative && (
            <div className="p-4">
              <UpdateDynamicForm
                isEmbedded={true}
                title=""
                tableName="initiative"
                data={portfolioData.initiative}
                viewData={true}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Portfolio Section */}
      <div className="border-b">
        <div
          className="flex items-center p-4 bg-amber-50 cursor-pointer"
          onClick={togglePortfolioExpand}
        >
          {expandedPortfolio ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
          <FolderOpen className="ml-2 text-amber-600" size={20} />
          <h2 className="text-lg font-semibold ml-2">
            {title ||
              `Portfolio: ${
                portfolioData.portfolio.name || portfolioData.portfolio.id
              }`}
          </h2>
        </div>

        {expandedPortfolio && (
          <div className="p-4">
            <UpdateDynamicForm
              isEmbedded={true}
              title=""
              tableName="portfolio"
              data={portfolioData.portfolio}
              viewData={true}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Programs Section */}
      <div className="ml-6">
        <h3 className="font-semibold p-2 text-gray-700">
          Programs ({portfolioData.programs?.length || 0})
        </h3>

        {portfolioData.programs?.length > 0 ? (
          portfolioData.programs.map((program) => (
            <div key={program.id} className="mb-2 border rounded-md">
              <div
                className="flex items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleProgramExpand(program.id)}
              >
                {expandedPrograms[program.id] ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                <Archive className="ml-2 text-purple-600" size={18} />
                <h4 className="font-medium ml-2">
                  {program.name || `Program ${program.id}`}
                </h4>
              </div>

              {expandedPrograms[program.id] && (
                <div className="p-3">
                  <UpdateDynamicForm
                    isEmbedded={true}
                    title=""
                    tableName="program"
                    data={program}
                    viewData={true}
                    className="w-full"
                  />

                  {/* Projects under this program */}
                  <div className="ml-4 mt-3">
                    <h5 className="font-semibold text-sm text-gray-700">
                      Projects ({getRelatedProjects(program.id).length})
                    </h5>

                    {getRelatedProjects(program.id).length > 0 ? (
                      getRelatedProjects(program.id).map((project) => (
                        <div
                          key={project.id}
                          className="mt-2 border rounded-md"
                        >
                          <div className="flex items-center p-2">
                            <FileText className="text-green-600" size={16} />
                            <h6 className="font-medium ml-2 text-sm">
                              {project.name || `Project ${project.id}`}
                            </h6>
                          </div>

                          <div className="p-2">
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
                      <div className="text-sm text-gray-500 p-1">
                        No projects found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 p-2">No programs found</div>
        )}
      </div>
    </div>
  );
}

export default PortfolioAccordion;
