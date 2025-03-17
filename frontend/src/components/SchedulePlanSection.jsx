import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { addDays, addWeeks, addMonths, format } from "date-fns";
import { toast } from "sonner"; // For notifications

const PORT = import.meta.env.VITE_PORT;

const SchedulePlanSection = ({ projectId ,onScheduleChange}) => {
  const [activeTab, setActiveTab] = useState("B. Days");
  const [phaseDurations, setPhaseDurations] = useState([]);
  const [scheduleTableData, setScheduleTableData] = useState([]);


  const [originalDurations, setOriginalDurations] = useState({});
  const [durationTypes, setDurationTypes] = useState({});

  const {
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      executionStartDate: null,
      executionDuration: "4 weeks",
      maintenanceDate: null,
    },
  });

  const executionStartDate = watch("executionStartDate");
  let budget = 2000000;

  // Fetch phase durations on component mount
  useEffect(() => {
    const fetchPhaseDurations = async () => {
      try {
        const response = await axios.post(
          `http://localhost:${PORT}/data-management/getPhaseDurationsByBudget`,
          {
            budget: budget,
          }
        );
        console.log("response", response);
        setPhaseDurations(response.data.data || []);
      } catch (error) {
        console.error("Error fetching phase durations:", error);
        // Fallback to static data
        setPhaseDurations([
          { phase_id: 1, phase_name: "Prepare RFP", duration_weeks: 3 },
          {
            phase_id: 2,
            phase_name: "RFP Releasing Procedures",
            duration_weeks: 4,
          },
          { phase_id: 3, phase_name: "Bidding Duration", duration_weeks: 1 },
          {
            phase_id: 4,
            phase_name: "Technical and financial evaluation",
            duration_weeks: 4,
          },
          {
            phase_id: 5,
            phase_name: "Contract preparation",
            duration_weeks: 1,
          },
          {
            phase_id: 6,
            phase_name: "Waiting period before execution starts",
            duration_weeks: 4,
          },
        ]);
      }
    };
    fetchPhaseDurations();
  }, []);


  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange(scheduleTableData);
    }
  }, [scheduleTableData]);

  // Fixed initial schedule data with hardcoded mainPhase and subPhase
  const initialScheduleData = [
    {
      mainPhase: "Planning",
      subPhase: "Prepare RFP",
      phaseId: 1,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
    {
      mainPhase: "Planning",
      subPhase: "RFP Releasing Procedures",
      phaseId: 2,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
    {
      mainPhase: "Bidding",
      subPhase: "Bidding Duration",
      phaseId: 3,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
    {
      mainPhase: "Bidding",
      subPhase: "Technical and financial evaluation",
      phaseId: 4,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
    {
      mainPhase: "Bidding",
      subPhase: "Contract preparation",
      phaseId: 5,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
    {
      mainPhase: "Before execution",
      subPhase: "Waiting period before execution starts",
      phaseId: 6,
      duration: "4 weeks", // Default duration
      startDate: null,
      endDate: null,
    },
  ];

  // Update durations in initialScheduleData based on phaseDurations
  useEffect(() => {
    if (phaseDurations.length > 0) {
      const updatedSchedule = initialScheduleData.map((phase) => {
        const phaseData = phaseDurations.find(
          (p) => p.phase_id === phase.phaseId
        );
        return {
          ...phase,
          duration: phaseData
            ? `${phaseData.duration_weeks} weeks`
            : phase.duration,
        };
      });
      setScheduleTableData(updatedSchedule);
    } else {
      setScheduleTableData(initialScheduleData);
    }
  }, [phaseDurations]);

  // Convert duration to days for calculation
  const convertToDays = (durationStr) => {
    const daysMatch = durationStr.match(/(\d+)\s*days?/);
    if (daysMatch) return parseInt(daysMatch[1], 10);
    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/);
    if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;
    const monthsMatch = durationStr.match(/(\d+)\s*months?/);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30; // Approximation
    // Default fallback - assume it's weeks as in original code
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) * 7 : 28; // Default to 4 weeks (28 days)
  };

  // Add appropriate time based on duration unit
  const addDuration = (date, durationStr) => {
    if (!date) return null;
    const daysMatch = durationStr.match(/(\d+)\s*days?/);
    if (daysMatch) return addDays(date, -parseInt(daysMatch[1], 10));
    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/);
    if (weeksMatch) return addWeeks(date, -parseInt(weeksMatch[1], 10));
    const monthsMatch = durationStr.match(/(\d+)\s*months?/);
    if (monthsMatch) return addMonths(date, -parseInt(monthsMatch[1], 10));
    // Default fallback - assume it's weeks as in original code
    const match = durationStr.match(/(\d+)/);
    return match ? addWeeks(date, -parseInt(match[1], 10)) : date;
  };

  // Calculate dates based on execution start date and phase durations
  useEffect(() => {
    if (!executionStartDate) {
      setScheduleTableData(initialScheduleData);
      return;
    }
    const tempSchedule = [];
    [...scheduleTableData].reverse().forEach((phase, index) => {
      if (index === 0) {
        const endDate = new Date(executionStartDate);
        const startDate = addDuration(endDate, phase.duration);
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: format(startDate, "dd-MMM-yyyy"),
        });
      } else {
        const prevPhase = tempSchedule[index - 1];
        const endDate = new Date(prevPhase.startDate);
        const startDate = addDuration(endDate, phase.duration);
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: format(startDate, "dd-MMM-yyyy"),
        });
      }
    });
    setScheduleTableData(tempSchedule.reverse());
  }, [executionStartDate]);

  // Handle duration change for a specific phase
  const handleDurationChange = (phaseId, newDuration, newType) => {
    const updatedSchedule = scheduleTableData.map((phase) =>
      phase.phaseId === phaseId ? { ...phase, duration: newDuration } : phase
    );

    setDurationTypes((prevTypes) => ({
      ...prevTypes,
      [phaseId]: newType,
    }));

    // Recalculate dates if execution start date exists
    if (executionStartDate) {
      const tempSchedule = [];
      [...updatedSchedule].reverse().forEach((phase, index) => {
        if (index === 0) {
          const endDate = new Date(executionStartDate);
          const startDate = addDuration(endDate, phase.duration);
          tempSchedule.push({
            ...phase,
            endDate: format(endDate, "dd-MMM-yyyy"),
            startDate: format(startDate, "dd-MMM-yyyy"),
          });
        } else {
          const prevPhase = tempSchedule[index - 1];
          const endDate = new Date(prevPhase.startDate);
          const startDate = addDuration(endDate, phase.duration);
          tempSchedule.push({
            ...phase,
            endDate: format(endDate, "dd-MMM-yyyy"),
            startDate: format(startDate, "dd-MMM-yyyy"),
          });
        }
      });
      setScheduleTableData(tempSchedule.reverse());
    }
  };

  // Convert duration to the selected unit
  const convertDuration = (durationStr, targetUnit) => {
    const days = convertToDays(durationStr);
    if (targetUnit === "B. Days") {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (targetUnit === "Weeks") {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    } else if (targetUnit === "Months") {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return durationStr;
  };

  // Generate duration options for dropdown based on selected unit tab
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
    // Default to weeks
    return Array.from({ length: 12 }, (_, i) => ({
      value: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
      label: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
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

  // Handle tab change and convert durations
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const updatedSchedule = scheduleTableData.map((phase) => ({
      ...phase,
      duration: convertDuration(phase.duration, tab),
    }));
    setScheduleTableData(updatedSchedule);
  };

  // Save schedule data
  const handleSaveSchedule = async () => {
    projectId = 1;
    if (!projectId) {
      toast.error("Project ID is required to save the schedule.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:${PORT}/data-management/upsertSchedulePlan`,
        {
          projectId,
          schedule: scheduleTableData,
        }
      );
      if (response.data && response.data.status === "success") {
        console.log(response.data)
        toast.success("Schedule saved successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(error.message || "Failed to save schedule");
    }
  };

  return (
    <div className="mb-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Schedule Plan</h3>
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
            render={({ field: { onChange, value } }) => (
              <Datepicker
                value={value ? { startDate: value, endDate: value } : null}
                onChange={(newValue) => onChange(newValue.startDate)}
                useRange={false}
                asSingle={true}
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
                value={value}
                onChange={(newValue) => onChange(newValue.startDate)}
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

      {/* Save Schedule Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSchedule}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default SchedulePlanSection;