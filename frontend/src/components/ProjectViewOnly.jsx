import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axiosInstance";

const ProjectViewOnly = ({ projectData }) => {
  const [departments, setDepartments] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [beneficiaryDepartments, setBeneficiaryDepartments] = useState([]);
  const [projectObjectives, setProjectObjectives] = useState([]);
  
  const { users, projectTypes, projectPhases } = useAuthStore();

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axiosInstance.post("/data-management/getDepartments");
        if (deptResponse.data.status === "success") {
          setDepartments(deptResponse.data.result);
        }

        // Fetch initiatives
        const initResponse = await axiosInstance.post("/data-management/getInitiatives");
        if (initResponse.data.status === "success") {
          setInitiatives(initResponse.data.result);
        }

        // Fetch portfolios
        const portResponse = await axiosInstance.post("/data-management/getPortfolios");
        if (portResponse.data.status === "success") {
          setPortfolios(portResponse.data.result);
        }

        // Fetch programs
        const progResponse = await axiosInstance.post("/data-management/getPrograms");
        if (progResponse.data.status === "success") {
          setPrograms(progResponse.data.result);
        }

        // Fetch vendors
        const vendorResponse = await axiosInstance.post("/data-management/getVendors");
        if (vendorResponse.data.status === "success") {
          setVendors(vendorResponse.data.result);
        }

        // Fetch objectives
        const objResponse = await axiosInstance.post("/data-management/getObjectives");
        if (objResponse.data.status === "success") {
          setObjectives(objResponse.data.result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch project-specific data
  useEffect(() => {
    const fetchProjectSpecificData = async () => {
      if (!projectData?.id) return;

      try {
        // Fetch beneficiary departments
        const beneficiaryResponse = await axiosInstance.post(
          "/data-management/getBeneficiaryDepartmentsByProjectId",
          { projectId: projectData.id }
        );
        if (beneficiaryResponse.data.status === "success") {
          setBeneficiaryDepartments(beneficiaryResponse.data.result || []);
        }

        // Fetch project objectives
        const objectivesResponse = await axiosInstance.post(
          "/data-management/getProjectObjectives",
          { projectId: projectData.id }
        );
        if (objectivesResponse.data.status === "success") {
          setProjectObjectives(objectivesResponse.data.result || []);
        }
      } catch (error) {
        console.error("Error fetching project-specific data:", error);
      }
    };

    fetchProjectSpecificData();
  }, [projectData?.id]);

  // Helper functions to get names from IDs
  const getProjectTypeName = (id) => {
    const type = projectTypes.find(t => t.id === parseInt(id));
    return type?.name || "N/A";
  };

  const getPhaseName = (id) => {
    const phase = projectPhases.find(p => p.id === parseInt(id));
    return phase?.name || "N/A";
  };

  const getInitiativeName = (id) => {
    const initiative = initiatives.find(i => i.id === parseInt(id));
    return initiative?.name || "N/A";
  };

  const getPortfolioName = (id) => {
    const portfolio = portfolios.find(p => p.id === parseInt(id));
    return portfolio?.name || "N/A";
  };

  const getProgramName = (id) => {
    const program = programs.find(p => p.id === parseInt(id));
    return program?.name || "N/A";
  };

  const getVendorName = (id) => {
    const vendor = vendors.find(v => v.id === parseInt(id));
    return vendor?.name || "N/A";
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === parseInt(id));
    return user ? `${user.first_name} ${user.last_name}` : "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (!projectData) {
    return <div className="p-4 text-gray-500">No project data available</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {projectData.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Arabic Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100" dir="rtl">
                {projectData.arabic_name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {projectData.description || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {projectData.category || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Project Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Type
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getProjectTypeName(projectData.project_type_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Phase
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getPhaseName(projectData.current_phase_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Initiative
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getInitiativeName(projectData.initiative_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Portfolio
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getPortfolioName(projectData.portfolio_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Program
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getProgramName(projectData.program_id)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Management
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Manager
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getUserName(projectData.project_manager_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Alternative Project Manager
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getUserName(projectData.alternative_project_manager_id)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vendor
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getVendorName(projectData.vendor_id)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Budget & Timeline
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Budget
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatCurrency(projectData.project_budget)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Approved Budget
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatCurrency(projectData.approved_project_budget)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Execution Start Date
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(projectData.execution_start_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Execution Duration
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {projectData.execution_duration ? `${projectData.execution_duration} weeks` : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maintenance Duration
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(projectData.maintenance_duration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beneficiary Departments */}
      {beneficiaryDepartments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Beneficiary Departments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {beneficiaryDepartments.map((dept) => (
              <div
                key={dept.id}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
              >
                {dept.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Objectives */}
      {projectObjectives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Project Objectives
          </h3>
          <div className="space-y-2">
            {projectObjectives.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {obj.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Progress */}
      {(projectData.progress !== undefined || projectData.health) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Project Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectData.progress !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </label>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${projectData.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {projectData.progress}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {projectData.health && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Health Status
                </label>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      projectData.health === 'good'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : projectData.health === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {projectData.health.charAt(0).toUpperCase() + projectData.health.slice(1)}
                  </span>
                </div>
              </div>
            )}

            {projectData.totalDeliverables !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deliverables
                </label>
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                  {projectData.completedDeliverables || 0} / {projectData.totalDeliverables || 0} completed
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectViewOnly;
