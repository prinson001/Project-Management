import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance"; // Make sure to install axiosInstance

function TeamAccordion({ datas }) {
  const [data, setData] = useState({
    portfolios: [],
    programs: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("the data recived", datas);
      try {
        const response = await axiosInstance.post(
          "/data-management/getUserRelatedEntities",
          {
            id: datas.id,
          }
        );
        setData(response.data.result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex gap-4 p-4 h-[300px] bg-gray-100 dark:bg-gray-800">
      {/* Portfolios Column */}
      <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 overflow-y-auto shadow-sm">
        <h3 className="text-gray-800 dark:text-gray-200">Portfolios ({data.portfolios.length})</h3>
        {data.portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="p-2 my-2 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            <strong className="text-gray-800 dark:text-gray-200">{portfolio.name}</strong>
            <p className="text-gray-600 dark:text-gray-300">{portfolio.description}</p>
          </div>
        ))}
        {data.portfolios.length === 0 && <p className="text-gray-600 dark:text-gray-400">No portfolios found</p>}
      </div>

      {/* Programs Column */}
      <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 overflow-y-auto shadow-sm">
        <h3 className="text-gray-800 dark:text-gray-200">Programs ({data.programs.length})</h3>
        {data.programs.map((program) => (
          <div
            key={program.id}
            className="p-2 my-2 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            <strong className="text-gray-800 dark:text-gray-200">{program.name}</strong>
            <p className="text-gray-600 dark:text-gray-300">{program.description}</p>
          </div>
        ))}
        {data.programs.length === 0 && <p className="text-gray-600 dark:text-gray-400">No programs found</p>}
      </div>

      {/* Projects Column */}
      <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 overflow-y-auto shadow-sm">
        <h3 className="text-gray-800 dark:text-gray-200">Projects ({data.projects.length})</h3>
        {data.projects.map((project) => (
          <div
            key={project.id}
            className="p-2 my-2 border border-gray-200 dark:border-gray-600 rounded-md"
          >
            <strong className="text-gray-800 dark:text-gray-200">{project.name}</strong>
            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
          </div>
        ))}
        {data.projects.length === 0 && <p className="text-gray-600 dark:text-gray-400">No projects found</p>}
      </div>
    </div>
  );
}

export default TeamAccordion;
