import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

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
      executionDuration: "4 weeks",
      maintenanceDate: null,
    },
  });

  const executionStartDate = watch("executionStartDate");

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

    // Set initial form values
    if (execution_start_date) {
      setValue("executionStartDate", new Date(execution_start_date));
    }
    if (execution_duration) {
      setValue("executionDuration", execution_duration);
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

    // Fetch existing schedule or phases
    fetchSchedulePlan(id, project_budget);
  }, [projectData, setValue]);

  // Fetch existing schedule plan or phases if none exists
  const fetchSchedulePlan = async (projectId, budget) => {
    try {
      const response = await axios.post(`/data-management/getSchedulePlan`, {
        projectId,
      });
      if (
        response.data.status === "success" &&
        response.data.result.length > 0
      ) {
        const fetchedSchedule = response.data.result.map((plan) => ({
          phaseId: plan.phase_id,
          mainPhase: plan.main_phase,
          subPhase: plan.phase_name,
          duration: `${plan.duration_days} days`,
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
      fetchPhases(budget, projectId); // Fallback to fetching phases
    }
  };

  const fetchPhases = async (budget, projectId) => {
    try {
      const response = await axios.post(`/data-management/getPhases`, {
        budget,
      });
      if (response.data.status === "success") {
        const initialSchedule = response.data.result.map((phase) => ({
          phaseId: phase.id,
          mainPhase: phase.main_phase,
          subPhase: phase.phase_name,
          duration: `${phase.duration_weeks || 1} weeks`,
          durationDays: (phase.duration_weeks || 1) * 7,
          startDate: null,
          endDate: null,
        }));
        setScheduleTableData(initialSchedule);
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
      toast.error("Failed to load phases");
    }
  };

  // Handle schedule submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    console.log("Inside handleScheduleSubmit");

    if (!projectData?.id) {
      toast.error("Project ID is missing");
      return;
    }

    // Validate that all phases have start and end dates
    const invalidPhases = scheduleTableData.filter(
      (phase) => !phase.startDate || !phase.endDate
    );
    if (invalidPhases.length > 0) {
      toast.error(
        "All phases must have start and end dates before updating the schedule."
      );
      return;
    }

    // Prepare the schedule payload for the backend
    const schedulePayload = scheduleTableData.map((phase) => ({
      phaseId: phase.phaseId,
      durationDays: phase.durationDays,
      startDate: format(new Date(phase.startDate), "yyyy-MM-dd"), // Convert to YYYY-MM-DD
      endDate: format(new Date(phase.endDate), "yyyy-MM-dd"), // Convert to YYYY-MM-DD
    }));
    console.log("Schedule Update Payload:", schedulePayload);

    try {
      const response = await axios.post(`/data-management/upsertSchedulePlan`, {
        projectId: projectData.id,
        schedule: schedulePayload,
      });

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

  // Convert duration to days
  const convertToDays = (durationStr) => {
    const daysMatch = durationStr.match(/(\d+)\s*days?/i);
    if (daysMatch) return parseInt(daysMatch[1], 10);
    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/i);
    if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;
    const monthsMatch = durationStr.match(/(\d+)\s*months?/i);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;
    return 0;
  };

  // Add duration in days (backwards calculation from end date)
  const addDuration = (date, durationDays) => {
    if (!date || durationDays <= 0) return null;
    return addDays(date, -durationDays);
  };

  // Recalculate dates based on execution start date
  useEffect(() => {
    if (!executionStartDate || !scheduleTableData.length) {
      setScheduleTableData((prev) =>
        prev.map((phase) => ({ ...phase, startDate: null, endDate: null }))
      );
      return;
    }

    const tempSchedule = [];
    [...scheduleTableData].reverse().forEach((phase, index) => {
      if (index === 0) {
        const endDate = new Date(executionStartDate);
        const startDate = addDuration(endDate, phase.durationDays);
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: startDate ? format(startDate, "dd-MMM-yyyy") : null,
        });
      } else {
        const prevPhase = tempSchedule[index - 1];
        const endDate = new Date(prevPhase.startDate);
        const startDate = addDuration(endDate, phase.durationDays);
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: startDate ? format(startDate, "dd-MMM-yyyy") : null,
        });
      }
    });
    setScheduleTableData(tempSchedule.reverse());
  }, [executionStartDate]);

  // Handle duration change
  const handleDurationChange = (phaseId, newDuration, newType) => {
    const durationDays = convertToDays(newDuration);
    const updatedSchedule = scheduleTableData.map((phase) =>
      phase.phaseId === phaseId
        ? { ...phase, duration: newDuration, durationDays }
        : phase
    );

    setDurationTypes((prevTypes) => ({
      ...prevTypes,
      [phaseId]: newType,
    }));

    if (executionStartDate) {
      const tempSchedule = [];
      [...updatedSchedule].reverse().forEach((phase, index) => {
        if (index === 0) {
          const endDate = new Date(executionStartDate);
          const startDate = addDuration(endDate, phase.durationDays);
          tempSchedule.push({
            ...phase,
            endDate: format(endDate, "dd-MMM-yyyy"),
            startDate: startDate ? format(startDate, "dd-MMM-yyyy") : null,
          });
        } else {
          const prevPhase = tempSchedule[index - 1];
          const endDate = new Date(prevPhase.startDate);
          const startDate = addDuration(endDate, phase.durationDays);
          tempSchedule.push({
            ...phase,
            endDate: format(endDate, "dd-MMM-yyyy"),
            startDate: startDate ? format(startDate, "dd-MMM-yyyy") : null,
          });
        }
      });
      setScheduleTableData(tempSchedule.reverse());
    } else {
      setScheduleTableData(updatedSchedule);
    }
  };

  // Convert duration for display
  const convertDuration = (durationDays, targetUnit) => {
    if (durationDays <= 0) return "0 days";
    if (targetUnit === "B. Days") {
      return `${durationDays} day${durationDays !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Weeks") {
      const weeks = Math.floor(durationDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else if (targetUnit === "Months") {
      const months = Math.floor(durationDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${durationDays} days`;
  };

  // Duration options
  const getDurationOptions = (type) => {
    if (type === "B. Days") {
      return Array.from({ length: 30 }, (_, i) => ({
        value: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
        label: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
      }));
    } else if (type === "Weeks") {
      return Array.from({ length: 12 }, (_, i) => ({
        value: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
        label: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
      }));
    } else if (type === "Months") {
      return Array.from({ length: 12 }, (_, i) => ({
        value: `${i + 1} month${i + 1 > 1 ? "s" : ""}`,
        label: `${i + 1} month${i + 1 > 1 ? "s" : ""}`,
      }));
    }
    return Array.from({ length: 30 }, (_, i) => ({
      value: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
      label: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
    }));
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
        <div className="flex border border-gray-300 rounded">
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
                {getDurationOptions(activeTab).map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
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
            {scheduleTableData.map((row, index) => (
              <tr key={index} className={getRowColor(row.mainPhase)}>
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
                        ).map((option, idx) => (
                          <option key={idx} value={option.value}>
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
                        {["B. Days", "Weeks", "Months"].map((type, idx) => (
                          <option key={idx} value={type}>
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
