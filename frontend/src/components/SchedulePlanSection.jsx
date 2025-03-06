import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Datepicker from "react-tailwindcss-datepicker";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { addWeeks, format } from "date-fns";

const SchedulePlanSection = () => {
  const [activeTab, setActiveTab] = useState("B. Days");
  const [phaseDurations, setPhaseDurations] = useState([]);
  const [scheduleTableData, setScheduleTableData] = useState([]);

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
          "http://localhost:4000/data-management/getPhaseDurationsByBudget",
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
        const startDate = addWeeks(endDate, -extractWeeks(phase.duration));
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: format(startDate, "dd-MMM-yyyy"),
        });
      } else {
        const prevPhase = tempSchedule[index - 1];
        const endDate = new Date(prevPhase.startDate);
        const startDate = addWeeks(endDate, -extractWeeks(phase.duration));
        tempSchedule.push({
          ...phase,
          endDate: format(endDate, "dd-MMM-yyyy"),
          startDate: format(startDate, "dd-MMM-yyyy"),
        });
      }
    });

    setScheduleTableData(tempSchedule.reverse());
  }, [executionStartDate]);

  // Helper function to extract weeks from duration string
  const extractWeeks = (durationStr) => {
    const match = durationStr.match(/(\d+)\s*weeks/);
    return match ? parseInt(match[1], 10) : 4; // Default to 4 weeks
  };

  // Handle duration change for a specific phase
  const handleDurationChange = (phaseId, newDuration) => {
    const updatedSchedule = scheduleTableData.map((phase) =>
      phase.phaseId === phaseId ? { ...phase, duration: newDuration } : phase
    );

    // Recalculate dates if execution start date exists
    if (executionStartDate) {
      const tempSchedule = [];

      [...updatedSchedule].reverse().forEach((phase, index) => {
        if (index === 0) {
          const endDate = new Date(executionStartDate);
          const startDate = addWeeks(endDate, -extractWeeks(phase.duration));
          tempSchedule.push({
            ...phase,
            endDate: format(endDate, "dd-MMM-yyyy"),
            startDate: format(startDate, "dd-MMM-yyyy"),
          });
        } else {
          const prevPhase = tempSchedule[index - 1];
          const endDate = new Date(prevPhase.startDate);
          const startDate = addWeeks(endDate, -extractWeeks(phase.duration));
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

  // Generate duration options for dropdown (1 week to 12 weeks)
  const durationOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
    label: `${i + 1} week${i + 1 > 1 ? "s" : ""}`,
  }));

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
              onClick={() => setActiveTab(tab)}
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
                  {durationOptions.map((option, idx) => (
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
                  <div className="relative">
                    <select
                      className="w-full p-1 border border-gray-300 rounded appearance-none"
                      value={row.duration}
                      onChange={(e) =>
                        handleDurationChange(row.phaseId, e.target.value)
                      }
                    >
                      {durationOptions.map((option, idx) => (
                        <option key={idx} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronUp size={16} />
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
    </div>
  );
};
export default SchedulePlanSection;
