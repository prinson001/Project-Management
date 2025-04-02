import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { ChevronUp } from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import { Controller, useForm } from "react-hook-form";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";

const PORT = import.meta.env.VITE_PORT;

const UpdateSchedulePlanSection = ({ projectData, onScheduleUpdate }) => {
  const [activeTab, setActiveTab] = useState("B. Days");
  const [scheduleTableData, setScheduleTableData] = useState([]);
  const [durationTypes, setDurationTypes] = useState({});

  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      executionStartDate: null,
      executionDuration: "28 days",
      maintenanceDate: null,
    },
  });

  const executionStartDate = watch("executionStartDate");

  // Convert duration to days
  const convertToDays = useCallback((durationStr) => {
    const daysMatch = durationStr.match(/(\d+)\s*days?/i);
    if (daysMatch) return parseInt(daysMatch[1], 10);
    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/i);
    if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;
    const monthsMatch = durationStr.match(/(\d+)\s*months?/i);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;
    return 0;
  }, []);

  // Convert duration for display with rounding
  const convertDuration = useCallback((durationDays, targetUnit) => {
    if (durationDays <= 0) return "0 days";
    if (targetUnit === "B. Days") {
      return `${durationDays} day${durationDays !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Weeks") {
      const weeks = Math.round(durationDays / 7); // Round to nearest week
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Months") {
      const months = Math.round(durationDays / 30); // Round to nearest month
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${durationDays} days`;
  }, []);

  // Add duration in days (backwards calculation from end date)
  const addDuration = useCallback((date, durationDays) => {
    if (!date || durationDays <= 0) return null;
    return addDays(date, -durationDays);
  }, []);

  // Initialize with project data
  useEffect(() => {
    if (!projectData) return;

    const {
      id,
      project_budget,
      execution_start_date,
      execution_duration,
      maintenance_duration,
    } = projectData;

    if (execution_start_date) {
      setValue("executionStartDate", new Date(execution_start_date));
    }
    if (execution_duration) {
      setValue(
        "executionDuration",
        convertDuration(execution_duration, activeTab)
      );
    }
    if (maintenance_duration && execution_start_date) {
      const days = parseInt(maintenance_duration) || 0;
      setValue(
        "maintenanceDate",
        new Date(
          new Date(execution_start_date).getTime() + days * 24 * 60 * 60 * 1000
        )
      );
    }

    fetchSchedulePlan(id, project_budget);
  }, [projectData, setValue, activeTab, convertDuration]);

  // Fetch existing schedule plan or phases if none exists
  const fetchSchedulePlan = async (projectId, budget) => {
    try {
      const response = await axiosInstance.post(
        `/data-management/getSchedulePlan`,
        { projectId }
      );
      if (
        response.data.status === "success" &&
        response.data.result.length > 0
      ) {
        const fetchedSchedule = response.data.result.map((plan) => ({
          phaseId: plan.phase_id,
          mainPhase: plan.main_phase,
          subPhase: plan.phase_name,
          duration: convertDuration(plan.duration_days, activeTab),
          durationDays: plan.duration_days,
          startDate: plan.start_date
            ? format(new Date(plan.start_date), "dd-MMM-yyyy")
            : null,
          endDate: plan.end_date
            ? format(new Date(plan.end_date), "dd-MMM-yyyy")
            : null,
        }));
        setScheduleTableData(fetchedSchedule);
      } else {
        fetchPhases(budget, projectId);
      }
    } catch (error) {
      console.error("Error fetching schedule plan:", error);
      toast.error("Failed to load existing schedule plan");
      fetchPhases(budget, projectId);
    }
  };

  const fetchPhases = async (budget, projectId) => {
    try {
      const response = await axiosInstance.post(
        `/data-management/getSchedulePhases`,
        { budget }
      );
      if (response.data.status === "success") {
        const initialSchedule = response.data.result.map((phase) => {
          const durationDays = phase.duration_days || 7;
          return {
            phaseId: phase.id,
            mainPhase: phase.main_phase,
            subPhase: phase.phase_name,
            duration: convertDuration(durationDays, activeTab),
            durationDays,
            startDate: null,
            endDate: null,
          };
        });
        setScheduleTableData(initialSchedule);
      } else {
        throw new Error("Failed to fetch phases");
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
      toast.error("Failed to load phases");
      setScheduleTableData([
        {
          phaseId: 1,
          mainPhase: "Planning",
          subPhase: "Prepare RFP",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
        {
          phaseId: 2,
          mainPhase: "Planning",
          subPhase: "RFP Releasing Procedures",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
        {
          phaseId: 3,
          mainPhase: "Bidding",
          subPhase: "Bidding Duration",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
        {
          phaseId: 4,
          mainPhase: "Bidding",
          subPhase: "Technical and financial evaluation",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
        {
          phaseId: 5,
          mainPhase: "Bidding",
          subPhase: "Contract preparation",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
        {
          phaseId: 6,
          mainPhase: "Before execution",
          subPhase: "Waiting period before execution starts",
          duration: "7 days",
          durationDays: 7,
          startDate: null,
          endDate: null,
        },
      ]);
    }
  };

  // Recalculate dates based on execution start date
  useEffect(() => {
    if (!executionStartDate || !scheduleTableData.length) {
      setScheduleTableData((prev) =>
        prev.map((phase) => ({
          ...phase,
          startDate: null,
          endDate: null,
        }))
      );
      return;
    }

    const updatedSchedule = [...scheduleTableData];
    let currentEndDate = new Date(executionStartDate);

    for (let i = updatedSchedule.length - 1; i >= 0; i--) {
      const phase = updatedSchedule[i];
      const startDate = addDuration(currentEndDate, phase.durationDays);

      updatedSchedule[i] = {
        ...phase,
        endDate: format(currentEndDate, "dd-MMM-yyyy"),
        startDate: startDate ? format(startDate, "dd-MMM-yyyy") : "N/A",
      };

      if (startDate) {
        currentEndDate = new Date(startDate);
      } else {
        for (let j = i - 1; j >= 0; j--) {
          updatedSchedule[j] = {
            ...updatedSchedule[j],
            startDate: "N/A",
            endDate: "N/A",
          };
        }
        break;
      }
    }

    setScheduleTableData(updatedSchedule);
  }, [executionStartDate, scheduleTableData, addDuration]);

  // Handle duration change
  const handleDurationChange = useCallback(
    (phaseId, newDuration, newType) => {
      // Determine the current unit for this phase
      const currentUnit = durationTypes[phaseId] || activeTab;

      // Convert the new duration to days based on the current unit
      const durationDays = convertToDays(newDuration);

      // Update durationTypes with the new type (if provided)
      const updatedType = newType || currentUnit;
      setDurationTypes((prevTypes) => ({
        ...prevTypes,
        [phaseId]: updatedType,
      }));

      // Convert the durationDays to the new unit
      const updatedDuration = convertDuration(durationDays, updatedType);

      // Update the schedule table data
      const updatedSchedule = scheduleTableData.map((phase) =>
        phase.phaseId === phaseId
          ? {
              ...phase,
              duration: updatedDuration,
              durationDays,
            }
          : phase
      );

      if (executionStartDate) {
        let currentEndDate = new Date(executionStartDate);
        const tempSchedule = [...updatedSchedule];

        for (let i = tempSchedule.length - 1; i >= 0; i--) {
          const phase = tempSchedule[i];
          const startDate = addDuration(currentEndDate, phase.durationDays);

          tempSchedule[i] = {
            ...phase,
            endDate: format(currentEndDate, "dd-MMM-yyyy"),
            startDate: startDate ? format(startDate, "dd-MMM-yyyy") : "N/A",
          };

          if (startDate) {
            currentEndDate = new Date(startDate);
          } else {
            for (let j = i - 1; j >= 0; j--) {
              tempSchedule[j] = {
                ...tempSchedule[j],
                startDate: "N/A",
                endDate: "N/A",
              };
            }
            break;
          }
        }
        setScheduleTableData(tempSchedule);
      } else {
        setScheduleTableData(updatedSchedule);
      }
    },
    [
      convertToDays,
      convertDuration,
      activeTab,
      executionStartDate,
      scheduleTableData,
      durationTypes,
    ]
  );

  // Duration options
  const getDurationOptions = useCallback((type) => {
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
  }, []);

  // Handle schedule submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!projectData?.id) {
      toast.error("Project ID is missing");
      return;
    }

    const invalidPhases = scheduleTableData.filter(
      (phase) =>
        !phase.startDate ||
        !phase.endDate ||
        phase.startDate === "N/A" ||
        phase.endDate === "N/A"
    );
    if (invalidPhases.length > 0) {
      toast.error(
        "All phases must have valid start and end dates before updating the schedule."
      );
      return;
    }

    const schedulePayload = scheduleTableData.map((phase) => ({
      phaseId: phase.phaseId,
      durationDays: phase.durationDays,
      startDate: phase.startDate
        ? format(new Date(phase.startDate), "yyyy-MM-dd")
        : null,
      endDate: phase.endDate
        ? format(new Date(phase.endDate), "yyyy-MM-dd")
        : null,
    }));

    try {
      const response = await axiosInstance.post(
        `/data-management/upsertSchedulePlan`,
        {
          projectId: projectData.id,
          schedule: schedulePayload,
        }
      );

      if (response.data.status === "success") {
        toast.success("Schedule plan updated successfully");
        if (onScheduleUpdate) {
          onScheduleUpdate(scheduleTableData);
        }
      } else {
        throw new Error(response.data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error updating schedule plan:", error);
      toast.error(
        "Failed to update schedule plan: " + (error.message || "Server error")
      );
    }
  };

  const getRowColor = (mainPhase) => {
    switch (mainPhase) {
      case "Planning":
        return "bg-green-100";
      case "Bidding":
        return "bg-blue-100";
      case "Before execution":
        return "bg-orange-100";
      default:
        return "bg-white";
    }
  };

  const tabButtonStyle = (tab) =>
    `px-3 py-1 ${
      activeTab === tab ? "bg-blue-100 text-blue-800 font-medium" : ""
    }`;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const updatedSchedule = scheduleTableData.map((phase) => ({
      ...phase,
      duration: convertDuration(phase.durationDays, tab),
    }));
    setScheduleTableData(updatedSchedule);
  };

  return (
    <div className="mb-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Update Schedule Plan</h3>
        {/* Uncomment if you want to re-enable global tab switching */}
        {/* <div className="flex border border-gray-300 rounded">
          {["B. Days", "Weeks", "Months"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${tabButtonStyle(tab)} ${
                tab === "B. Days"
                  ? "rounded-l"
                  : tab === "Months"
                  ? "rounded-r"
                  : ""
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div> */}
      </div>
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Execution targeted start date
          </label>
          <Controller
            name="executionStartDate"
            control={control}
            rules={{ required: "Execution start date is required" }}
            render={({ field: { onChange, value } }) => (
              <Datepicker
                value={value ? { startDate: value, endDate: value } : null}
                onChange={(newValue) =>
                  onChange(newValue ? newValue.startDate : null)
                }
                useRange={false}
                asSingle={true}
                displayFormat="DD-MMM-YYYY"
                placeholder="Select date"
              />
            )}
          />
          {errors.executionStartDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.executionStartDate.message}
            </p>
          )}
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
                  className={`w-full p-2 border ${
                    errors.executionDuration
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded appearance-none bg-white`}
                  {...field}
                >
                  {getDurationOptions(activeTab).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
        <div>
          <label className="block text-sm font-semibold mb-1">
            Maintenance & operation duration{" "}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="maintenanceDate"
            control={control}
            rules={{ required: "Maintenance date is required" }}
            render={({ field: { onChange, value } }) => (
              <Datepicker
                value={value ? { startDate: value, endDate: value } : null}
                onChange={(newValue) =>
                  onChange(newValue ? newValue.startDate : null)
                }
                useRange={false}
                asSingle={true}
                displayFormat="DD-MMM-YYYY"
                placeholder="Select date"
              />
            )}
          />
          {errors.maintenanceDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.maintenanceDate.message}
            </p>
          )}
        </div>
      </div>
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
              <th className="border border-gray-300 p-2 text-left">End Date</th>
            </tr>
          </thead>
          <tbody>
            {scheduleTableData.map((row) => (
              <tr key={row.phaseId} className={getRowColor(row.mainPhase)}>
                <td className="border border-gray-300 p-2">{row.mainPhase}</td>
                <td className="border border-gray-300 p-2">{row.subPhase}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="w-full p-1 border border-gray-300 rounded appearance-none"
                        value={row.duration}
                        onChange={(e) =>
                          handleDurationChange(
                            row.phaseId,
                            e.target.value,
                            durationTypes[row.phaseId] || activeTab
                          )
                        }
                      >
                        {getDurationOptions(
                          durationTypes[row.phaseId] || activeTab
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
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
                        value={durationTypes[row.phaseId] || activeTab}
                        onChange={(e) =>
                          handleDurationChange(
                            row.phaseId,
                            row.duration,
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
                <td className="border border-gray-300 p-2">
                  {row.startDate || "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  {row.endDate || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleScheduleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={
          !scheduleTableData.length ||
          scheduleTableData.some(
            (phase) =>
              !phase.startDate ||
              !phase.endDate ||
              phase.startDate === "N/A" ||
              phase.endDate === "N/A"
          ) ||
          errors.executionStartDate ||
          errors.executionDuration ||
          errors.maintenanceDate
        }
      >
        Update Schedule
      </button>
    </div>
  );
};

export default UpdateSchedulePlanSection;
