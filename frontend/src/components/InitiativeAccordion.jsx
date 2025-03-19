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

function InitiativeAccordion({ data, title }) {
  const [initiativeData, setInitiativeData] = useState(null);
  const [expandedInitiative, setExpandedInitiative] = useState(true);
  const [expandedPortfolios, setExpandedPortfolios] = useState({});
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRelatedRecords = async () => {
    if (!data || !data.id) {
      setError("No initiative data provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getInitiativeWithRelatedData",
        {
          initiativeId: data.id,
        }
      );

      const fetchedData = result.data.result;
      setInitiativeData(fetchedData);

      // Initialize portfolio expand states
      if (fetchedData?.portfolios?.length > 0) {
        const portfolioStates = {};
        fetchedData.portfolios.forEach((portfolio) => {
          portfolioStates[portfolio.id] = false;
        });
        setExpandedPortfolios(portfolioStates);

        // Initialize program expand states
        const programStates = {};
        fetchedData.programs.forEach((program) => {
          programStates[program.id] = false;
        });
        setExpandedPrograms(programStates);
      }
    } catch (e) {
      console.error("Error fetching related data:", e);
      setError("Failed to load related records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRelatedRecords();
  }, [data?.id]); // Only re-fetch when the initiative ID changes

  const toggleInitiativeExpand = () => {
    setExpandedInitiative(!expandedInitiative);
  };

  const togglePortfolioExpand = (portfolioId) => {
    setExpandedPortfolios({
      ...expandedPortfolios,
      [portfolioId]: !expandedPortfolios[portfolioId],
    });
  };

  const toggleProgramExpand = (programId) => {
    setExpandedPrograms({
      ...expandedPrograms,
      [programId]: !expandedPrograms[programId],
    });
  };

  const getRelatedPrograms = (portfolioId) => {
    return (
      initiativeData?.programs?.filter(
        (program) => program.portfolio_id === portfolioId
      ) || []
    );
  };

  const getRelatedProjects = (programId) => {
    return (
      initiativeData?.projects?.filter(
        (project) => project.program_id === programId
      ) || []
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading initiative hierarchy...</span>
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
  if (!initiativeData) {
    return <div className="text-center py-4">No initiative data available</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      {/* Initiative Section */}
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
            {title || "Initiative Details"}
          </h2>
        </div>

        {expandedInitiative && (
          <div className="p-4">
            <UpdateDynamicForm
              isEmbedded={true}
              title=""
              tableName="initiative"
              data={initiativeData.initiative}
              viewData={true}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Portfolios Section */}
      <div className="ml-6">
        <h3 className="font-semibold p-2 text-gray-700">
          Portfolios ({initiativeData.portfolios?.length || 0})
        </h3>

        {initiativeData.portfolios?.length > 0 ? (
          initiativeData.portfolios.map((portfolio) => (
            <div key={portfolio.id} className="mb-2 border rounded-md">
              <div
                className="flex items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => togglePortfolioExpand(portfolio.id)}
              >
                {expandedPortfolios[portfolio.id] ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                <FolderOpen className="ml-2 text-amber-600" size={18} />
                <h4 className="font-medium ml-2">
                  {portfolio.name || `Portfolio ${portfolio.id}`}
                </h4>
              </div>

              {expandedPortfolios[portfolio.id] && (
                <div className="p-3">
                  <UpdateDynamicForm
                    isEmbedded={true}
                    title=""
                    tableName="portfolio"
                    data={portfolio}
                    viewData={true}
                    className="w-full"
                  />

                  {/* Programs under this portfolio */}
                  <div className="ml-4 mt-3">
                    <h5 className="font-semibold text-sm text-gray-700">
                      Programs ({getRelatedPrograms(portfolio.id).length})
                    </h5>

                    {getRelatedPrograms(portfolio.id).length > 0 ? (
                      getRelatedPrograms(portfolio.id).map((program) => (
                        <div
                          key={program.id}
                          className="mt-2 border rounded-md"
                        >
                          <div
                            className="flex items-center p-2 bg-gray-50 cursor-pointer"
                            onClick={() => toggleProgramExpand(program.id)}
                          >
                            {expandedPrograms[program.id] ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            <Archive
                              className="ml-2 text-purple-600"
                              size={16}
                            />
                            <h6 className="font-medium ml-2 text-sm">
                              {program.name || `Program ${program.id}`}
                            </h6>
                          </div>

                          {expandedPrograms[program.id] && (
                            <div className="p-2">
                              <UpdateDynamicForm
                                isEmbedded={true}
                                title=""
                                tableName="program" // Changed from "program" to match backend table name
                                data={program}
                                viewData={true}
                                className="w-full"
                              />

                              {/* Projects under this program */}
                              <div className="ml-4 mt-2">
                                <h6 className="font-semibold text-xs text-gray-700">
                                  Projects (
                                  {getRelatedProjects(program.id).length})
                                </h6>

                                {getRelatedProjects(program.id).length > 0 ? (
                                  getRelatedProjects(program.id).map(
                                    (project) => (
                                      <div
                                        key={project.id}
                                        className="mt-1 border rounded-md p-2"
                                      >
                                        <div className="flex items-center">
                                          <FileText
                                            className="text-green-600"
                                            size={14}
                                          />
                                          <span className="ml-2 text-sm">
                                            {project.name ||
                                              `Project ${project.id}`}
                                          </span>
                                        </div>
                                        <div className="mt-1">
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
                                    )
                                  )
                                ) : (
                                  <div className="text-xs text-gray-500 p-1">
                                    No projects found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-1">
                        No programs found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 p-2">No portfolios found</div>
        )}
      </div>
    </div>
  );
}

export default InitiativeAccordion;
