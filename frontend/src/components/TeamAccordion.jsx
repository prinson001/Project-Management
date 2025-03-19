import React, { useEffect, useState } from "react";
import axios from "axios"; // Make sure to install axios

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
      console.log("the data recived", data);
      try {
        const response = await axios.post(
          "http://localhost:4001/data-management/getUserRelatedEntities",
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
    <div
      style={{
        display: "flex",
        gap: "16px",
        height: "500px",
        padding: "16px",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Portfolios Column */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "16px",
          overflowY: "auto",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Portfolios ({data.portfolios.length})</h3>
        {data.portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            style={{
              padding: "8px",
              margin: "8px 0",
              border: "1px solid #eee",
              borderRadius: "4px",
            }}
          >
            <strong>{portfolio.name}</strong>
            <p>{portfolio.description}</p>
          </div>
        ))}
        {data.portfolios.length === 0 && <p>No portfolios found</p>}
      </div>

      {/* Programs Column */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "16px",
          overflowY: "auto",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Programs ({data.programs.length})</h3>
        {data.programs.map((program) => (
          <div
            key={program.id}
            style={{
              padding: "8px",
              margin: "8px 0",
              border: "1px solid #eee",
              borderRadius: "4px",
            }}
          >
            <strong>{program.name}</strong>
            <p>{program.description}</p>
          </div>
        ))}
        {data.programs.length === 0 && <p>No programs found</p>}
      </div>

      {/* Projects Column */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "16px",
          overflowY: "auto",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Projects ({data.projects.length})</h3>
        {data.projects.map((project) => (
          <div
            key={project.id}
            style={{
              padding: "8px",
              margin: "8px 0",
              border: "1px solid #eee",
              borderRadius: "4px",
            }}
          >
            <strong>{project.name}</strong>
            <p>{project.description}</p>
          </div>
        ))}
        {data.projects.length === 0 && <p>No projects found</p>}
      </div>
    </div>
  );
}

export default TeamAccordion;
