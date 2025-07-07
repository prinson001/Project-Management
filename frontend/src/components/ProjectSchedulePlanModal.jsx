import React, { useState, useEffect, useCallback } from "react";
import { X, Save, Calendar, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
import { useForm, Controller } from "react-hook-form";
import Datepicker from "react-tailwindcss-datepicker";
import {
  addDays,
  format,
  isValid,
  parseISO,
  subDays,
} from "date-fns";

const ProjectSchedulePlanModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName,
  projectType,
  projectBudget,
  executionStartDate: initialStartDate,
  executionDuration: initialDuration,
  maintenanceDate: initialMaintenanceDate,
  maintenanceDuration: initialMaintenanceDuration,
  executionDurationType: initialDurationType,
  onSave
}) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("B. Days");
  const [phases, setPhases] = useState([]);
  const [durationTypes, setDurationTypes] = useState({});
  const [totalDurationUnit, setTotalDurationUnit] = useState("days");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const isInternalSchedule = ["1", "4"].includes(projectType?.toString());

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    defaultValues: {
      executionStartDate: initialStartDate || null,
      executionDuration: initialDuration ? String(initialDuration) : "4",
      maintenanceDuration: initialMaintenanceDuration ? String(initialMaintenanceDuration) : "30",
      execution_duration_type: initialDurationType || "weeks",
      maintenance_duration_type: "days"
    }
  });

  const executionStartDate = watch("executionStartDate");
  const executionDuration = watch("executionDuration");
  const maintenanceDuration = watch("maintenanceDuration");
  const executionDurationType = watch("execution_duration_type");
  const maintenanceDurationType = watch("maintenance_duration_type");

  // Calculate execution end date
  const executionEndDate = React.useMemo(() => {
    if (executionStartDate && executionDuration && executionDurationType) {
      const startDate = new Date(executionStartDate);
      if (isValid(startDate)) {
        const durationNum = parseInt(executionDuration, 10);
        let daysToAdd = 0;
        
        switch (executionDurationType) {
          case 'days':
            daysToAdd = durationNum;
            break;
          case 'weeks':
            daysToAdd = durationNum * 7;
            break;
          case 'months':
            daysToAdd = durationNum * 30; // Approximate month
            break;
          default:
            daysToAdd = durationNum * 7; // Default to weeks
        }
        
        return addDays(startDate, daysToAdd);
      }
    }
    return null;
  }, [executionStartDate, executionDuration, executionDurationType]);

  const totalDurationDays = React.useMemo(() => {
    if (
      executionStartDate &&
      maintenanceDuration &&
      isValid(new Date(executionStartDate)) &&
      !isNaN(parseInt(maintenanceDuration, 10))
    ) {
      const executionDays = parseInt(executionDuration, 10) || 0;
      const maintenanceDays = parseInt(maintenanceDuration, 10) || 0;
      
      let executionInDays = 0;
      switch (executionDurationType) {
        case 'days':
          executionInDays = executionDays;
          break;
        case 'weeks':
          executionInDays = executionDays * 7;
          break;
        case 'months':
          executionInDays = executionDays * 30;
          break;
        default:
          executionInDays = executionDays * 7;
      }
      
      let maintenanceInDays = 0;
      switch (maintenanceDurationType) {
        case 'days':
          maintenanceInDays = maintenanceDays;
          break;
        case 'weeks':
          maintenanceInDays = maintenanceDays * 7;
          break;
        case 'months':
          maintenanceInDays = maintenanceDays * 30;
          break;
        default:
          maintenanceInDays = maintenanceDays;
      }
      
      return executionInDays + maintenanceInDays;
    }
    return 0;
  }, [executionStartDate, executionDuration, executionDurationType, maintenanceDuration, maintenanceDurationType]);

  const getTotalDurationDisplay = () => {
    if (totalDurationUnit === "days") {
      return `${totalDurationDays} day${totalDurationDays !== 1 ? "s" : ""}`;
    }
    if (totalDurationUnit === "weeks") {
      const weeks = (totalDurationDays / 7).toFixed(1);
      return `${weeks} week${weeks !== "1.0" ? "s" : ""}`;
    }
    if (totalDurationUnit === "months") {
      const months = (totalDurationDays / 30.44).toFixed(1);
      return `${months} month${months !== "1.0" ? "s" : ""}`;
    }
    return `${totalDurationDays} days`;
  };

  const subtractDays = (date, days) => {
    if (!date || !isValid(date)) return null;
    return subDays(new Date(date), days);
  };

  const convertToDays = useCallback((durationStr, currentUnit) => {
    if (!durationStr) return 0;

    const daysMatch = durationStr.match(/(\d+)\s*days?/i);
    if (daysMatch) return parseInt(daysMatch[1], 10);

    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/i);
    if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;

    const monthsMatch = durationStr.match(/(\d+)\s*months?/i);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;

    return 0;
  }, []);

  const convertDuration = useCallback((durationDays, targetUnit) => {
    if (durationDays <= 0) return "0 days";
    if (targetUnit === "B. Days") {
      return `${durationDays} day${durationDays !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Weeks") {
      const weeks = Math.round(durationDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Months") {
      const months = Math.round(durationDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${durationDays} days`;
  }, []);

  // Function to get phase flag based on dates
  const getPhaseFlag = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    if (end < now && start < now) {
      // Both start and end dates are in the past - red flag
      return { type: 'red', message: 'Phase overdue' };
    } else if (start < now && end >= now) {
      // Start date is in the past but end date is in future/today - yellow flag
      return { type: 'yellow', message: 'Phase in progress (delayed start)' };
    }
    
    return null; // No flag needed
  }, []);

  // Function to convert maintenance duration to days
  const convertMaintenanceToDays = useCallback((duration, type) => {
    const durationNum = parseInt(duration, 10) || 0;
    switch (type) {
      case 'days':
        return durationNum;
      case 'weeks':
        return durationNum * 7;
      case 'months':
        return durationNum * 30;
      default:
        return durationNum;
    }
  }, []);

  // Function to check if there are any phases with past dates
  const hasPhaseIssues = useCallback(() => {
    return scheduleData.some(phase => {
      const flag = getPhaseFlag(
        phase.start_date || phase.startDate,
        phase.end_date || phase.endDate
      );
      return flag !== null; // Returns true if there's any flag (red or yellow)
    });
  }, [scheduleData, getPhaseFlag]);

  // Function to get phase issues details for the popup
  const getPhaseIssuesDetails = useCallback(() => {
    const issues = scheduleData
      .map((phase, index) => {
        const flag = getPhaseFlag(
          phase.start_date || phase.startDate,
          phase.end_date || phase.endDate
        );
        if (flag) {
          return {
            phase: phase.main_phase || phase.mainPhase,
            subPhase: phase.phase_name || phase.subPhase,
            type: flag.type,
            message: flag.message
          };
        }
        return null;
      })
      .filter(issue => issue !== null);
    
    return issues;
  }, [scheduleData, getPhaseFlag]);

  const getDurationOptions = (type) => {
    if (type === "B. Days") {
      return Array.from({ length: 90 }, (_, i) => {
        const days = i + 1;
        return {
          value: `${days} day${days > 1 ? "s" : ""}`,
          label: `${days} day${days > 1 ? "s" : ""}`,
        };
      });
    } else if (type === "Weeks") {
      return Array.from({ length: 12 }, (_, i) => {
        const weeks = i + 1;
        return {
          value: `${weeks} week${weeks > 1 ? "s" : ""}`,
          label: `${weeks} week${weeks > 1 ? "s" : ""}`,
        };
      });
    } else if (type === "Months") {
      return Array.from({ length: 12 }, (_, i) => {
        const months = i + 1;
        return {
          value: `${months} month${months > 1 ? "s" : ""}`,
          label: `${months} month${months > 1 ? "s" : ""}`,
        };
      });
    }
    return [];
  };

  const handleDurationChange = useCallback(
    (phaseId, newDuration, newType) => {
      const currentUnit = durationTypes[phaseId] || activeTab;
      const updatedType = newType || currentUnit;
      const durationDays = convertToDays(newDuration, updatedType);

      setDurationTypes((prevTypes) => ({
        ...prevTypes,
        [phaseId]: updatedType,
      }));

      const updatedDuration = convertDuration(durationDays, updatedType);

      const updatedSchedule = scheduleData.map((phase) =>
        (phase.phaseId || phase.phase_id) === phaseId
          ? { ...phase, duration: updatedDuration, durationDays }
          : phase
      );
      setScheduleData(updatedSchedule);
    },
    [convertToDays, convertDuration, activeTab, scheduleData, durationTypes]
  );

  useEffect(() => {
    if (isOpen && projectId) {
      console.log("ProjectSchedulePlanModal opened:");
      console.log("- projectId:", projectId);
      console.log("- projectType:", projectType);
      console.log("- isInternalSchedule:", isInternalSchedule);
      
      if (isInternalSchedule) {
        console.log("Loading internal schedule...");
        loadInternalSchedule();
      } else {
        console.log("Loading external schedule...");
        loadExternalSchedule();
      }
    }
  }, [isOpen, projectId, isInternalSchedule]);

  useEffect(() => {
    if (
      !executionStartDate ||
      !isValid(new Date(executionStartDate)) ||
      scheduleData.length === 0
    ) {
      return;
    }

    const reversedSchedule = [...scheduleData].reverse();
    let nextPhaseStartDate = new Date(executionStartDate);

    const updatedScheduleReversed = reversedSchedule.map((row) => {
      const durationDays = row.durationDays || 0;
      const endDate = subDays(nextPhaseStartDate, 0); // Corrected: No gap
      const startDate = subDays(
        endDate,
        durationDays > 0 ? durationDays - 1 : 0
      );

      nextPhaseStartDate = startDate;

      return {
        ...row,
        startDate: startDate,
        endDate: endDate,
      };
    });

    const updatedSchedule = updatedScheduleReversed.reverse();

    if (JSON.stringify(updatedSchedule) !== JSON.stringify(scheduleData)) {
      setScheduleData(updatedSchedule);
    }
  }, [
    executionStartDate,
    JSON.stringify(scheduleData.map((s) => s.durationDays)),
  ]);

  const loadInternalSchedule = async () => {
    setLoading(true);
    try {
      console.log("Fetching internal schedule for projectId:", projectId);
      
      // Load existing internal schedule
      const response = await axiosInstance.post(
        "/data-management/getInternalSchedulePlan",
        { projectId }
      );

      console.log("Internal schedule response:", response.data);

      if (response.data.status === "success" && response.data.result.length > 0) {
        console.log("Found existing internal schedule data");
        const scheduleResult = response.data.result.map(item => ({
          phaseId: item.phase_id,
          mainPhase: item.main_phase,
          subPhase: item.phase_name,
          duration: `${item.duration_days} days`,
          durationDays: item.duration_days,
          startDate: item.start_date ? new Date(item.start_date) : null,
          endDate: item.end_date ? new Date(item.end_date) : null,
        }));
        setScheduleData(scheduleResult);
        
        // Set form values from backend response
        if (response.data.execution_duration) {
          const durationParts = response.data.execution_duration.split(" ");
          setValue("executionDuration", durationParts[0]);
          setValue("execution_duration_type", durationParts[1] || "weeks");
        }
        if (response.data.maintenance_duration) {
          setValue("maintenanceDuration", response.data.maintenance_duration.toString());
          setValue("maintenance_duration_type", "days");
        }
      } else {
        console.log("No existing internal schedule found, initializing default");
        // Initialize default internal schedule with consistent structure
        setScheduleData([
          {
            phaseId: 1,
            mainPhase: "Planning",
            subPhase: "Prepare scope",
            duration: "28 days",
            durationDays: 28,
            startDate: null,
            endDate: null
          },
          {
            phaseId: 4,
            mainPhase: "Execution", 
            subPhase: "Execute phase",
            duration: "28 days",
            durationDays: 28,
            startDate: null,
            endDate: null
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading internal schedule:", error);
      toast.error("Failed to load internal schedule data");
      
      // Initialize default internal schedule on error
      setScheduleData([
        {
          phaseId: 1,
          mainPhase: "Planning",
          subPhase: "Prepare scope",
          duration: "28 days",
          durationDays: 28,
          startDate: null,
          endDate: null
        },
        {
          phaseId: 4,
          mainPhase: "Execution", 
          subPhase: "Execute phase",
          duration: "28 days",
          durationDays: 28,
          startDate: null,
          endDate: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadExternalSchedule = async () => {
    setLoading(true);
    try {
      const budgetValue = parseFloat(projectBudget) || 0;
      const phasesResponse = await axiosInstance.post(
        "/data-management/getSchedulePhases",
        { budget: budgetValue }
      );

      let schedule = [];
      if (phasesResponse.data.status === "success") {
        const phases = phasesResponse.data.result;
        setPhases(phases);
        schedule = phases.map((phase) => ({
          phaseId: phase.id,
          mainPhase: phase.main_phase,
          subPhase: phase.phase_name,
          duration: `${phase.duration_days || 7} days`,
          durationDays: phase.duration_days || 7,
          startDate: null,
          endDate: null,
        }));
      } else {
        toast.error(phasesResponse.data.message || "Failed to fetch phases.");
      }

      const scheduleResponse = await axiosInstance.post(
        "/data-management/getSchedulePlan",
        { projectId }
      );

      if (
        scheduleResponse.data.status === "success" &&
        scheduleResponse.data.result.length > 0
      ) {
        const existingSchedule = scheduleResponse.data.result.map((plan) => ({
          phaseId: plan.phase_id,
          mainPhase: plan.main_phase,
          subPhase: plan.phase_name,
          duration: `${plan.duration_days} days`,
          durationDays: plan.duration_days,
          startDate: plan.start_date ? new Date(plan.start_date) : null,
          endDate: plan.end_date ? new Date(plan.end_date) : null,
        }));
        setScheduleData(existingSchedule);
      } else if (schedule.length > 0) {
        setScheduleData(schedule);
      }
    } catch (error) {
      console.error("Error loading external schedule:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    if (scheduleData.length === 0) {
      toast.error("No schedule data to save");
      return;
    }

    // Check if there are phases with past dates
    if (hasPhaseIssues()) {
      // Store form data and show confirmation modal
      setPendingFormData(formData);
      setShowConfirmationModal(true);
      return;
    }

    // If no issues, proceed with save
    await performSave(formData);
  };

  const performSave = async (formData) => {
    setSaving(true);
    try {
      // Convert maintenance duration to days
      const maintenanceDurationInDays = convertMaintenanceToDays(
        maintenanceDuration,
        maintenanceDurationType
      );

      if (isInternalSchedule) {
        // Save internal schedule
        const response = await axiosInstance.post(
          "/data-management/upsertInternalSchedulePlan",
          {
            projectId,
            schedule: scheduleData.map(phase => ({
              phaseId: phase.phaseId,
              durationDays: phase.durationDays,
              startDate: phase.startDate ? phase.startDate.toISOString().split('T')[0] : null,
              endDate: phase.endDate ? phase.endDate.toISOString().split('T')[0] : null
            })),
            executionDuration: `${executionDuration} ${executionDurationType}`,
            maintenanceDuration: maintenanceDurationInDays,
            executionStartDate: executionStartDate ? executionStartDate.toISOString().split('T')[0] : null,
            executionEndDate: executionEndDate ? executionEndDate.toISOString().split('T')[0] : null
          }
        );

        if (response.data.status === "success") {
          toast.success("Internal schedule plan saved successfully!");
          if (onSave) {
            onSave();
          }
          onClose();
        } else {
          throw new Error(response.data.message || "Failed to save schedule");
        }
      } else {
        // Save external schedule
        const response = await axiosInstance.post(
          "/data-management/upsertSchedulePlan",
          {
            projectId,
            schedule: scheduleData.map(phase => ({
              phaseId: phase.phaseId,
              durationDays: phase.durationDays,
              startDate: phase.startDate ? phase.startDate.toISOString().split('T')[0] : null,
              endDate: phase.endDate ? phase.endDate.toISOString().split('T')[0] : null
            })),
            execution_duration: `${executionDuration} ${executionDurationType}`,
            maintenance_duration: maintenanceDurationInDays,
            execution_start_date: executionStartDate ? executionStartDate.toISOString().split('T')[0] : null,
            execution_end_date: executionEndDate ? executionEndDate.toISOString().split('T')[0] : null
          }
        );

        if (response.data.status === "success") {
          toast.success("Schedule plan saved successfully!");
          if (onSave) {
            onSave();
          }
          onClose();
        } else {
          throw new Error(response.data.message || "Failed to save schedule");
        }
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmationModal(false);
    if (pendingFormData) {
      await performSave(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmationModal(false);
    setPendingFormData(null);
  };

  const getRowColor = (mainPhase) => {
    switch (mainPhase) {
      case "Planning":
        return "bg-green-50";
      case "Bidding":
        return "bg-blue-50";
      case "Before execution":
        return "bg-yellow-50";
      default:
        return "bg-white";
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('ProjectSchedulePlanModal opened with initial values:', { initialStartDate, initialDuration, initialMaintenanceDuration, initialDurationType });
      // Use form setValue instead of direct state setters
      setValue("executionStartDate", initialStartDate || '');
      setValue("executionDuration", initialDuration?.toString() || '');
      setValue("maintenanceDuration", initialMaintenanceDuration?.toString() || '30');
      setValue("execution_duration_type", initialDurationType || 'weeks');
      setValue("maintenance_duration_type", 'days'); // Default to days for maintenance
    }
  }, [isOpen, initialStartDate, initialDuration, initialMaintenanceDuration, initialDurationType, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {isInternalSchedule ? "Internal" : "External"} Project Schedule
              Plan
            </h2>
            <p className="text-gray-600">
              Configure schedule for: {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Execution Start Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="executionStartDate"
                  control={control}
                  rules={{ required: "Execution start date is required" }}
                  render={({ field }) => (
                    <Datepicker
                      value={
                        field.value
                          ? { startDate: field.value, endDate: field.value }
                          : null
                      }
                      onChange={(newValue) =>
                        field.onChange(newValue?.startDate)
                      }
                      useRange={false}
                      asSingle={true}
                      placeholder="Select start date"
                      inputClassName="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.executionStartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.executionStartDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Execution Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className={`w-full p-2 border ${
                      errors.executionDuration
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded`}
                    placeholder="Enter duration"
                    {...register("executionDuration", {
                      required: "Execution duration is required",
                    })}
                  />
                  <select
                    className="p-2 border border-gray-300 rounded"
                    {...register("execution_duration_type")}
                    defaultValue="weeks"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                {errors.executionDuration && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.executionDuration.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Execution End Date
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                  value={
                    executionEndDate && isValid(executionEndDate)
                      ? format(executionEndDate, "dd-MMM-yyyy")
                      : "Not calculated"
                  }
                  readOnly
                  tabIndex={-1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className={`w-full p-2 border ${
                      errors.maintenanceDuration
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded`}
                    placeholder="Enter duration"
                    {...register("maintenanceDuration", {
                      required: "Maintenance duration is required",
                      min: { value: 1, message: "Must be at least 1" }
                    })}
                  />
                  <select
                    className="p-2 border border-gray-300 rounded"
                    {...register("maintenance_duration_type")}
                    defaultValue="days"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                {errors.maintenanceDuration && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maintenanceDuration.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Completion Duration
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                    value={getTotalDurationDisplay()}
                    readOnly
                    tabIndex={-1}
                  />
                  <select
                    className="p-2 border border-gray-300 rounded"
                    value={totalDurationUnit}
                    onChange={(e) => setTotalDurationUnit(e.target.value)}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Status</th>
                    <th className="border p-3 text-left">Main Phase</th>
                    <th className="border p-3 text-left">Sub Phase</th>
                    <th className="border p-3 text-center">Duration</th>
                    <th className="border p-3 text-left">Start Date</th>
                    <th className="border p-3 text-left">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.map((phase, index) => {
                    const flag = getPhaseFlag(
                      phase.start_date || phase.startDate,
                      phase.end_date || phase.endDate
                    );
                    
                    return (
                      <tr
                        key={index}
                        className={getRowColor(phase.main_phase || phase.mainPhase)}
                      >
                        <td className="border p-3 text-center">
                          {flag ? (
                            <div className="flex items-center justify-center">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  flag.type === 'red'
                                    ? 'bg-red-500'
                                    : flag.type === 'yellow'
                                    ? 'bg-yellow-500'
                                    : ''
                                }`}
                                title={flag.message}
                              >
                                !
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                                ✓
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border p-3 font-medium">
                          {phase.main_phase || phase.mainPhase}
                        </td>
                        <td className="border p-3">
                          {phase.phase_name || phase.subPhase}
                        </td>
                        <td className="border p-3">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <select
                                className="w-full p-1 border border-gray-300 rounded appearance-none"
                                value={phase.duration}
                                onChange={(e) =>
                                  handleDurationChange(
                                    phase.phase_id || phase.phaseId,
                                    e.target.value,
                                    durationTypes[
                                      phase.phase_id || phase.phaseId
                                    ] || activeTab
                                  )
                                }
                              >
                                {getDurationOptions(
                                  durationTypes[
                                    phase.phase_id || phase.phaseId
                                  ] || activeTab
                                ).map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronUp size={16} />
                              </div>
                            </div>
                            <div className="relative flex-1">
                              <select
                                className="w-full p-1 border border-gray-300 rounded appearance-none"
                                value={
                                  durationTypes[
                                    phase.phase_id || phase.phaseId
                                  ] || activeTab
                                }
                                onChange={(e) =>
                                  handleDurationChange(
                                    phase.phase_id || phase.phaseId,
                                    phase.duration,
                                    e.target.value
                                  )
                                }
                              >
                                {["B. Days", "Weeks", "Months"].map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronUp size={16} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border p-3">
                          {(phase.start_date || phase.startDate) &&
                          isValid(new Date(phase.start_date || phase.startDate))
                            ? format(
                                new Date(phase.start_date || phase.startDate),
                                "dd-MMM-yyyy"
                              )
                            : "-"}
                        </td>
                        <td className="border p-3">
                          {(phase.end_date || phase.endDate) &&
                          isValid(new Date(phase.end_date || phase.endDate))
                            ? format(
                                new Date(phase.end_date || phase.endDate),
                                "dd-MMM-yyyy"
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation Modal for Phase Issues */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule Issues Detected
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                The following phases have timing issues:
              </p>
              
              <div className="max-h-40 overflow-y-auto space-y-2">
                {getPhaseIssuesDetails().map((issue, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md border-l-4 ${
                      issue.type === 'red'
                        ? 'bg-red-50 border-red-400'
                        : 'bg-yellow-50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 ${
                          issue.type === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                      >
                        !
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {issue.phase} - {issue.subPhase}
                        </p>
                        <p className="text-xs text-gray-600">{issue.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to save this schedule with these timing issues?
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelSave}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSchedulePlanModal;
