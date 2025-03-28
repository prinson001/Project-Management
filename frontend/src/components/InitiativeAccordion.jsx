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
    if (!data?.id) {
      setError("No initiative ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await axiosInstance.post(
        "/data-management/getInitiativeWithRelatedData",
        { initiativeId: data.id }
      );

      const fetchedData = result.data?.result;
      setInitiativeData(fetchedData);

      // Initialize portfolio expand states
      const portfolioStates = {};
      fetchedData?.portfolios?.forEach((portfolio) => {
        portfolioStates[portfolio.id] = false;
      });
      setExpandedPortfolios(portfolioStates);

      // Initialize program expand states
      const programStates = {};
      fetchedData?.programs?.forEach((program) => {
        programStates[program.id] = false;
      });
      setExpandedPrograms(programStates);
    } catch (e) {
      console.error("API Error:", e);
      setError(e.message || "Failed to load initiative structure");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRelatedRecords();
  }, [data?.id]);

  const toggleSection = (section, id = null) => {
    if (section === "initiative") {
      setExpandedInitiative(!expandedInitiative);
    } else if (section === "portfolios") {
      setExpandedPortfolios((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } else if (section === "programs") {
      setExpandedPrograms((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const getProgramsForPortfolio = (portfolioId) => {
    return (
      initiativeData?.programs?.filter(
        (program) => program.portfolio_id === portfolioId
      ) || []
    );
  };

  const getProjectsForProgram = (programId) => {
    return (
      initiativeData?.projects?.filter(
        (project) => project.program_id === programId
      ) || []
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin mr-2" size={24} />
        <span>Loading initiative data...</span>
      </div>
    );
  }

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

  if (!initiativeData) {
    return (
      <div className="text-center py-4">
        No initiative data available. Try refreshing the page.
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Initiative Section */}
      <div className="border-b dark:border-gray-700">
        <div
          className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/30 cursor-pointer"
          onClick={() => toggleSection("initiative")}
        >
          {expandedInitiative ? (
            <ChevronDown size={20} className="dark:text-gray-200" />
          ) : (
            <ChevronRight size={20} className="dark:text-gray-200" />
          )}
          <Layers className="ml-2 text-blue-600 dark:text-blue-400" size={20} />
          <h2 className="text-lg font-semibold ml-2 dark:text-gray-200">
            {title}
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
      <div className="p-4">
        {initiativeData.portfolios?.length > 0 ? (
          initiativeData.portfolios.map((portfolio) => (
            <div key={portfolio.id} className="mb-4">
              <div
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer"
                onClick={() => toggleSection("portfolios", portfolio.id)}
              >
                {expandedPortfolios[portfolio.id] ? (
                  <ChevronDown size={18} className="dark:text-gray-200" />
                ) : (
                  <ChevronRight size={18} className="dark:text-gray-200" />
                )}
                <FolderOpen
                  className="ml-2 text-amber-600 dark:text-amber-400"
                  size={18}
                />
                <div className="ml-2">
                  <h3 className="font-medium dark:text-gray-200">
                    {portfolio.name || `Portfolio ${portfolio.id}`}
                  </h3>
                  {portfolio.arabic_name && (
                    <p className="text-sm mt-1" dir="rtl">
                      {portfolio.arabic_name}
                    </p>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  ({getProgramsForPortfolio(portfolio.id).length} programs)
                </span>
              </div>

              {expandedPortfolios[portfolio.id] && (
                <div className="ml-6 mt-2">
                  {getProgramsForPortfolio(portfolio.id).length > 0 ? (
                    getProgramsForPortfolio(portfolio.id).map((program) => (
                      <div key={program.id} className="mb-2">
                        <div
                          className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer"
                          onClick={() => toggleSection("programs", program.id)}
                        >
                          {expandedPrograms[program.id] ? (
                            <ChevronDown
                              size={16}
                              className="dark:text-gray-200"
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                              className="dark:text-gray-200"
                            />
                          )}
                          <Archive
                            className="ml-2 text-purple-600 dark:text-purple-400"
                            size={16}
                          />
                          <div className="ml-2">
                            <h4 className="text-sm font-medium dark:text-gray-200">
                              {program.name || `Program ${program.id}`}
                            </h4>
                            {program.arabic_name && (
                              <p className="text-xs mt-1" dir="rtl">
                                {program.arabic_name}
                              </p>
                            )}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            ({getProjectsForProgram(program.id).length}{" "}
                            projects)
                          </span>
                        </div>

                        {expandedPrograms[program.id] && (
                          <div className="ml-6 mt-2">
                            {getProjectsForProgram(program.id).length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {getProjectsForProgram(program.id).map(
                                  (project) => (
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
                                              {project.name ||
                                                "Project Name N/A"}
                                            </h3>
                                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-300">
                                              (ID: {project.id})
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
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                                No projects found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 p-2">
                      No programs found in this portfolio
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 p-2">
            No portfolios found
          </div>
        )}
      </div>
    </div>
  );
}

export default InitiativeAccordion;
