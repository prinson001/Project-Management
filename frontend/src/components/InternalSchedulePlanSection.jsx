import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { subDays, format, parseISO, isValid } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../axiosInstance";
import { toast } from "sonner";

const InternalSchedulePlanSection = ({
  onScheduleChange,
  internalScheduleData = [],
  projectId,
}) => {
  const [internalSchedule, setInternalSchedule] = useState([]);
  const [activeTab] = useState("B. Days"); // Fixed to Business Days for consistency
  const prevScheduleRef = useRef([]);

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      executionTargetDate: null,
      executionDuration: "4", // Number of weeks as string
      maintenanceDate: null,
    },
  });

  const executionTargetDate = watch("executionTargetDate");
  const executionDuration = watch("executionDuration");
  const maintenanceDate = watch("maintenanceDate");

  // Utility functions inspired by UpdateSchedulePlanSection
  const convertToDays = useCallback((durationStr) => {
    if (typeof durationStr === "number") return durationStr;
    if (typeof durationStr !== "string") return 0;

    const daysMatch = durationStr.match(/(\d+)\s*days?/i);
    if (daysMatch) return parseInt(daysMatch[1], 10);

    const weeksMatch = durationStr.match(/(\d+)\s*weeks?/i);
    if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;

    const monthsMatch = durationStr.match(/(\d+)\s*months?/i);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;

    const numMatch = durationStr.match(/^\d+$/);
    if (numMatch) return parseInt(numMatch[0], 10) * 7; // Assume weeks for numeric input

    return 0;
  }, []);

  const convertDuration = useCallback((durationDays) => {
    if (durationDays <= 0) return "0 days";
    return `${durationDays} day${durationDays !== 1 ? "s" : ""}`;
  }, []);

  const defaultInternalSchedule = useCallback(
    () => [
      {
        id: 1,
        mainPhase: "Planning",
        subPhase: "Prepare scope",
        duration: "28 days",
        durationDays: 28,
        startDate: null,
        endDate: null,
      },
      {
        id: 4,
        mainPhase: "Execution",
        subPhase: "Execute phase",
        duration: convertDuration(convertToDays("4")), // Default to 4 weeks
        durationDays: convertToDays("4"), // 28 days
        startDate: null,
        endDate: null,
      },
    ],
    [convertDuration, convertToDays]
  );

  const calculateDates = useCallback(() => {
    if (!executionTargetDate || !isValid(executionTargetDate)) {
      setInternalSchedule((prev) =>
        prev.map((phase) => ({
          ...phase,
          startDate: null,
          endDate: null,
        }))
      );
      return;
    }

    setInternalSchedule((prev) => {
      const planningPhase = prev.find((p) => p.id === 1);
      const executionPhase = prev.find((p) => p.id === 4);

      if (!planningPhase || !executionPhase) return prev;

      const executionEnd = new Date(executionTargetDate);
      const executionStart = subDays(executionEnd, executionPhase.durationDays);
      const planningEnd = new Date(executionStart);
      const planningStart = subDays(planningEnd, planningPhase.durationDays);

      const formatDate = (date) => format(date, "yyyy-MM-dd");

      return prev.map((phase) => {
        if (phase.id === 1) {
          return {
            ...phase,
            startDate: formatDate(planningStart),
            endDate: formatDate(planningEnd),
          };
        }
        if (phase.id === 4) {
          return {
            ...phase,
            startDate: formatDate(executionStart),
            endDate: formatDate(executionEnd),
          };
        }
        return phase;
      });
    });
  }, [executionTargetDate]);

  // Sync executionDuration with the Execution phase, similar to UpdateSchedulePlanSection
  useEffect(() => {
    const durationInWeeks = parseInt(executionDuration, 10);
    if (!isNaN(durationInWeeks)) {
      const durationDays = convertToDays(executionDuration);
      setInternalSchedule((prev) =>
        prev.map((phase) =>
          phase.id === 4
            ? {
                ...phase,
                duration: convertDuration(durationDays),
                durationDays,
              }
            : phase
        )
      );
    }
  }, [executionDuration, convertToDays, convertDuration]);

  useEffect(() => {
    const fetchInternalSchedule = async () => {
      if (!projectId) {
        const defaultSchedule = defaultInternalSchedule();
        setInternalSchedule(defaultSchedule);
        prevScheduleRef.current = defaultSchedule;
        return;
      }

      try {
        const response = await axiosInstance.post(
          `/data-management/getInternalSchedulePlan`,
          { projectId }
        );

        if (response.data.status === "success" && response.data.result) {
          const fetchedData = response.data.result
            .filter((phase) => [1, 4].includes(phase.phase_id))
            .map((phase) => ({
              id: phase.phase_id,
              mainPhase: phase.main_phase,
              subPhase: phase.phase_name,
              duration: convertDuration(phase.duration_days),
              durationDays: phase.duration_days,
              startDate: phase.start_date,
              endDate: phase.end_date,
            }));

          const mergedSchedule = defaultInternalSchedule().map(
            (defaultPhase) => {
              const fetchedPhase = fetchedData.find(
                (p) => p.id === defaultPhase.id
              );
              return fetchedPhase || { ...defaultPhase };
            }
          );

          setInternalSchedule(mergedSchedule);
          prevScheduleRef.current = mergedSchedule;

          if (fetchedData.length > 0) {
            const executionPhase = fetchedData.find((p) => p.id === 4);
            if (executionPhase?.endDate) {
              const parsedEndDate = parseISO(executionPhase.endDate);
              if (isValid(parsedEndDate)) {
                setValue("executionTargetDate", parsedEndDate);
              }
            }
            if (response.data.execution_duration) {
              let weeks = 4;
              if (typeof response.data.execution_duration === "string") {
                const daysMatch =
                  response.data.execution_duration.match(/(\d+)\s*days?/i);
                const weeksMatch =
                  response.data.execution_duration.match(/(\d+)\s*weeks?/i);
                if (daysMatch) {
                  weeks = Math.round(parseInt(daysMatch[1], 10) / 7);
                } else if (weeksMatch) {
                  weeks = parseInt(weeksMatch[1], 10);
                } else {
                  weeks = parseInt(response.data.execution_duration, 10) || 4;
                }
              }
              setValue("executionDuration", String(weeks));
            }
            if (response.data.maintenance_date) {
              const parsedMaintDate = parseISO(response.data.maintenance_date);
              if (isValid(parsedMaintDate)) {
                setValue("maintenanceDate", parsedMaintDate);
              }
            }
          }
        } else {
          const defaultSchedule = defaultInternalSchedule();
          setInternalSchedule(defaultSchedule);
          prevScheduleRef.current = defaultSchedule;
        }
      } catch (error) {
        console.error("Error fetching internal schedule data:", error);
        toast.error("Failed to load internal schedule data");
        const defaultSchedule = defaultInternalSchedule();
        setInternalSchedule(defaultSchedule);
        prevScheduleRef.current = defaultSchedule;
      }
    };

    fetchInternalSchedule();
  }, [projectId, defaultInternalSchedule, setValue, convertDuration]);

  useEffect(() => {
    calculateDates();
  }, [executionTargetDate, calculateDates]);

  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange({
        schedule: internalSchedule,
        executionDuration: executionDuration
          ? `${executionDuration} weeks`
          : null,
        maintenanceDate: maintenanceDate
          ? format(maintenanceDate, "yyyy-MM-dd")
          : null,
      });
    }
  }, [internalSchedule, executionDuration, maintenanceDate, onScheduleChange]);

  const handleInternalDurationChange = useCallback(
    (id, newDuration) => {
      const durationDays = convertToDays(newDuration);
      setInternalSchedule((prev) => {
        const updatedSchedule = prev.map((phase) =>
          phase.id === id
            ? {
                ...phase,
                duration: convertDuration(durationDays),
                durationDays,
              }
            : phase
        );
        prevScheduleRef.current = updatedSchedule;
        return updatedSchedule;
      });

      setTimeout(() => {
        calculateDates();
      }, 0);
    },
    [convertToDays, convertDuration, calculateDates]
  );

  const getDurationOptions = () => {
    return Array.from({ length: 90 }, (_, i) => ({
      value: `${i + 1} days`,
      label: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
    }));
  };

  return (
    <div className="mb-6 border-t pt-4">
      <h3 className="font-semibold mb-4">Internal Project Schedule Plan</h3>
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Execution Target Date (End Date)
          </label>
          <Controller
            name="executionTargetDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                showIcon
                selected={value && isValid(value) ? value : null}
                onChange={onChange}
                dateFormat="dd-MMM-yyyy"
                placeholderText="Select target date"
                className="w-full p-2 border border-gray-300 rounded"
                isClearable
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Execution Duration (Weeks) <span className="text-red-500">*</span>
          </label>
          <Controller
            name="executionDuration"
            control={control}
            rules={{
              required: "Execution duration is required",
              min: { value: 1, message: "Duration must be at least 1 week" },
              pattern: {
                value: /^[0-9]+$/,
                message: "Please enter a valid number of weeks",
              },
            }}
            render={({ field }) => (
              <input
                type="number"
                min="1"
                className={`w-full p-2 border ${
                  errors.executionDuration
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded`}
                placeholder="Enter weeks (e.g., 4)"
                {...field}
              />
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
            Maintenance & Operation Date <span className="text-red-500">*</span>
          </label>
          <Controller
            name="maintenanceDate"
            control={control}
            rules={{ required: "Maintenance date is required" }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                showIcon
                selected={value && isValid(value) ? value : null}
                onChange={onChange}
                minDate={executionTargetDate}
                dateFormat="dd-MMM-yyyy"
                placeholderText="Select date"
                className="w-full p-2 border border-gray-300 rounded"
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
            {internalSchedule.map((row) => (
              <tr
                key={row.id}
                className={
                  row.mainPhase === "Planning" ? "bg-green-100" : "bg-blue-100"
                }
              >
                <td className="border border-gray-300 p-2">{row.mainPhase}</td>
                <td className="border border-gray-300 p-2">{row.subPhase}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <div className="relative w-24">
                    <select
                      className="w-full p-1 border border-gray-300 rounded appearance-none"
                      value={row.duration}
                      onChange={(e) =>
                        handleInternalDurationChange(row.id, e.target.value)
                      }
                    >
                      {getDurationOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  {row.startDate && isValid(new Date(row.startDate))
                    ? format(new Date(row.startDate), "dd-MMM-yyyy")
                    : "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  {row.endDate && isValid(new Date(row.endDate))
                    ? format(new Date(row.endDate), "dd-MMM-yyyy")
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalSchedulePlanSection;
