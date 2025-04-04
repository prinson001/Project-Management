import React, { useState, useEffect, useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { addDays, format, isValid, parse, parseISO } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UpdateSchedulePlanSection = React.memo(
  ({ projectData, onScheduleUpdate, budget, projectType }) => {
    const isInternalSchedule = ["1", "4"].includes(projectType?.toString());

    const [activeTab, setActiveTab] = useState("B. Days");
    const [phases, setPhases] = useState([]);
    const [scheduleTableData, setScheduleTableData] = useState([]);
    const [durationTypes, setDurationTypes] = useState({});
    const {
      control,
      formState: { errors },
      watch,
      setValue,
      reset,
    } = useForm({
      defaultValues: {
        executionStartDate: null,
        executionDuration: "4", // Number of weeks as string
        maintenanceDate: null,
      },
    });

    const executionStartDate = watch("executionStartDate");
    const executionDuration = watch("executionDuration");
    const maintenanceDate = watch("maintenanceDate");

    // Utility Functions
    const convertToDays = useCallback((durationStr, currentUnit) => {
      if (typeof durationStr === "number") return durationStr;
      if (typeof durationStr !== "string") return 0;

      const daysMatch = durationStr.match(/(\d+)\s*days?/i);
      if (daysMatch) return parseInt(daysMatch[1], 10);

      const weeksMatch = durationStr.match(/(\d+)\s*weeks?/i);
      if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;

      const monthsMatch = durationStr.match(/(\d+)\s*months?/i);
      if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;

      const numMatch = durationStr.match(/^\d+$/);
      if (numMatch) {
        const num = parseInt(durationStr, 10);
        if (currentUnit === "Weeks") return num * 7;
        if (currentUnit === "Months") return num * 30;
        return num;
      }
      return 0;
    }, []);

    const addDuration = useCallback((date, durationDays) => {
      if (!date || !isValid(date) || durationDays <= 0) return null;
      return addDays(date, -durationDays); // Reverse calculation for end-to-start
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

    // Fetch and Initialize Schedule
    // Fetch and Initialize Schedule
    // Replace the Fetch and Initialize Schedule useEffect with:
    useEffect(() => {
      if (!projectData?.id) {
        setScheduleTableData([]);
        reset({
          executionStartDate: null,
          executionDuration: "4",
          maintenanceDate: null,
        });
        return;
      }

      const initializeSchedule = async () => {
        const projectId = projectData.id;
        const projectBudget = budget || projectData.project_budget;

        // Set initial form values
        const {
          execution_start_date,
          execution_duration,
          maintenance_duration,
        } = projectData;
        let execStartDate = execution_start_date
          ? parseISO(execution_start_date)
          : null;
        let execDuration = "4"; // Default to 4 weeks
        if (execution_duration) {
          let weeks = 4;
          if (typeof execution_duration === "string") {
            const daysMatch = execution_duration.match(/(\d+)\s*days?/i);
            const weeksMatch = execution_duration.match(/(\d+)\s*weeks?/i);
            if (daysMatch) {
              const days = parseInt(daysMatch[1], 10);
              weeks = Math.round(days / 7);
            } else if (weeksMatch) {
              weeks = parseInt(weeksMatch[1], 10);
            } else {
              const num = parseInt(execution_duration, 10);
              weeks = isNaN(num) ? 4 : num;
            }
          } else if (typeof execution_duration === "number") {
            weeks = Math.round(execution_duration / 7);
          }
          execDuration = String(weeks);
        }
        let maintDate = maintenance_duration
          ? parseISO(maintenance_duration)
          : null;

        reset({
          executionStartDate: isValid(execStartDate) ? execStartDate : null,
          executionDuration: execDuration,
          maintenanceDate: isValid(maintDate) ? maintDate : null,
        });

        try {
          // Fetch existing schedule
          const scheduleResponse = await axiosInstance.post(
            `/data-management/getSchedulePlan`,
            { projectId }
          );
          let fetchedSchedule = [];
          if (
            scheduleResponse.data.status === "success" &&
            scheduleResponse.data.result?.length > 0
          ) {
            fetchedSchedule = scheduleResponse.data.result.map((plan) => {
              const durationDays = plan.duration_days || 7;
              const startDate = plan.start_date
                ? parseISO(plan.start_date)
                : null;
              const endDate = plan.end_date ? parseISO(plan.end_date) : null;
              return {
                phaseId: plan.phase_id,
                mainPhase: plan.main_phase,
                subPhase: plan.phase_name,
                duration: convertDuration(durationDays, activeTab),
                durationDays,
                startDate:
                  startDate && isValid(startDate)
                    ? format(startDate, "dd-MMM-yyyy")
                    : "N/A",
                endDate:
                  endDate && isValid(endDate)
                    ? format(endDate, "dd-MMM-yyyy")
                    : "N/A",
              };
            });
          }

          // Define the expected phase order (based on setDefaultPhases or fetchPhases)
          const expectedOrder = [
            { phaseId: 1, mainPhase: "Planning", subPhase: "Prepare RFP" },
            {
              phaseId: 2,
              mainPhase: "Planning",
              subPhase: "RFP Releasing Procedures",
            },
            { phaseId: 3, mainPhase: "Bidding", subPhase: "Bidding Duration" },
            {
              phaseId: 4,
              mainPhase: "Bidding",
              subPhase: "Technical and financial evaluation",
            },
            {
              phaseId: 5,
              mainPhase: "Bidding",
              subPhase: "Contract preparation",
            },
            {
              phaseId: 6,
              mainPhase: "Before execution",
              subPhase: "Waiting period before execution starts",
            },
          ];

          // If no fetched schedule, fetch phases
          if (fetchedSchedule.length === 0) {
            await fetchPhases(projectBudget);
            return;
          }

          // Sort or align fetched schedule with expected order
          const orderedSchedule = expectedOrder.map((expected) => {
            const match = fetchedSchedule.find(
              (phase) => phase.phaseId === expected.phaseId
            ) || {
              phaseId: expected.phaseId,
              mainPhase: expected.mainPhase,
              subPhase: expected.subPhase,
              duration: convertDuration(7, activeTab), // Default duration
              durationDays: 7,
              startDate: "N/A",
              endDate: "N/A",
            };
            return match;
          });

          setScheduleTableData(orderedSchedule);

          // Update executionStartDate if not set, using last phase's endDate
          const lastPhase = orderedSchedule[orderedSchedule.length - 1];
          if (
            lastPhase.endDate &&
            lastPhase.endDate !== "N/A" &&
            !executionStartDate
          ) {
            const parsedEndDate = parse(
              lastPhase.endDate,
              "dd-MMM-yyyy",
              new Date()
            );
            if (isValid(parsedEndDate)) {
              setValue("executionStartDate", parsedEndDate);
            }
          }
        } catch (error) {
          console.error("Error initializing schedule:", error);
          toast.error("Failed to load schedule plan");
          await fetchPhases(projectBudget);
        }
      };

      const fetchPhases = async (budgetValue) => {
        if (!budgetValue) {
          setPhases([]);
          setScheduleTableData([]);
          return;
        }
        try {
          const response = await axiosInstance.post(
            `/data-management/getSchedulePhases`,
            { budget: budgetValue }
          );
          if (response.data.status === "success") {
            setPhases(response.data.result);
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
          toast.error("Failed to load phases, using defaults");
          setDefaultPhases();
        }
      };

      const setDefaultPhases = () => {
        const defaultPhases = [
          {
            id: 1,
            main_phase: "Planning",
            phase_name: "Prepare RFP",
            duration_days: 7,
          },
          {
            id: 2,
            main_phase: "Planning",
            phase_name: "RFP Releasing Procedures",
            duration_days: 7,
          },
          {
            id: 3,
            main_phase: "Bidding",
            phase_name: "Bidding Duration",
            duration_days: 7,
          },
          {
            id: 4,
            main_phase: "Bidding",
            phase_name: "Technical and financial evaluation",
            duration_days: 7,
          },
          {
            id: 5,
            main_phase: "Bidding",
            phase_name: "Contract preparation",
            duration_days: 7,
          },
          {
            id: 6,
            main_phase: "Before execution",
            phase_name: "Waiting period before execution starts",
            duration_days: 7,
          },
        ];
        setPhases(defaultPhases);
        setScheduleTableData(
          defaultPhases.map((phase) => ({
            phaseId: phase.id,
            mainPhase: phase.main_phase,
            subPhase: phase.phase_name,
            duration: convertDuration(phase.duration_days, activeTab),
            durationDays: phase.duration_days,
            startDate: null,
            endDate: null,
          }))
        );
      };

      initializeSchedule();
    }, [projectData, budget, reset, setValue, activeTab, convertDuration]);

    // Calculate Dates
    // Replace the Calculate Dates useEffect with:
    useEffect(() => {
      if (!executionStartDate || !isValid(executionStartDate)) {
        setScheduleTableData((prev) =>
          prev.map((phase) => ({
            ...phase,
            startDate: null,
            endDate: null,
          }))
        );
        return;
      }

      setScheduleTableData((prev) => {
        const updatedSchedule = [...prev];
        const lastIndex = updatedSchedule.length - 1;

        // Start with the last phase's endDate as executionStartDate
        updatedSchedule[lastIndex] = {
          ...updatedSchedule[lastIndex],
          endDate: format(executionStartDate, "dd-MMM-yyyy"),
        };

        // Calculate backwards from the last phase
        for (let i = lastIndex; i >= 0; i--) {
          const phase = updatedSchedule[i];
          if (i === lastIndex) {
            // Last phase: endDate is already set, calculate startDate
            const startDate = addDays(
              new Date(phase.endDate),
              -phase.durationDays
            );
            updatedSchedule[i] = {
              ...phase,
              startDate: isValid(startDate)
                ? format(startDate, "dd-MMM-yyyy")
                : "N/A",
            };
          } else {
            // Previous phases: endDate is the next phase's startDate
            const nextPhase = updatedSchedule[i + 1];
            const endDate =
              nextPhase.startDate &&
              isValid(parse(nextPhase.startDate, "dd-MMM-yyyy", new Date()))
                ? nextPhase.startDate
                : "N/A";
            const startDate =
              endDate !== "N/A"
                ? addDays(
                    parse(endDate, "dd-MMM-yyyy", new Date()),
                    -phase.durationDays
                  )
                : null;
            updatedSchedule[i] = {
              ...phase,
              endDate: endDate,
              startDate: isValid(startDate)
                ? format(startDate, "dd-MMM-yyyy")
                : "N/A",
            };
          }
        }

        return updatedSchedule;
      });
    }, [executionStartDate]);

    // Handle Duration Changes
    const handleDurationChange = useCallback(
      (phaseId, newDuration, newType) => {
        const currentUnit = durationTypes[phaseId] || activeTab;
        const durationDays = convertToDays(newDuration, currentUnit);
        const updatedType = newType || currentUnit;

        setDurationTypes((prevTypes) => ({
          ...prevTypes,
          [phaseId]: updatedType,
        }));
        const updatedDuration = convertDuration(durationDays, updatedType);

        setScheduleTableData((prevSchedule) => {
          const updatedSchedule = prevSchedule.map((phase) =>
            phase.phaseId === phaseId
              ? { ...phase, duration: updatedDuration, durationDays }
              : phase
          );

          if (executionStartDate && isValid(executionStartDate)) {
            const lastIndex = updatedSchedule.length - 1;
            updatedSchedule[lastIndex] = {
              ...updatedSchedule[lastIndex],
              endDate: format(executionStartDate, "dd-MMM-yyyy"),
            };

            for (let i = lastIndex; i >= 0; i--) {
              const phase = updatedSchedule[i];
              if (i === lastIndex) {
                const startDate = addDays(
                  new Date(phase.endDate),
                  -phase.durationDays
                );
                updatedSchedule[i] = {
                  ...phase,
                  startDate: isValid(startDate)
                    ? format(startDate, "dd-MMM-yyyy")
                    : "N/A",
                };
              } else {
                const nextPhase = updatedSchedule[i + 1];
                const endDate =
                  nextPhase.startDate &&
                  isValid(parse(nextPhase.startDate, "dd-MMM-yyyy", new Date()))
                    ? nextPhase.startDate
                    : "N/A";
                const startDate =
                  endDate !== "N/A"
                    ? addDays(
                        parse(endDate, "dd-MMM-yyyy", new Date()),
                        -phase.durationDays
                      )
                    : null;
                updatedSchedule[i] = {
                  ...phase,
                  endDate: endDate,
                  startDate: isValid(startDate)
                    ? format(startDate, "dd-MMM-yyyy")
                    : "N/A",
                };
              }
            }
          }

          return updatedSchedule;
        });
      },
      [convertToDays, convertDuration, activeTab, executionStartDate]
    );

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
      setScheduleTableData((prev) =>
        prev.map((phase) => ({
          ...phase,
          duration: convertDuration(phase.durationDays, tab),
        }))
      );
      setDurationTypes((prev) => {
        const newTypes = {};
        Object.keys(prev).forEach((phaseId) => {
          newTypes[phaseId] = tab;
        });
        return newTypes;
      });
    };

    if (isInternalSchedule) {
      return null;
    }

    const handleUpdateSchedule = async () => {
      if (!projectData?.id) {
        toast.error("No project ID available to update the schedule");
        return;
      }

      if (!executionStartDate || !isValid(executionStartDate)) {
        toast.error("Execution Start Date is required to update the schedule");
        return;
      }

      const totalWeeks = parseInt(executionDuration || "0", 10);
      const executionEndDate =
        executionStartDate && isValid(executionStartDate)
          ? addDays(executionStartDate, totalWeeks * 7)
          : null;

      // Recalculate dates to ensure all phases have valid startDate and endDate
      let currentEndDate = new Date(executionStartDate);
      const updatedSchedule = scheduleTableData.map((phase) => {
        const startDate = addDuration(currentEndDate, phase.durationDays);
        const newPhase = {
          ...phase,
          endDate: isValid(currentEndDate)
            ? format(currentEndDate, "yyyy-MM-dd")
            : null,
          startDate:
            startDate && isValid(startDate)
              ? format(startDate, "yyyy-MM-dd")
              : null,
        };
        currentEndDate =
          startDate && isValid(startDate)
            ? new Date(startDate)
            : currentEndDate;
        return newPhase;
      });

      // Filter out phases with null dates (backend requires non-null)
      const validSchedule = updatedSchedule.filter(
        (phase) => phase.startDate && phase.endDate
      );

      if (validSchedule.length === 0) {
        toast.error("No valid schedule phases to update");
        return;
      }

      const schedulePayload = {
        projectId: projectData.id,
        execution_start_date:
          executionStartDate && isValid(executionStartDate)
            ? format(executionStartDate, "yyyy-MM-dd")
            : null,
        execution_duration: `${totalWeeks} weeks`,
        maintenance_duration:
          maintenanceDate && isValid(maintenanceDate)
            ? format(maintenanceDate, "yyyy-MM-dd")
            : executionEndDate && isValid(executionEndDate)
            ? format(executionEndDate, "yyyy-MM-dd")
            : null,
        schedule: validSchedule.map((phase) => ({
          phaseId: phase.phaseId,
          durationDays: phase.durationDays,
          startDate: phase.startDate, // Already in "yyyy-MM-dd"
          endDate: phase.endDate, // Already in "yyyy-MM-dd"
        })),
      };

      try {
        const response = await axiosInstance.post(
          `/data-management/upsertSchedulePlan`,
          schedulePayload
        );
        if (response.data.status === "success") {
          toast.success("Schedule plan updated successfully!");
          // Update local state with valid dates
          setScheduleTableData(
            updatedSchedule.map((phase) => ({
              ...phase,
              startDate: phase.startDate
                ? format(new Date(phase.startDate), "dd-MMM-yyyy")
                : "N/A",
              endDate: phase.endDate
                ? format(new Date(phase.endDate), "dd-MMM-yyyy")
                : "N/A",
            }))
          );
          onScheduleUpdate && onScheduleUpdate(schedulePayload);
        } else {
          throw new Error(response.data.message || "Failed to update schedule");
        }
      } catch (error) {
        console.error("Error updating schedule:", error);
        toast.error(error.message || "Failed to update schedule plan");
      }
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
              Execution Targeted Start Date
            </label>
            <Controller
              name="executionStartDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  showIcon
                  selected={value && isValid(value) ? value : null}
                  onChange={onChange}
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="Select date"
                  className="w-full p-2 border border-gray-300 rounded"
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
                  placeholder="Enter weeks (e.g., 8)"
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
              Maintenance & Operation Date{" "}
              <span className="text-red-500">*</span>
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
                <th className="border border-gray-300 p-2 text-left">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduleTableData.map((row) => (
                <tr key={row.phaseId} className={getRowColor(row.mainPhase)}>
                  <td className="border border-gray-300 p-2">
                    {row.mainPhase}
                  </td>
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
          type="button"
          onClick={handleUpdateSchedule}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Schedule
        </button>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.projectData?.id === nextProps.projectData?.id &&
    prevProps.budget === nextProps.budget &&
    prevProps.projectData?.execution_start_date ===
      nextProps.projectData?.execution_start_date &&
    prevProps.projectData?.execution_duration ===
      nextProps.projectData?.execution_duration &&
    prevProps.projectData?.maintenance_duration ===
      nextProps.projectData?.maintenance_duration &&
    prevProps.projectType === nextProps.projectType &&
    prevProps.onScheduleUpdate === nextProps.onScheduleUpdate
);

export default UpdateSchedulePlanSection;
