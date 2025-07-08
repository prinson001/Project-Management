import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, ChevronDown, ChevronUp, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axiosInstance";
import ProjectDocumentsModal from "./ProjectDocumentsModal";
import ProjectSchedulePlanModal from "./ProjectSchedulePlanModal";

const UpdateProjectModal = ({
  onClose,
  projectData,
  onUpdate,
  showButtons = true,
  title = "Update Project",
  readOnly = false,
}) => {
  const [activeSection, setActiveSection] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [selectedProgramDetails, setSelectedProgramDetails] = useState(null);
  // State for document and schedule modals
  const [isProjectDocumentsModalOpen, setIsProjectDocumentsModalOpen] =
    useState(false);
  const [isProjectSchedulePlanModalOpen, setIsProjectSchedulePlanModalOpen] =
    useState(false);
  // Add placeholder states/functions to satisfy legacy schedule reset logic
  const [scheduleTableData, setScheduleTableData] = useState([]);
  const [internalScheduleDataState, setInternalScheduleDataState] = useState([]);
  const internalScheduleData = [];
  // Add states for upload tracking
  const [documentsUploadedSuccessfully, setDocumentsUploadedSuccessfully] = useState(
    projectData?.project_documents_uploaded === true
  );
  const [scheduleUploadedSuccessfully, setScheduleUploadedSuccessfully] = useState(
    projectData?.project_schedule_uploaded === true
  );
  
  // Debug initial upload state
  console.log("🏁 Initial upload state:", {
    projectData_documents: projectData?.project_documents_uploaded,
    projectData_schedule: projectData?.project_schedule_uploaded,
    documentsUploadedSuccessfully: projectData?.project_documents_uploaded === true,
    scheduleUploadedSuccessfully: projectData?.project_schedule_uploaded === true
  });
  // State to track approval task status
  const [approvalTaskExists, setApprovalTaskExists] = useState(false);
  const [approvalTaskInfo, setApprovalTaskInfo] = useState(null);
  // State to track if documents/schedule need refresh
  const [documentsRefreshTrigger, setDocumentsRefreshTrigger] = useState(0);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);

  const { users, projectTypes, projectPhases, setDocuments, documents } =
    useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: projectData?.id || "",
      name: projectData?.name || "",
      arabic_name: projectData?.arabic_name || "",
      description: projectData?.description || "",
      project_type_id: projectData?.project_type_id?.toString() || "",
      current_phase_id: projectData?.current_phase_id?.toString() || "",
      initiative_id: projectData?.initiative_id?.toString() || "",
      portfolio_id: projectData?.portfolio_id?.toString() || "",
      program_id: projectData?.program_id?.toString() || "",
      category: projectData?.category || "",
      project_manager_id: projectData?.project_manager_id?.toString() || "",
      alternative_project_manager_id:
        projectData?.alternative_project_manager_id?.toString() || "",
      vendor_id: projectData?.vendor_id?.toString() || "",
      beneficiaryDepartments: [],
      objectives: [],
      project_budget: projectData?.project_budget?.toString() || "",
      approved_budget: projectData?.approved_project_budget?.toString() || "",
      execution_start_date: {
        startDate: projectData?.execution_start_date
          ? new Date(projectData.execution_start_date)
          : null,
        endDate: projectData?.execution_start_date
          ? new Date(projectData.execution_start_date)
          : null,
      },
      execution_duration: projectData?.execution_duration
        ? parseInt(String(projectData.execution_duration).split(" ")[0])
        : "4", // Ensure execution_duration is treated as a string before split
      maintenance_duration: projectData?.maintenance_duration
        ? parseInt(String(projectData.maintenance_duration), 10)
        : 30,
      internal_start_date: {
        startDate: projectData?.execution_start_date
          ? new Date(projectData.execution_start_date)
          : null,
        endDate: projectData?.execution_start_date
          ? new Date(projectData.execution_start_date)
          : null,
      },
    },
  });

  // Reset form when projectData changes
  useEffect(() => {
    if (projectData) {
      reset({
        id: projectData?.id || "",
        name: projectData?.name || "",
        arabic_name: projectData?.arabic_name || "",
        description: projectData?.description || "",
        project_type_id: projectData?.project_type_id?.toString() || "",
        current_phase_id: projectData?.current_phase_id?.toString() || "",
        initiative_id: projectData?.initiative_id?.toString() || "",
        portfolio_id: projectData?.portfolio_id?.toString() || "",
        program_id: projectData?.program_id?.toString() || "",
        category: projectData?.category || "",
        project_manager_id: projectData?.project_manager_id?.toString() || "",
        alternative_project_manager_id:
          projectData?.alternative_project_manager_id?.toString() || "",
        vendor_id: projectData?.vendor_id?.toString() || "",
        beneficiaryDepartments: [],
        objectives: [],
        project_budget: projectData?.project_budget?.toString() || "",
        approved_budget: projectData?.approved_project_budget?.toString() || "",
        execution_start_date: {
          startDate: projectData?.execution_start_date
            ? new Date(projectData.execution_start_date)
            : null,
          endDate: projectData?.execution_start_date
            ? new Date(projectData.execution_start_date)
            : null,
        },
        execution_duration: projectData?.execution_duration
          ? parseInt(String(projectData.execution_duration).split(" ")[0])
          : "4",
        maintenance_duration: projectData?.maintenance_duration
          ? parseInt(String(projectData.maintenance_duration), 10)
          : 30,
        internal_start_date: {
          startDate: projectData?.execution_start_date
            ? new Date(projectData.execution_start_date)
            : null,
          endDate: projectData?.execution_start_date
            ? new Date(projectData.execution_start_date)
            : null,
        },
      });
      
      // Sync upload status with projectData changes
      console.log("🔄 Syncing upload status with projectData:", {
        project_documents_uploaded: projectData.project_documents_uploaded,
        project_schedule_uploaded: projectData.project_schedule_uploaded
      });
      
      setDocumentsUploadedSuccessfully(projectData.project_documents_uploaded === true);
      setScheduleUploadedSuccessfully(projectData.project_schedule_uploaded === true);
    }
  }, [projectData, reset]);

  const projectType = watch("project_type_id");
  const currentPhase = watch("current_phase_id");
  const selectedProgramId = watch("program_id");

  const projectManagers = useMemo(() => {
    return users.filter((user) => user.role_name === "PM");
  }, [users]);

  // Add filtered project phases similar to ProjectModal
  const filteredProjectPhases = useMemo(() => {
    if (!projectType) return projectPhases;
    
    const isInternal = projectType === "1";
    const isProofOfConcept = projectType === "4";
    
    if (isInternal || isProofOfConcept) {
      return projectPhases.filter(phase => 
        ["Implementation", "Maintenance", "Completed"].includes(phase.name)
      );
    }
    
    return projectPhases;
  }, [projectType, projectPhases]);

  const isVendorDisabled = useMemo(() => {
    const restrictedTypes = ["Internal Project", "Proof of Concept"];
    const currentType = projectTypes.find(
      (type) => type.id.toString() === projectType?.toString()
    );
    const isInPlanningBiddingPhase = ["1", "2"].includes(currentPhase);
    return restrictedTypes.includes(currentType?.name || "") || isInPlanningBiddingPhase;
  }, [projectType, projectTypes, currentPhase]);

  const isBudgetDisabled = useMemo(() => {
    const restrictedTypes = ["Internal Project", "Proof of Concept"];
    const currentType = projectTypes.find(
      (type) => type.id.toString() === projectType?.toString()
    );
    return restrictedTypes.includes(currentType?.name || "");
  }, [projectType, projectTypes]);

  const isApprovedBudgetDisabled = useMemo(() => {
    const restrictedTypes = ["Internal Project", "Proof of Concept"];
    const currentType = projectTypes.find(
      (type) => type.id.toString() === projectType?.toString()
    );
    return restrictedTypes.includes(currentType?.name || "");
  }, [projectType, projectTypes]);

  const isCategoryDisabled = useMemo(() => {
    const restrictedTypes = ["Internal Project", "Proof of Concept"];
    const currentType = projectTypes.find(
      (type) => type.id.toString() === projectType?.toString()
    );
    return restrictedTypes.includes(currentType?.name || "");
  }, [projectType, projectTypes]);

  const isBudgetRequired = useMemo(() => {
    const currentType = projectTypes.find(
      (type) => type.id.toString() === projectType?.toString()
    );
    return !["Internal Project", "Proof of Concept"].includes(currentType?.name || "");
  }, [projectType, projectTypes]);


  // Fetch departments and beneficiary departments
  useEffect(() => {
    const fetchDepartmentsAndBeneficiaries = async () => {
      try {
        const deptResponse = await axiosInstance.post(
          `/data-management/getDepartments`
        );
        const beneficiaryResponse = await axiosInstance.post(
          `/data-management/getBeneficiaryDepartments`,
          { projectId: projectData.id }
        );

        const beneficiaryDeptIds = beneficiaryResponse.data.result || [];
        const fetchedDepartments = deptResponse.data.result.map((dept) => ({
          id: dept.id,
          name: dept.name,
          arabic_name: dept.arabic_name,
          checked: beneficiaryDeptIds.includes(dept.id),
        }));

        setDepartments(fetchedDepartments);
        setValue(
          "beneficiaryDepartments",
          fetchedDepartments
            .filter((dept) => dept.checked)
            .map((dept) => dept.id),
          { shouldDirty: false }
        );
      } catch (error) {
        console.error("Error fetching departments or beneficiaries:", error);
        toast.error("Failed to load departments or beneficiary data");
      }
    };

    if (projectData?.id) {
      fetchDepartmentsAndBeneficiaries();
    }
  }, [projectData?.id, setValue]);

  // Fetch other dropdown data
  useEffect(() => {
    const fetchInitiatives = async () => {
      const response = await axiosInstance.post(
        `/data-management/getInitiatives`
      );
      if (response.data.status === "success")
        setInitiatives(response.data.result);
    };
    fetchInitiatives();
  }, []);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const response = await axiosInstance.post(
        `/data-management/getPortfolios`
      );
      if (response.data.status === "success")
        setPortfolios(response.data.result);
    };
    fetchPortfolios();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      const response = await axiosInstance.post(`/data-management/getPrograms`);
      if (response.data.status === "success") setPrograms(response.data.result);
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      const response = await axiosInstance.post(`/data-management/getVendors`);
      if (response.data.status === "success") setVendors(response.data.result);
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchObjectives = async () => {
      const response = await axiosInstance.post(
        `/data-management/getObjectives`
      );
      if (response.data.status === "success") {
        const projectObjectivesResponse = await axiosInstance.post(
          `/data-management/getProjectObjectives`,
          { projectId: projectData.id }
        );
        const projectObjectiveIds =
          projectObjectivesResponse.data.status === "success"
            ? projectObjectivesResponse.data.result.map((o) => o.id)
            : [];
        const fetchedObjectives = response.data.result.map((obj) => ({
          id: obj.id,
          text: obj.name,
          arabic_text: obj.arabic_name,
          checked: projectObjectiveIds.includes(obj.id),
        }));
        setObjectives(fetchedObjectives);
        setValue("objectives", fetchedObjectives, { shouldDirty: false });
      }
    };
    if (projectData?.id) fetchObjectives();
  }, [projectData?.id, setValue]);

  // Fetch program details
  const fetchProgramDetails = async (programId) => {
    if (!programId) {
      setSelectedProgramDetails(null);
      return;
    }
    try {
      const response = await axiosInstance.post(
        "/data-management/getProgramDetails",
        { program_id: programId }
      );
      if (response.data.status === "success") {
        setSelectedProgramDetails(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      toast.error("Failed to load program details");
    }
  };

  useEffect(() => {
    fetchProgramDetails(selectedProgramId);
  }, [selectedProgramId]);
  // Effect to check upload status and approval task status
  useEffect(() => {
    const checkUploadAndApprovalStatus = async () => {
      if (!projectData?.id) return;
      
      console.log("📡 Checking upload and approval status for project:", projectData.id);
      
      try {
        // Check upload status
        const uploadResponse = await axiosInstance.post('/data-management/getProject', {
          id: parseInt(projectData.id)
        });
        
        if (uploadResponse.data.status === 'success') {
          const project = uploadResponse.data.result;
          const docUploaded = project.project_documents_uploaded === true;
          const schedUploaded = project.project_schedule_uploaded === true;
          
          console.log("📊 Upload status from database:", {
            project_documents_uploaded: project.project_documents_uploaded,
            project_schedule_uploaded: project.project_schedule_uploaded,
            docUploadedBool: docUploaded,
            schedUploadedBool: schedUploaded
          });
          
          setDocumentsUploadedSuccessfully(docUploaded);
          setScheduleUploadedSuccessfully(schedUploaded);
        } else {
          console.error("❌ Failed to get project upload status:", uploadResponse.data);
          // Fallback: Check if the project data already has upload info
          if (projectData.project_documents_uploaded !== undefined) {
            console.log("📋 Using fallback upload status from projectData");
            setDocumentsUploadedSuccessfully(projectData.project_documents_uploaded === true);
            setScheduleUploadedSuccessfully(projectData.project_schedule_uploaded === true);
          }
        }

        // Check approval task status
        const taskResponse = await axiosInstance.post('/data-management/checkProjectApprovalTaskExists', {
          projectId: parseInt(projectData.id)
        });
        
        if (taskResponse.data.status === 'success') {
          console.log("✅ Approval task check result:", taskResponse.data.result);
          setApprovalTaskExists(taskResponse.data.result.exists);
          setApprovalTaskInfo(taskResponse.data.result.task);
        } else {
          console.error("❌ Failed to check approval task status:", taskResponse.data);
          // Default to no approval task if API fails
          setApprovalTaskExists(false);
          setApprovalTaskInfo(null);
        }
      } catch (error) {
        console.error("❌ Error checking upload and approval status:", error);
        
        // Fallback: Use projectData for upload status if API fails
        if (projectData?.project_documents_uploaded !== undefined) {
          console.log("📋 Using fallback upload status from projectData due to API error");
          setDocumentsUploadedSuccessfully(projectData.project_documents_uploaded === true);
          setScheduleUploadedSuccessfully(projectData.project_schedule_uploaded === true);
        }
        
        // Default to no approval task if check fails
        setApprovalTaskExists(false);
        setApprovalTaskInfo(null);
      }
    };
    
    checkUploadAndApprovalStatus();
  }, [projectData?.id, documentsRefreshTrigger, scheduleRefreshTrigger]);

  const onSubmit = async (data, sendForApproval = false) => {
    console.log("🚀 onSubmit called with:", { 
      sendForApproval, 
      sendForApprovalType: typeof sendForApproval,
      sendForApprovalValue: sendForApproval,
      data: data.name 
    });
    
    try {
      const selectedDepartmentIds = departments
        .filter((dept) => dept.checked)
        .map((dept) => dept.id);
      if (selectedDepartmentIds.length === 0) {
        toast.error("At least one beneficiary department must be selected");
        return;
      }
      
      const selectedObjectiveIds = objectives
        .filter((obj) => obj.checked)
        .map((obj) => obj.id);
      if (selectedObjectiveIds.length === 0) {
        toast.error("At least one objective must be selected");
        return;
      }

      const updatedProjectData = {
        id: data.id,
        name: data.name,
        arabic_name: data.arabic_name,
        description: data.description,
        project_type_id: parseInt(data.project_type_id) || null,
        current_phase_id: parseInt(data.current_phase_id) || null,
        initiative_id: parseInt(data.initiative_id) || null,
        portfolio_id: parseInt(data.portfolio_id) || null,
        program_id: parseInt(data.program_id) || null,
        category: data.category,
        project_manager_id: parseInt(data.project_manager_id) || null,
        alternative_project_manager_id:
          parseInt(data.alternative_project_manager_id) || null,
        vendor_id: parseInt(data.vendor_id) || null,
        beneficiary_departments: selectedDepartmentIds,
        objectives: selectedObjectiveIds,
        project_budget: data.project_budget
          ? parseFloat(data.project_budget)
          : null,
        approved_project_budget: data.approved_budget
          ? parseFloat(data.approved_budget)
          : null,
        execution_start_date: data.execution_start_date?.startDate || null,
        execution_duration: data.execution_duration || null,
        maintenance_duration: data.maintenance_duration || null,
        approval_status: sendForApproval
          ? "Waiting on deputy"
          : projectData.approval_status,
      };

      const response = await axiosInstance.post(
        `/data-management/updateProject`,
        { id: projectData.id, data: updatedProjectData }
      );

      if (response.data.status === "success") {
        await axiosInstance.post(`/data-management/addBeneficiaryDepartments`, {
          projectId: projectData.id,
          departmentIds: selectedDepartmentIds,
        });

        await axiosInstance.post(`/data-management/updateProjectObjectives`, {
          id: projectData.id,
          objective_ids: selectedObjectiveIds,
        });

        toast.success(
          sendForApproval
            ? "Project saved and sent for approval successfully!"
            : "Project updated successfully!"
        );
        console.log("✅ Toast shown:", sendForApproval ? "approval" : "update");
        onUpdate(updatedProjectData);
        onClose();
        return response;
      } else {
        throw new Error(response.data.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid request data";
        toast.error(`Update failed: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        toast.error("Server error occurred while updating project");
      } else {
        toast.error(error.message || "Failed to update project");
      }
      
      throw error;
    }
  };

  const handleSaveAndSendForApproval = async (data) => {
    try {
      console.log("Starting save and send for approval process...");
      console.log("Project data:", projectData);
      console.log("Form data:", data);

      // Check if approval task already exists
      if (approvalTaskExists) {
        toast.error("Project has already been sent for approval and is pending review.");
        return;
      }

      // First check if documents and schedule plan are uploaded
      const isValidForApproval = await checkProjectReadyForApproval();
      if (!isValidForApproval) {
        console.log("Project not ready for approval, stopping process");
        return; // Error messages are already shown in the check function
      }

      console.log("Project validated, proceeding with approval");

      // If validation passes, proceed with approval
      await onSubmit(data, true);
      
      console.log("Project updated successfully, creating deputy task...");
      
      const projectId = projectData.id;
      if (!projectId) {
        throw new Error("Project ID is missing");
      }

      const taskResponse = await axiosInstance.post(
        "/data-management/createProjectCreationTaskForDeputy",
        { projectId: parseInt(projectId) }
      );
      
      console.log("Task creation response:", taskResponse.data);
      
      if (taskResponse.data.status === "success") {
        toast.success("Project saved and sent for approval successfully!");
        // Refresh the approval task status
        setApprovalTaskExists(true);
        onClose();
      } else if (taskResponse.data.result?.already_sent) {
        toast.warning("Project approval task already exists.");
        setApprovalTaskExists(true);
      } else {
        throw new Error("Failed to create approval task: " + (taskResponse.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving and sending for approval:", error);
      console.error("Error response:", error.response?.data);
      
      // Handle specific error cases
      if (error.response?.data?.result?.already_sent) {
        toast.warning("Project has already been sent for approval.");
        setApprovalTaskExists(true);
        return;
      }
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid request data. Please check all fields and try again.";
        toast.error(errorMessage);
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Failed to save and send project for approval: ${error.message}`);
      }
    }
  };

  const checkProjectReadyForApproval = async () => {
    try {
      // Validate that we have a valid project ID
      if (!projectData?.id) {
        console.error("No project ID available:", projectData);
        toast.error("Invalid project data. Please refresh and try again.");
        return false;
      }

      console.log("Checking project readiness for projectId:", projectData.id);

      // Get the current project data to check upload flags
      const projectResponse = await axiosInstance.post(
        '/data-management/getProject',
        { id: parseInt(projectData.id) }
      );

      if (projectResponse.data.status !== 'success') {
        console.error("Failed to fetch project data:", projectResponse.data);
        toast.error("Failed to fetch project data. Please try again.");
        return false;
      }

      const currentProject = projectResponse.data.result;
      console.log("Current project data:", currentProject);

      const hasSchedulePlan = currentProject.project_schedule_uploaded === true;
      const hasDocuments = currentProject.project_documents_uploaded === true;

      console.log("Validation results:", { hasDocuments, hasSchedulePlan });

      // Check if both requirements are met
      if (!hasDocuments || !hasSchedulePlan) {
        let missingItems = [];
        if (!hasDocuments) missingItems.push("project documents");
        if (!hasSchedulePlan) missingItems.push("schedule plan");
        
        const message = `Cannot send for approval: ${missingItems.join(" and ")} must be uploaded first.`;
        toast.error(message);
        return false;
      }

      return true;

    } catch (error) {
      console.error("Error checking project readiness:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Unable to verify project readiness. Please try again.");
      return false;
    }
  };

  const handleDepartmentChange = (deptId) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === deptId ? { ...dept, checked: !dept.checked } : dept
      )
    );
    const updatedCheckedIds = departments
      .map((dept) =>
        dept.id === deptId ? { ...dept, checked: !dept.checked } : dept
      )
      .filter((dept) => dept.checked)
      .map((dept) => dept.id);
    setValue("beneficiaryDepartments", updatedCheckedIds);
  };

  const toggleObjective = (objectiveId) => {
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId ? { ...obj, checked: !obj.checked } : obj
      )
    );
  };

  // Handlers for document and schedule modals
  const handleOpenDocuments = () => {
    setIsProjectDocumentsModalOpen(true);
  };

  const handleOpenSchedulePlan = () => {
    console.log("Opening schedule plan modal with project data:", {
      execution_start_date: projectData.execution_start_date,
      execution_duration: projectData.execution_duration,
      maintenance_duration: projectData.maintenance_duration,
      project_type_id: projectData.project_type_id
    });
    setIsProjectSchedulePlanModalOpen(true);
  };

  const handleDocumentsSave = () => {
    setDocumentsRefreshTrigger(prev => prev + 1);
    toast.success("Documents updated successfully!");
  };

  const handleSchedulePlanSave = () => {
    setScheduleRefreshTrigger(prev => prev + 1);
    toast.success("Schedule plan updated successfully!");
  };

  const shouldShowSection = (section) => {
    if (activeSection === "all") return true;
    switch (section) {
      case "category":
        return !["1", "4"].includes(projectType);
      case "vendor":
        return !["1", "4"].includes(projectType);
      case "budget":
        return !["1", "4"].includes(projectType);
      default:
        return true;
    }
  };

  // Helper function to determine if project can be sent for approval
  const canSendForApproval = useMemo(() => {
    const allowedStatuses = ["Not initiated", "Draft", "Rejected"];
    const result = allowedStatuses.includes(projectData?.approval_status);
    
    // Enhanced debug logging
    console.log("🔍 Approval Status Check:", {
      projectApprovalStatus: projectData?.approval_status,
      allowedStatuses,
      canSendForApproval: result,
      documentsUploaded: documentsUploadedSuccessfully,
      scheduleUploaded: scheduleUploadedSuccessfully,
      approvalTaskExists: approvalTaskExists,
      finalButtonEnabled: result && !approvalTaskExists && documentsUploadedSuccessfully && scheduleUploadedSuccessfully,
      // Add explanation for why button is disabled
      disabledReason: !result ? `Status "${projectData?.approval_status}" not in allowed list` : 
                     approvalTaskExists ? "Approval task already exists" :
                     !documentsUploadedSuccessfully ? "Documents not uploaded" :
                     !scheduleUploadedSuccessfully ? "Schedule not uploaded" : "Should be enabled"
    });
    
    return result;
  }, [projectData?.approval_status, documentsUploadedSuccessfully, scheduleUploadedSuccessfully, approvalTaskExists]);

  // Helper function to get approval status display info
  const getApprovalStatusInfo = useMemo(() => {
    const status = projectData?.approval_status;
    
    switch (status) {
      case "Waiting on deputy":
        return {
          color: "yellow",
          message: "Project is pending deputy approval",
          canEdit: false
        };
      case "Approved":
        return {
          color: "green", 
          message: "Project has been approved",
          canEdit: false
        };
      case "Rejected":
        return {
          color: "red",
          message: "Project was rejected and needs revision",
          canEdit: true
        };
      case "Draft":
      case "Not initiated":
      default:
        return {
          color: "blue",
          message: "Project is in draft mode",
          canEdit: true
        };
    }
  }, [projectData?.approval_status]);

  if (!projectData?.id) {
    return (
      <div className="flex flex-col rounded-lg border border-gray-200 shadow-md bg-white max-w-6xl mx-auto max-h-[90vh] p-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p>Loading project data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 shadow-md bg-white max-w-6xl mx-auto max-h-[90vh]">
      <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showButtons && (
          <div className="flex items-center space-x-2">
            <button
              className="text-green-500 hover:text-green-700"
              onClick={() => setIsProjectDocumentsModalOpen(true)}
              title="Manage Project Documents"
            >
              <FileText size={20} />
            </button>
            <button
              className="text-purple-500 hover:text-purple-700"
              onClick={() => setIsProjectSchedulePlanModalOpen(true)}
              title="Manage Schedule Plan"
            >
              <Calendar size={20} />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Project Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Project English Name <span className="text-red-500">*</span>
              </label>
              <input
                readOnly={readOnly}
                type="text"
                className={`w-full p-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded`}
                {...register("name", {
                  required: "Project English name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="text-right">
              <label className="block text-sm font-semibold mb-1 text-right">
                <span className="text-red-500">*</span> اسم المشروع بالعربي
              </label>
              <input
                readOnly={readOnly}
                type="text"
                className={`w-full p-2 border ${
                  errors.arabic_name ? "border-red-500" : "border-gray-300"
                } rounded text-right`}
                {...register("arabic_name", {
                  required: "Project Arabic name is required",
                })}
              />
              {errors.arabic_name && (
                <p className="text-red-500 text-xs mt-1 text-right">
                  {errors.arabic_name.message}
                </p>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              readOnly={readOnly}
              className={`w-full p-2 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded h-24`}
              {...register("description", {
                required: "Project description is required",
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Project Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="project_type_id"
                  control={control}
                  rules={{ required: "Project type is required" }}
                  render={({ field }) => (
                    <select
                      disabled={readOnly}
                      className={`w-full p-2 border ${
                        errors.project_type_id
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded appearance-none bg-white`}
                      {...field}
                    >
                      <option value="">Select Project Type</option>
                      {projectTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.project_type_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.project_type_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Project Current Phase <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="current_phase_id"
                  control={control}
                  rules={{ required: "Current phase is required" }}
                  render={({ field }) => (
                    <select
                      disabled={readOnly}
                      className={`w-full p-2 border ${
                        errors.current_phase_id
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded appearance-none bg-white`}
                      {...field}
                    >
                      <option value="">Select Current Phase</option>
                      {filteredProjectPhases.map((phase) => (
                        <option key={phase.id} value={phase.id}>
                          {phase.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.current_phase_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.current_phase_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Project Categories */}
          {shouldShowSection("category") && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Project Categories</h3>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="program_id"
                      control={control}
                      rules={{ required: "Program name is required" }}
                      render={({ field }) => (
                        <select
                          disabled={readOnly}
                          className={`w-full p-2 border ${
                            errors.program_id
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded appearance-none bg-white`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            fetchProgramDetails(e.target.value);
                          }}
                        >
                          <option value="">Select Program</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                  {errors.program_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.program_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Portfolio Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                    value={selectedProgramDetails?.portfolio_name || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Initiative Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                    value={selectedProgramDetails?.initiative_name || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${
                      isCategoryDisabled ? "opacity-50" : ""
                    }`}
                  >
                    Project Category{" "}
                    {isCategoryDisabled && "(Disabled for this project type)"}
                    {!isCategoryDisabled && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div className="flex items-center space-x-6">
                    <label
                      className={`flex items-center ${
                        isCategoryDisabled ? "opacity-50" : ""
                      }`}
                    >
                      <Controller
                        name="category"
                        control={control}
                        rules={{
                          required:
                            !isCategoryDisabled &&
                            "Project category is required",
                        }}
                        render={({ field }) => (
                          <input
                            disabled={readOnly || isCategoryDisabled}
                            type="radio"
                            className="mr-2"
                            value="Capex"
                            checked={field.value === "Capex"}
                            onChange={() => field.onChange("Capex")}
                          />
                        )}
                      />
                      <span>Capex</span>
                    </label>
                    <label
                      className={`flex items-center ${
                        isCategoryDisabled ? "opacity-50" : ""
                      }`}
                    >
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <input
                            disabled={readOnly || isCategoryDisabled}
                            type="radio"
                            className="mr-2"
                            value="Opex"
                            checked={field.value === "Opex"}
                            onChange={() => field.onChange("Opex")}
                          />
                        )}
                      />
                      <span>Opex</span>
                    </label>
                  </div>
                  {!isCategoryDisabled && errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assignee & Communication */}
          <div className="mb-6 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Assignee & Communication</h3>
              <button type="button">
                <ChevronUp size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Project Manager <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="project_manager_id"
                    control={control}
                    rules={{ required: "Project manager is required" }}
                    render={({ field }) => (
                      <select
                        disabled={readOnly}
                        className={`w-full p-2 border ${
                          errors.project_manager_id
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded appearance-none bg-white`}
                        {...field}
                      >
                        <option value="">Select Project Manager</option>
                        {projectManagers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.family_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                </div>
                {errors.project_manager_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.project_manager_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Beneficiary Department <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded p-2 max-h-40 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center mb-1">
                      <input
                        disabled={readOnly}
                        type="checkbox"
                        id={`dept-${dept.id}`}
                        checked={dept.checked}
                        onChange={() => handleDepartmentChange(dept.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm">
                        {dept.name}{" "}
                        {dept.arabic_name && `(${dept.arabic_name})`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Alternative Project Manager
                </label>
                <div className="relative">
                  <Controller
                    name="alternative_project_manager_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        disabled={readOnly}
                        className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                        {...field}
                      >
                        <option value="">Select Alternative Manager</option>
                        {projectManagers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.family_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              {shouldShowSection("vendor") && (
                <div>
                  <label
                    className={`block text-sm font-semibold mb-1 ${
                      isVendorDisabled ? "opacity-50" : ""
                    }`}
                  >
                    Vendor Name
                    {isVendorDisabled && " (Disabled for this project type)"}
                  </label>
                  <div className="relative">
                    <Controller
                      name="vendor_id"
                      control={control}
                      render={({ field }) => (
                        <select
                          disabled={readOnly || isVendorDisabled}
                          className={`w-full p-2 border border-gray-300 rounded appearance-none bg-white ${
                            isVendorDisabled
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`}
                          {...field}
                        >
                          <option value="">Select Vendor</option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}{" "}
                              {vendor.arabic_name && `(${vendor.arabic_name})`}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Objectives and Budget */}
          <div className="mb-6 border-t pt-4">
            <h3 className="font-semibold mb-4">Objectives and Budget</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Objectives <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded p-2 max-h-40 overflow-y-auto">
                  {objectives.length > 0 ? (
                    objectives.map((objective) => (
                      <div key={objective.id} className="flex items-center mb-1">
                        <input
                          disabled={readOnly}
                          type="checkbox"
                          id={`obj-${objective.id}`}
                          checked={objective.checked}
                          onChange={() => toggleObjective(objective.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`obj-${objective.id}`}>
                          {objective.text}{" "}
                          {objective.arabic_text && `(${objective.arabic_text})`}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No objectives available. Please add objectives first.
                    </div>
                  )}
                </div>
              </div>
              {shouldShowSection("budget") && (
                <div>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-semibold mb-1"
                    >
                      Project Planned Budget(in SAR)
                      {isBudgetRequired && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>
                    <input
                      readOnly={readOnly || isBudgetDisabled}
                      type="text"
                      className={`w-full p-2 border ${
                        errors.project_budget
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded ${
                        isBudgetDisabled ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter full amount. For example, 8,000,000 for 8 million."
                      {...register("project_budget", {
                        required:
                          isBudgetRequired &&
                          "Project planned budget is required",
                        pattern: {
                          value: /^\d+(\.\d+)?$/,
                          message:
                            "Please enter a valid number (e.g., 10 or 10.5)",
                        },
                      })}
                      disabled={isBudgetDisabled}
                    />
                    {errors.project_budget && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.project_budget.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-1 ${
                        isApprovedBudgetDisabled ? "opacity-50" : ""
                      }`}
                    >
                      Project Approved Budget(in SAR)
                      {isApprovedBudgetDisabled && " (Disabled for this project type)"}
                    </label>
                    <input
                      readOnly={readOnly || isApprovedBudgetDisabled}
                      type="text"
                      className={`w-full p-2 border border-gray-300 rounded ${
                        isApprovedBudgetDisabled ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter full amount. For example, 8,000,000 for 8 million."
                      {...register("approved_budget")}
                      disabled={isApprovedBudgetDisabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Status and Actions */}
          <div className="mb-6 border-t pt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Schedule Plan Status */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Schedule Plan</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    scheduleUploadedSuccessfully 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {scheduleUploadedSuccessfully ? "Uploaded" : "Not uploaded"}
                  </span>
                </div>
                {scheduleUploadedSuccessfully ? (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 font-medium">✓ Schedule Plan Uploaded Successfully</span>
                    </div>
                    <p className="text-sm text-green-600 mb-3">
                      The schedule plan has been saved for this project.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleOpenSchedulePlan}
                    >
                      Edit Schedule Plan
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      Add a schedule plan for this project.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleOpenSchedulePlan}
                    >
                      Upload Schedule Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Documents Status */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Project Documents</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    documentsUploadedSuccessfully 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {documentsUploadedSuccessfully ? "Uploaded" : "Not uploaded"}
                  </span>
                </div>
                {documentsUploadedSuccessfully ? (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 font-medium">✓ Project Documents Uploaded Successfully</span>
                    </div>
                    <p className="text-sm text-green-600 mb-3">
                      Required documents have been uploaded for this project.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleOpenDocuments}
                    >
                      Manage Documents
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      Upload required documents for this project phase.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleOpenDocuments}
                    >
                      Upload Documents
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send for Approval Section */}
          {canSendForApproval && (
            <div className="mb-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Project Approval Status</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getApprovalStatusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-800" :
                  getApprovalStatusInfo.color === "green" ? "bg-green-100 text-green-800" :
                  getApprovalStatusInfo.color === "red" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {projectData?.approval_status || "Draft"}
                </div>
              </div>
              
              {projectData?.approval_status === "Rejected" && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-medium text-red-800">
                      Project Rejected
                    </p>
                  </div>
                  <p className="text-sm text-red-700">
                    This project was rejected and needs revision before it can be resubmitted for approval.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {approvalTaskExists ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm font-medium text-yellow-800">
                        Project Already Sent for Approval
                      </p>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      This project has already been sent for approval and is currently pending review.
                    </p>
                    {approvalTaskInfo && (
                      <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                        <p><strong>Task assigned to:</strong> {approvalTaskInfo.assigned_to_name || 'Deputy'}</p>
                        <p><strong>Due date:</strong> {new Date(approvalTaskInfo.due_date).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {approvalTaskInfo.status}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-blue-800">
                        Approval Requirements
                      </p>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Complete the requirements below to enable approval submission.
                    </p>
                    <div className="text-xs text-gray-500">
                      <p className="mb-2">Requirements:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li className={scheduleUploadedSuccessfully ? "text-green-600" : "text-gray-500"}>
                          {scheduleUploadedSuccessfully ? "✓" : "○"} Schedule plan uploaded
                        </li>
                        <li className={documentsUploadedSuccessfully ? "text-green-600" : "text-gray-500"}>
                          {documentsUploadedSuccessfully ? "✓" : "○"} Project documents uploaded
                        </li>
                      </ul>
                      {documentsUploadedSuccessfully && scheduleUploadedSuccessfully && (
                        <p className="text-green-600 mt-2 font-medium">
                          ✓ All requirements met - Use "Send for Approval" button below to submit
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Footer */}
          {showButtons && (
            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Save project changes without sending for approval"
                  onClick={handleSubmit((data) => onSubmit(data, false))}
                >
                  Update Project
                </button>
              </div>
              
              {/* Send for Approval Button - Always visible but enabled/disabled based on requirements */}
              <div className="flex items-center space-x-4">
                {/* Determine button state and styling */}
                {(() => {
                  const isEnabled = canSendForApproval && !approvalTaskExists && documentsUploadedSuccessfully && scheduleUploadedSuccessfully;
                  
                  // Debug the button state
                  console.log("🔘 Send for Approval Button State:", {
                    canSendForApproval,
                    approvalTaskExists,
                    documentsUploadedSuccessfully,
                    scheduleUploadedSuccessfully,
                    isEnabled
                  });
                  
                  const getDisabledReason = () => {
                    if (!canSendForApproval) {
                      return `Project status "${projectData?.approval_status}" cannot be sent for approval. Allowed statuses: Not initiated, Draft, Rejected`;
                    }
                    if (approvalTaskExists) {
                      return "Project is already submitted for approval";
                    }
                    if (!documentsUploadedSuccessfully && !scheduleUploadedSuccessfully) {
                      return "Upload required documents and schedule plan before sending for approval";
                    }
                    if (!documentsUploadedSuccessfully) {
                      return "Upload required project documents before sending for approval";
                    }
                    if (!scheduleUploadedSuccessfully) {
                      return "Upload schedule plan before sending for approval";
                    }
                    return "";
                  };

                  const buttonText = projectData?.approval_status === "Rejected" ? "Resubmit for Approval" : "Send for Approval";
                  const disabledReason = getDisabledReason();

                  return (
                    <button
                      type="button"
                      className={`px-6 py-2 rounded transition-colors font-medium ${
                        isEnabled
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={isEnabled ? handleSubmit(handleSaveAndSendForApproval) : undefined}
                      disabled={!isEnabled}
                      title={isEnabled ? "Save changes and send project for deputy approval" : disabledReason}
                    >
                      {buttonText}
                    </button>
                  );
                })()}
              </div>
            </div>
          )}
        </form>
      </div>
      {/* Project Documents Modal */}
      {isProjectDocumentsModalOpen && (
        <ProjectDocumentsModal
          isOpen={isProjectDocumentsModalOpen}
          onClose={() => setIsProjectDocumentsModalOpen(false)}
          projectId={projectData.id}
          projectName={projectData.name}
          currentPhase={watch("current_phase_id") || projectData.current_phase_id}
          isNewProject={false} // This is an existing project being updated
          onSave={handleDocumentsSave}
        />
      )}
      {/* Project Schedule Plan Modal */}
      {isProjectSchedulePlanModalOpen && (
        <ProjectSchedulePlanModal
          isOpen={isProjectSchedulePlanModalOpen}
          onClose={() => setIsProjectSchedulePlanModalOpen(false)}
          projectId={projectData.id}
          projectName={projectData.name}
          projectType={projectData.project_type_id}
          projectBudget={projectData.project_budget}
          executionStartDate={
            projectData.execution_start_date
              ? new Date(projectData.execution_start_date)
              : null
          }
          executionDuration={
            projectData.execution_duration
              ? parseInt(String(projectData.execution_duration).split(" ")[0], 10)
              : null
          }
          maintenanceDuration={
            projectData.maintenance_duration
              ? parseInt(String(projectData.maintenance_duration), 10)
              : 30
          }
          executionDurationType={
            projectData.execution_duration
              ? String(projectData.execution_duration).split(" ")[1] || 'weeks'
              : 'weeks'
          }
          onSave={handleSchedulePlanSave}
        />
      )}
    </div>
  );
};

export default UpdateProjectModal;
