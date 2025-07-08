import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";
import { Eye, CheckCircle, XCircle, Calendar, DollarSign, User, Building, Target, FileText, X } from "lucide-react";

function ProjectCreationAccordion({ project, closeAccordion }) {
  const [projectData, setProjectData] = useState(null);
  const [projectApproval, setProjectApproval] = useState("null");
  const [isDataReady, setIsDataReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedProgramDetails, setSelectedProgramDetails] = useState(null);
  
  const { users, projectTypes, projectPhases, setDocuments, documents, setUsers, setProjectTypes, setProjectPhases } =
    useAuthStore();

  const fetchFullProjectData = async () => {
    try {
      setIsDataReady(false);

      // Ensure auth store data is loaded
      await Promise.all([
        fetchAuthStoreData(),
        fetchPrograms(),
        fetchPortfolios(),
        fetchInitiatives(),
        fetchVendors(),
      ]);

      // Fetch approval status if needed
      if (project.status === "Done") {
        const result = await axiosInstance.post(
          "/deputy/getProjectApprovalStatus",
          { projectId: project.related_entity_id }
        );
        setProjectApproval(result.data.approval_status);
      }

      // Fetch complete project details
      const response = await axiosInstance.post(
        "/tasks/getProjectWithAllRelatedData",
        {
          projectId: project.related_entity_id,
        }
      );

      const fullData = response.data.result;
      const fullProject = fullData.project;

      const modifiedProjectData = {
        ...fullProject,
        project_type_id: fullProject.project_type_id?.toString() || "",
        current_phase_id: fullProject.current_phase_id?.toString() || "",
        project_manager_id: fullProject.project_manager_id?.toString() || "",
        alternative_project_manager_id:
          fullProject.alternative_project_manager_id?.toString() || "",
        program_id: fullProject.program_id?.toString() || "",
        initiative_id: fullProject.initiative_id?.toString() || "",
        portfolio_id: fullProject.portfolio_id?.toString() || "",
        vendor_id: fullProject.vendor_id?.toString() || "",
        approval_status: projectApproval || fullProject.approval_status,
        beneficiary_departments: fullProject.beneficiary_departments || [],
        objectives: fullProject.objectives || [],
        documents: fullProject.documents || [],
        // Include related data
        program: fullData.program || {},
        portfolio: fullData.portfolio || {},
        initiative: fullData.initiative || {},
      };

      setProjectData(modifiedProjectData);
      
      // Set departments and objectives for display
      if (fullProject.beneficiary_departments) {
        setDepartments(fullProject.beneficiary_departments);
      }
      if (fullProject.objectives) {
        setObjectives(fullProject.objectives);
      }

      // Fetch program details if available
      if (fullProject.program_id) {
        await fetchProgramDetails(fullProject.program_id);
      }

      setIsDataReady(true);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setIsDataReady(false);
    }
  };

  const fetchAuthStoreData = async () => {
    try {
      // Fetch users if not already loaded
      if (!users || users.length === 0) {
        const usersResponse = await axiosInstance.get("/data-management/users");
        if (usersResponse.data.status === "success") {
          setUsers(usersResponse.data.result);
        }
      }

      // Fetch project types if not already loaded
      if (!projectTypes || projectTypes.length === 0) {
        const typesResponse = await axiosInstance.post("/data-management/getProjectTypes");
        if (typesResponse.data.status === "success") {
          setProjectTypes(typesResponse.data.result);
        }
      }

      // Fetch project phases if not already loaded
      if (!projectPhases || projectPhases.length === 0) {
        const phasesResponse = await axiosInstance.post("/data-management/getProjectPhases");
        if (phasesResponse.data.status === "success") {
          setProjectPhases(phasesResponse.data.result);
        }
      }
    } catch (error) {
      console.error("Error fetching auth store data:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axiosInstance.post("/data-management/getPrograms");
      if (response.data.status === "success") {
        setPrograms(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const response = await axiosInstance.post("/data-management/getPortfolios");
      if (response.data.status === "success") {
        setPortfolios(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    }
  };

  const fetchInitiatives = async () => {
    try {
      const response = await axiosInstance.post("/data-management/getInitiatives");
      if (response.data.status === "success") {
        setInitiatives(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching initiatives:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.post("/data-management/getVendors");
      if (response.data.status === "success") {
        setVendors(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchProgramDetails = async (programId) => {
    try {
      const response = await axiosInstance.post("/data-management/getProgram", {
        id: programId,
      });
      if (response.data.status === "success") {
        setSelectedProgramDetails(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  };

  useEffect(() => {
    if (project) {
      fetchFullProjectData();
    }
  }, [project]);

  const updateApprovalStatus = async ({ status, projectData }) => {
    console.log("the project status passed is " + status);
    console.log("updating approval status:", projectData);
    if (!projectData?.id) {
      console.error("Project ID is missing");
      return;
    }

    try {
      // First update the project approval status
      const approvalResponse = await axiosInstance.post(
        `/deputy/updateApprovalStatus`,
        {
          id: projectData.id,
          approval: status,
        }
      );

      if (approvalResponse.data.status === "success") {
        // Then update the task status to done
        const taskResponse = await axiosInstance.post(
          `/deputy/updateTaskStatusToDone`,
          {
            taskId: project.id,
          }
        );

        if (taskResponse.data.status === "success") {
          console.log(`Project status updated to: ${status}`);
          toast.success("Project status updated successfully");
          
          // Close accordion and refresh table after both operations are complete
          closeAccordion("Success ", "success");
        } else {
          console.error("Error updating task status:", taskResponse.data.message);
          toast.error("Error updating task status");
        }
      } else {
        console.error(approvalResponse.data.message);
        toast.error("Error updating project status");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Error updating project status");
    }
  };

  const handleApproveBtnClick = () => {
    updateApprovalStatus({ status: "Approved", projectData });
  };

  const handleRejectBtnClick = () => {
    console.log("reject button was clicked");
    updateApprovalStatus({ status: "Rejected", projectData });
  };

  // Helper functions for displaying data
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatExecutionDuration = (duration) => {
    if (!duration) return "N/A";
    
    // If duration is in time format like "00:00:21", convert to days
    if (typeof duration === 'string' && duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        
        // Convert to total hours
        const totalHours = hours + (minutes / 60) + (seconds / 3600);
        
        // Convert to days (assuming 8 working hours per day)
        const days = Math.ceil(totalHours / 24);
        
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
    
    // If duration is already a number or contains "days"/"weeks"
    if (typeof duration === 'string' && (duration.includes('day') || duration.includes('week'))) {
      return duration;
    }
    
    // If it's a number, assume it's in days
    if (typeof duration === 'number' || !isNaN(parseInt(duration))) {
      const days = parseInt(duration);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
    
    return duration; // Return as-is if we can't parse it
  };

  const getProjectTypeName = (typeId) => {
    const type = projectTypes.find(t => t.id.toString() === typeId?.toString());
    return type?.name || "Unknown";
  };

  const getProjectPhaseName = (phaseId) => {
    const phase = projectPhases.find(p => p.id.toString() === phaseId?.toString());
    // Try both 'name' and 'phase_name' properties
    return phase?.name || phase?.phase_name || "Unknown";
  };

  const getProjectManagerName = (managerId) => {
    if (!managerId) return "N/A";
    const manager = users.find(u => u.id.toString() === managerId?.toString());
    return manager ? `${manager.first_name} ${manager.family_name}` : "Unknown";
  };

  const getProgramName = (programId) => {
    if (!programId) return "N/A";
    const program = programs.find(p => p.id.toString() === programId?.toString());
    return program?.name || "Unknown";
  };

  const getPortfolioName = (portfolioId) => {
    if (!portfolioId) return "N/A";
    const portfolio = portfolios.find(p => p.id.toString() === portfolioId?.toString());
    return portfolio?.name || "Unknown";
  };

  const getInitiativeName = (initiativeId) => {
    if (!initiativeId) return "N/A";
    const initiative = initiatives.find(i => i.id.toString() === initiativeId?.toString());
    return initiative?.name || "Unknown";
  };

  const getVendorName = (vendorId) => {
    if (!vendorId) return "N/A";
    const vendor = vendors.find(v => v.id.toString() === vendorId?.toString());
    return vendor?.name || "Unknown";
  };

  const getApprovalStatusBadge = (status) => {
    const statusColors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Waiting on deputy": "bg-yellow-100 text-yellow-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status || "N/A"}
      </span>
    );
  };

  const getBooleanBadge = (value, trueLabel = "Yes", falseLabel = "No") => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {value ? trueLabel : falseLabel}
      </span>
    );
  };

  if (!isDataReady || !projectData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading project details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Action Buttons Section */}
      <div className="flex justify-center gap-4 pb-4 border-b">
        {/* <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-200 flex items-center gap-2"
        >
          <Eye size={16} />
          View Full Details
        </button> */}
        
        {project.status !== "Done" && (
          <>
            <button
              onClick={handleRejectBtnClick}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-200 flex items-center gap-2"
            >
              <XCircle size={16} />
              Reject
            </button>
            <button
              onClick={handleApproveBtnClick}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-200 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Approve
            </button>
          </>
        )}
      </div>

      {/* Status Display for Completed Tasks */}
      {project.status === "Done" && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-lg">
            Project was{" "}
            <span
              className={
                projectApproval === "Rejected"
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              {projectApproval}
            </span>
          </p>
        </div>
      )}

      {/* Comprehensive Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Basic Information */}
        <div className="bg-white border rounded-lg">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <FileText className="text-blue-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {projectData.name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arabic Name</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {projectData.arabic_name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm min-h-[60px]">
                {projectData.description || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Type</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getProjectTypeName(projectData.project_type_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Phase</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getProjectPhaseName(projectData.current_phase_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {projectData.category || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Approval Status</label>
              <div className="mt-1 flex items-center">
                {getApprovalStatusBadge(projectData.approval_status)}
              </div>
            </div>
          </div>
        </div>

        {/* Management Information */}
        <div className="bg-white border rounded-lg">
          <div className="bg-purple-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <User className="text-purple-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Management</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Manager</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getProjectManagerName(projectData.project_manager_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alternative Project Manager</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getProjectManagerName(projectData.alternative_project_manager_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getVendorName(projectData.vendor_id)}
              </div>
            </div>
          </div>
        </div>

        {/* Project Categories */}
        <div className="bg-white border rounded-lg">
          <div className="bg-indigo-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <Building className="text-indigo-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Program</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {getProgramName(projectData.program_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {selectedProgramDetails?.portfolio_name || getPortfolioName(projectData.portfolio_id)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Initiative</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {selectedProgramDetails?.initiative_name || getInitiativeName(projectData.initiative_id)}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white border rounded-lg">
          <div className="bg-green-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-green-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Financial</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Budget</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                {formatCurrency(projectData.project_budget)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Approved Budget</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                {formatCurrency(projectData.approved_project_budget)}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="bg-white border rounded-lg lg:col-span-2">
          <div className="bg-orange-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <Calendar className="text-orange-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Execution Start Date</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {formatDate(projectData.execution_start_date)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Execution End Date</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {formatDate(projectData.execution_enddate)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Execution Duration</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {formatExecutionDuration(projectData.execution_duration)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maintenance Duration</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {formatDate(projectData.maintenance_duration)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Status */}
        <div className="bg-white border rounded-lg lg:col-span-2">
          <div className="bg-teal-50 px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <FileText className="text-teal-600" size={18} />
              <h3 className="text-lg font-semibold text-gray-900">Upload Status</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Documents Uploaded</label>
                <div className="mt-1 flex items-center">
                  {getBooleanBadge(projectData.project_documents_uploaded)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule Uploaded</label>
                <div className="mt-1 flex items-center">
                  {getBooleanBadge(projectData.project_schedule_uploaded)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficiary Departments */}
        {departments && departments.length > 0 && (
          <div className="bg-white border rounded-lg lg:col-span-2">
            <div className="bg-blue-50 px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <Building className="text-blue-600" size={18} />
                <h3 className="text-lg font-semibold text-gray-900">Beneficiary Departments ({departments.length})</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((dept, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-900">{dept.name || dept.department_name}</div>
                    {(dept.arabic_name || dept.arabic_department_name) && (
                      <div className="text-sm text-blue-700">{dept.arabic_name || dept.arabic_department_name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Objectives */}
        {objectives && objectives.length > 0 && (
          <div className="bg-white border rounded-lg lg:col-span-2">
            <div className="bg-red-50 px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <Target className="text-red-600" size={18} />
                <h3 className="text-lg font-semibold text-gray-900">Objectives ({objectives.length})</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objectives.map((objective, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-900">{objective.text || objective.name}</div>
                    {(objective.arabic_text || objective.arabic_name) && (
                      <div className="text-sm text-red-700">{objective.arabic_text || objective.arabic_name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for full details (if needed) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Complete Project Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Comprehensive project details view can be extended here with additional sections as needed.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectCreationAccordion;
