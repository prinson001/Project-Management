import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Calendar, ChevronDown, ChevronUp, Download } from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import ProjectDocumentSection from "./ProjectDocumentSection";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";
import axios from "axios";
import SchedulePlanSection from "./SchedulePlanSection";

const ProjectModal = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("all");
  const [viewMode, setViewMode] = useState("weeks");
  const { users } = useAuthStore();
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      arabic_name: "",
      description: "",
      project_type_id: "",
      current_phase_id: "",
      initiative_id: "",
      portfolio_id: "",
      program_id: "",
      category: "",
      project_manager_id: "",
      alternative_project_manager_id: "",
      vendor_id: "",
      beneficiaryDepartments: [
        { id: 1, name: "Beneficiary Department One", checked: true },
        { id: 2, name: "Beneficiary Department Two", checked: true },
        { id: 3, name: "Beneficiary Department Three", checked: true },
        { id: 4, name: "Beneficiary Department four", checked: true },
      ],
      objectives: [
        { id: 1, text: "Objective One", checked: true },
        { id: 2, text: "Objective Two", checked: true },
        { id: 3, text: "Objective Three", checked: true },
        { id: 4, text: "Objective Four", checked: true },
      ],
      planned_budget: "",
      approved_budget: "",
      execution_start_date: {
        startDate: new Date("2025-01-21"),
        endDate: new Date("2025-01-21"),
      },
      maintenance_duration: {
        startDate: new Date("2025-01-21"),
        endDate: new Date("2025-01-21"),
      },
      internal_start_date: {
        startDate: new Date("2025-01-21"),
        endDate: new Date("2025-01-21"),
      },
      execution_duration: "4 weeks",
      documents: [
        {
          id: 1,
          name: "Business case",
          required: true,
          filename: "Business_case.doc",
          date: "5- May -23",
          uploaded: true,
        },
        {
          id: 2,
          name: "Request for Proposal",
          required: true,
          filename: "RFP_version_Final.pdf",
          date: "5- May -23",
          uploaded: true,
        },
        {
          id: 3,
          name: "Execution phase closure",
          required: true,
          filename: "",
          date: "",
          uploaded: false,
        },
        {
          id: 4,
          name: "Contract",
          required: true,
          filename: "",
          date: "",
          uploaded: false,
        },
        {
          id: 5,
          name: "Technical evaluation",
          required: false,
          filename: "",
          date: "",
          uploaded: false,
        },
        {
          id: 6,
          name: "Financial evaluation",
          required: false,
          filename: "",
          date: "",
          uploaded: false,
        },
      ],
    },
  });

  // Watch for changes in projectType and currentPhase
  const projectType = watch("projectType");
  const currentPhase = watch("currentPhase");

  const scheduleData = [
    {
      mainPhase: "Planning",
      subPhase: "Prepare RFP",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Planning",
      subPhase: "RFP Releasing Procedures",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Bidding",
      subPhase: "Bidding Duration",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Bidding",
      subPhase: "Technical and financial evaluation",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Bidding",
      subPhase: "Contract preparation",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Before execution",
      subPhase: "Waiting period before execution starts",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
  ];

  const internalScheduleData = [
    {
      mainPhase: "Planning",
      subPhase: "Prepare scope",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
    {
      mainPhase: "Execution",
      subPhase: "Execute phase",
      duration: "4 weeks",
      startDate: "5- May -23",
      endDate: "5- May -23",
    },
  ];

  useEffect(() => {
    const fetchPhaseDurations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/data-management/phase-durations"
        );
        if (response.data && response.data.status === "success") {
          setPhaseDurations(response.data.data);

          // Process the data to create duration options
          const options = [];
          response.data.data.forEach((phase) => {
            const budgetDurations = phase.budget_durations;
            Object.keys(budgetDurations).forEach((budgetId) => {
              const duration = budgetDurations[budgetId].duration_weeks;
              if (duration > 0 && !options.includes(duration)) {
                options.push(duration);
              }
            });
          });

          // Sort options numerically
          options.sort((a, b) => a - b);
          setDurationOptions(options);
        }
      } catch (error) {
        console.error("Error fetching phase durations:", error);
        toast.error("Failed to load duration options");
      }
    };

    fetchPhaseDurations();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    console.log("Form submitted:", data);

    try {
      // Prepare data for submission
      // Convert project manager IDs to integers if they exist
      if (data.project_manager_id) {
        data.project_manager_id = parseInt(data.project_manager_id, 10);
      }

      if (data.alternative_project_manager_id) {
        data.alternative_project_manager_id = parseInt(
          data.alternative_project_manager_id,
          10
        );
      }

      // Format beneficiary departments and objectives
      const selectedDepartments = data.beneficiaryDepartments
        .filter((dept) => dept.checked)
        .map((dept) => dept.id);

      const selectedObjectives = data.objectives
        .filter((obj) => obj.checked)
        .map((obj) => obj.id);

      // Create the payload
      const projectData = {
        name: data.name,
        arabic_name: data.arabic_name,
        description: data.description,
        project_type_id: data.project_type_id,
        current_phase_id: data.current_phase_id,
        initiative_id: data.initiative_id || null,
        portfolio_id: data.portfolio_id || null,
        program_id: data.program_id || null,
        category: data.category,
        project_manager_id: data.project_manager_id,
        alternative_project_manager_id:
          data.alternative_project_manager_id || null,
        vendor_id: data.vendor_id || null,
        beneficiary_departments: selectedDepartments,
        objectives: selectedObjectives,
        planned_budget: data.planned_budget || null,
        approved_budget: data.approved_budget || null,
        execution_start_date: data.execution_start_date?.startDate || null,
        execution_duration: data.execution_duration,
        maintenance_duration: data.maintenance_duration?.startDate || null,
      };

      // Make API call
      const result = await axios.post(
        "http://localhost:4000/data-management/addProject",
        {
          data: projectData,
          userId: 1,
        },
        {
          timeout: 10000, // 10 seconds timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check response
      if (result.data && result.data.status === "success") {
        // Show success notification
        toast.success("Project added successfully!");

        // Close the modal
        if (onClose) onClose();
      } else {
        throw new Error(result.data?.message || "Failed to add project");
      }
    } catch (error) {
      console.error("Project submission error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add project";
      toast.error(errorMessage);
    }
  };

  // Helper function to determine which sections should be visible based on project type
  const shouldShowSection = (section) => {
    if (activeSection === "all") return true;

    switch (section) {
      case "category":
        return !["Internal", "PoC"].includes(projectType);
      case "vendor":
        return (
          projectType === "PoC" ||
          projectType === "External" ||
          projectType === "Strategic"
        );
      case "budget":
        if (projectType === "Internal") return false;
        if (currentPhase === "Planning" || currentPhase === "Bidding")
          return false;
        return projectType === "External" || projectType === "Strategic";
      case "schedule":
        return projectType === "External" || projectType === "Strategic";
      case "internalSchedule":
        return projectType === "Internal" || projectType === "PoC";
      default:
        return true;
    }
  };

  // Toggle beneficiary department
  const toggleBeneficiaryDepartment = (deptId) => {
    const currentDepts = watch("beneficiaryDepartments");
    const updatedDepts = currentDepts.map((dept) =>
      dept.id === deptId ? { ...dept, checked: !dept.checked } : dept
    );
    setValue("beneficiaryDepartments", updatedDepts);
  };

  // Toggle objective
  const toggleObjective = (objectiveId) => {
    const currentObjectives = watch("objectives");
    const updatedObjectives = currentObjectives.map((obj) =>
      obj.id === objectiveId ? { ...obj, checked: !obj.checked } : obj
    );
    setValue("objectives", updatedObjectives);
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 shadow-md bg-white max-w-6xl mx-auto max-h-[90vh]">
      {/* Header - Fixed at the top */}
      <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Add Project</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {/* Main Form - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Project Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Project English Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded`}
                placeholder=""
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
                type="text"
                className={`w-full p-2 border ${
                  errors.arabic_name ? "border-red-500" : "border-gray-300"
                } rounded text-right`}
                placeholder=""
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
              className={`w-full p-2 border ${
                errors.projectDescription ? "border-red-500" : "border-gray-300"
              } rounded h-24`}
              placeholder=""
              {...register("projectDescription", {
                required: "Project description is required",
              })}
            ></textarea>
            {errors.projectDescription && (
              <p className="text-red-500 text-xs mt-1">
                {errors.projectDescription.message}
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
                  name="projectType"
                  control={control}
                  rules={{ required: "Project type is required" }}
                  render={({ field }) => (
                    <select
                      className={`w-full p-2 border ${
                        errors.projectType
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded appearance-none bg-white`}
                      {...field}
                    >
                      <option value="">Select Project Type</option>
                      <option value="Internal">Internal Project</option>
                      <option value="External">External Project</option>
                      <option value="Strategic">Strategic Project</option>
                      <option value="PoC">Proof of Concept</option>
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.projectType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.projectType.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Project Current Phase <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="currentPhase"
                  control={control}
                  rules={{ required: "Current phase is required" }}
                  render={({ field }) => (
                    <select
                      className={`w-full p-2 border ${
                        errors.currentPhase
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded appearance-none bg-white`}
                      {...field}
                    >
                      <option value="">Select Current Phase</option>
                      <option value="Planning">Planning</option>
                      <option value="Bidding">Bidding</option>
                      <option value="Pre-execution">Pre-execution</option>
                      <option value="Execution">Execution</option>
                      <option value="Maintenance and operation">
                        Maintenance and operation
                      </option>
                      <option value="Closed">Closed</option>
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
              {errors.currentPhase && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPhase.message}
                </p>
              )}
            </div>
          </div>
          {/* Project Categories */}
          {shouldShowSection("category") && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Project Categories</h3>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Initiative Name
                  </label>
                  <div className="relative">
                    <Controller
                      name="initiativeName"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                          {...field}
                        >
                          <option value="">Select Initiative</option>
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Portfolio Name
                  </label>
                  <div className="relative">
                    <Controller
                      name="portfolioName"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                          {...field}
                        >
                          <option value="">Select Portfolio</option>
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Program Name
                  </label>
                  <div className="relative">
                    <Controller
                      name="programName"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                          {...field}
                        >
                          <option value="">Select Program</option>
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Project Category <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <Controller
                        name="projectCategory"
                        control={control}
                        rules={{ required: "Project category is required" }}
                        render={({ field }) => (
                          <input
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
                    <label className="flex items-center">
                      <Controller
                        name="projectCategory"
                        control={control}
                        render={({ field }) => (
                          <input
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
                  {errors.projectCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.projectCategory.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Assignee & Communication */}
          <div className="mb-6 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Assignee & communication</h3>
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
                    name="projectManager"
                    control={control}
                    rules={{ required: "Project manager is required" }}
                    render={({ field }) => (
                      <select
                        className={`w-full p-2 border ${
                          errors.projectManager
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded appearance-none bg-white`}
                        {...field}
                      >
                        <option disabled value="">
                          Select Project Manager
                        </option>
                        {users.map((user) => (
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
                {errors.projectManager && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.projectManager.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Beneficiary Department <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded p-2">
                  {watch("beneficiaryDepartments").map((dept) => (
                    <div key={dept.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`dept-${dept.id}`}
                        checked={dept.checked}
                        onChange={() => toggleBeneficiaryDepartment(dept.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`dept-${dept.id}`}>{dept.name}</label>
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
                    name="alternativeProjectManager"
                    control={control}
                    render={({ field }) => (
                      <select
                        className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                        {...field}
                      >
                        <option value="">Select Alternative Manager</option>
                        {users.map((user) => (
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
            </div>
            {shouldShowSection("vendor") && (
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Vendor Name
                  </label>
                  <div className="relative">
                    <Controller
                      name="vendorName"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
                          {...field}
                        >
                          <option value="">Select Vendor</option>
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Objectives and Budget */}
          <div className="mb-6 border-t pt-4">
            <h3 className="font-semibold mb-4">Objectives and Budget</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Objectives
                </label>
                <div className="border border-gray-300 rounded p-2">
                  {watch("objectives").map((objective) => (
                    <div key={objective.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`obj-${objective.id}`}
                        checked={objective.checked}
                        onChange={() => toggleObjective(objective.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`obj-${objective.id}`}>
                        {objective.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {shouldShowSection("budget") && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      Project Planned Budget
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder=""
                      {...register("plannedBudget")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Project Approved Budget
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder=""
                      {...register("approvedBudget")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Schedule Plan
                    {shouldShowSection('schedule') && (
                        <div className="mb-6 border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Schedule Plan</h3>
                                <div className="flex border border-gray-300 rounded">
                                    <button type="button" className="px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-l">B. Days</button>
                                    <button type="button" className="px-3 py-1">Weeks</button>
                                    <button type="button" className="px-3 py-1 rounded-r">Months</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Execution targeted start date
                                    </label>
                                    <Controller
                                        name="executionStartDate"
                                        control={control}
                                        render={({ field }) => (
                                            <Datepicker
                                                value={field.value}
                                                onChange={(newValue) => field.onChange(newValue)}
                                                asSingle={true}
                                                useRange={false}
                                                displayFormat="DD-MMM-YYYY"
                                                placeholder="Select date"
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Execution duration <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Controller
                                            name="executionDuration"
                                            control={control}
                                            rules={{ required: "Execution duration is required" }}
                                            render={({ field }) => (
                                                <select
                                                    className={`w-full p-2 border ${errors.executionDuration ? 'border-red-500' : 'border-gray-300'} rounded appearance-none bg-white`}
                                                    {...field}
                                                >
                                                    <option value="4 weeks">4 weeks</option>
                                                    <option value="8 weeks">8 weeks</option>
                                                    <option value="12 weeks">12 weeks</option>
                                                </select>
                                            )}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <ChevronUp size={16} />
                                        </div>
                                    </div>
                                    {errors.executionDuration && (
                                        <p className="text-red-500 text-xs mt-1">{errors.executionDuration.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Maintenance & operation duration <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="maintenanceDate"
                                        control={control}
                                        rules={{ required: "Maintenance date is required" }}
                                        render={({ field }) => (
                                            <Datepicker
                                                value={field.value}
                                                onChange={(newValue) => field.onChange(newValue)}
                                                asSingle={true}
                                                useRange={false}
                                                displayFormat="DD-MMM-YYYY"
                                                placeholder="Select date"
                                            />
                                        )}
                                    />
                                    {errors.maintenanceDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.maintenanceDate.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 p-2 text-left">Main Phase</th>
                                            <th className="border border-gray-300 p-2 text-left">Sub Phase</th>
                                            <th className="border border-gray-300 p-2 text-center">Duration</th>
                                            <th className="border border-gray-300 p-2 text-left">Start Date</th>
                                            <th className="border border-gray-300 p-2 text-left">End Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleData.map((row, index) => (
                                            <tr key={index} className={
                                                row.mainPhase === 'Planning' ? 'bg-green-100' :
                                                    row.mainPhase === 'Bidding' ? 'bg-blue-100' :
                                                        row.mainPhase === 'Before execution' ? 'bg-orange-100' :
                                                            'bg-white'
                                            }>
                                                <td className="border border-gray-300 p-2">{row.mainPhase}</td>
                                                <td className="border border-gray-300 p-2">{row.subPhase}</td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span>{row.duration}</span>
                                                        <ChevronUp size={16} className="ml-1" />
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 p-2">{row.startDate}</td>
                                                <td className="border border-gray-300 p-2">{row.endDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )} */}

          {shouldShowSection("schedule") && <SchedulePlanSection />}
          {/* Internal Project Schedule Plan */}
          {shouldShowSection("internalSchedule") && (
            <div className="mb-6 border-t pt-4">
              <h3 className="font-semibold mb-4">
                Internal Project Schedule Plan
              </h3>
              {/* <div className="grid grid-cols-2 gap-6 mb-4"> */}
              {/* <div>
                  <label className="block text-sm font-semibold mb-1">
                    Execution targeted start date{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="internalStartDate"
                    control={control}
                    rules={{ required: "Internal start date is required" }}
                    render={({ field }) => (
                      <Datepicker
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
                        asSingle={true}
                        useRange={false}
                        displayFormat="DD-MMM-YYYY"
                        placeholder="Select date"
                        inputClassName={`w-full p-2 border ${
                          errors.internalStartDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded`}
                      />
                    )}
                  />
                  {errors.internalStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.internalStartDate.message}
                    </p>
                  )}
                </div>
                <div> */}
              {/* <label className="block text-sm font-semibold mb-1">
                    Execution duration <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="executionDuration"
                      control={control}
                      rules={{ required: "Execution duration is required" }}
                      render={({ field }) => (
                        <select
                          className={`w-full p-2 border ${
                            errors.executionDuration
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded appearance-none bg-white`}
                          {...field}
                        >
                          <option value="4 weeks">4 weeks</option>
                          <option value="8 weeks">8 weeks</option>
                          <option value="12 weeks">12 weeks</option>
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronUp size={16} />
                    </div>
                  </div>
                  {errors.executionDuration && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.executionDuration.message}
                    </p>
                  )}
                </div>
              </div> */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">
                        Main Phase
                      </th>
                      <th className="border border-gray-300 p-2 text-left">
                        Sub Phase
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        Duration
                      </th>
                      <th className="border border-gray-300 p-2 text-left">
                        Start Date
                      </th>
                      <th className="border border-gray-300 p-2 text-left">
                        End Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {internalScheduleData.map((row, index) => (
                      <tr
                        key={index}
                        className={
                          row.mainPhase === "Planning"
                            ? "bg-green-100"
                            : row.mainPhase === "Execution"
                            ? "bg-blue-100"
                            : "bg-white"
                        }
                      >
                        <td className="border border-gray-300 p-2">
                          {row.mainPhase}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {row.subPhase}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center">
                            <span>{row.duration}</span>
                            <ChevronUp size={16} className="ml-1" />
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">
                          {row.startDate}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {row.endDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Documents Section - Replaced with ProjectDocumentSection component */}
          <div className="mb-6 border-t pt-4">
            <ProjectDocumentSection formMethods={{ setValue, watch }} />
          </div>
          {/* Form Footer */}
          <div className="flex justify-end space-x-4 mt-6 border-t pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
