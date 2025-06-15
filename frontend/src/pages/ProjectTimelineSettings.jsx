import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
const PORT = import.meta.env.VITE_PORT;

// ArrowIcon Component
const ArrowIcon = ({
  direction = "down",
  size = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
};

// WeekDropdown Component
const WeekDropdown = ({
  value,
  onChange,
  options = [
    "1 weeks",
    "2 weeks",
    "3 weeks",
    "4 weeks",
    "5 weeks",
    "6 weeks",
    "7 weeks",
    "8 weeks",
    "9 weeks",
    "10 weeks",
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex justify-between items-center cursor-pointer w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{value}</span>
        <ArrowIcon
          direction={isOpen ? "up" : "down"}
          size={16}
          className="text-gray-400"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full h-[200px] bg-white border rounded shadow-lg overflow-y-scroll">
          {options.map((option) => (
            <div
              key={option}
              className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                option === value ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// RangeSettingsDropdown Component
const RangeSettingsDropdown = ({
  isOpen,
  onClose,
  onSave, // This function should now expect full numeric values
  budgetRanges: initialBudgetRanges,
  // setBudgetRanges is not directly used here for parent state, onSave handles it
}) => {
  const [localBudgetRanges, setLocalBudgetRanges] = useState([]);

  useEffect(() => {
    // Initialize local state. Assume initialBudgetRanges now provides full numeric values.
    const initializedRanges = initialBudgetRanges.map((range) => ({
      ...range,
      min_budget: range.min_budget, // Should be full number from API
      max_budget: range.max_budget, // Should be full number from API
    }));
    setLocalBudgetRanges(initializedRanges);
  }, [initialBudgetRanges]);

  const handleAddRange = () => {
    setLocalBudgetRanges([
      ...localBudgetRanges,
      {
        id: `new_${Date.now()}`, // Temporary ID for new unsaved ranges
        label: "",
        min_budget: 0,
        max_budget: 0,
        budget_order: localBudgetRanges.length, // Basic ordering
        isNew: true,
      },
    ]);
  };

  const handleRemoveRange = (id) => {
    // If it's a new range not yet saved, just remove from local state.
    // If it's an existing range, mark for deletion or handle differently.
    // For simplicity here, we'll just filter. The backend `updateBudgetRanges`
    // would need to handle actual deletions if an ID is provided.
    setLocalBudgetRanges(
      localBudgetRanges.filter((range) => range.id !== id)
    );
  };

  const handleChange = (id, field, value) => {
    setLocalBudgetRanges(
      localBudgetRanges.map((range) => {
        if (range.id === id) {
          // Ensure min/max budgets are treated as numbers for input state
          if (field === "min_budget" || field === "max_budget") {
            return { ...range, [field]: value === "" ? "" : Number(value) };
          }
          return { ...range, [field]: value };
        }
        return range;
      })
    );
  };

  const handleSave = () => {
    const rangesToSave = localBudgetRanges.map((range) => ({
      ...range,
      min_budget: parseFloat(range.min_budget) || 0,
      max_budget: parseFloat(range.max_budget) || 0,
      // if max_budget can be null for 'no limit', handle that case:
      // max_budget: range.max_budget === null || range.max_budget === '' ? null : parseFloat(range.max_budget),
    }));
    onSave(rangesToSave); // Pass the processed ranges to the parent save function
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        Edit Budget Ranges
      </h3>
      {localBudgetRanges.map((range, index) => (
        <div
          key={range.id || index}
          className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50"
        >
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label
                htmlFor={`label-${range.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Label (e.g., 0-1M)
              </label>
              <input
                type="text"
                id={`label-${range.id}`}
                value={range.label || ""}
                onChange={(e) =>
                  handleChange(range.id, "label", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Display Label"
              />
            </div>
            <div>
              <label
                htmlFor={`min_budget-${range.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Min Budget (e.g. 0)
              </label>
              <input
                type="number"
                id={`min_budget-${range.id}`}
                value={
                  range.min_budget === null ||
                  range.min_budget === undefined
                    ? ""
                    : range.min_budget
                }
                onChange={(e) =>
                  handleChange(range.id, "min_budget", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter full number"
              />
            </div>
            <div>
              <label
                htmlFor={`max_budget-${range.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Budget (e.g. 1000000)
              </label>
              <input
                type="number"
                id={`max_budget-${range.id}`}
                value={
                  range.max_budget === null ||
                  range.max_budget === undefined
                    ? ""
                    : range.max_budget
                }
                onChange={(e) =>
                  handleChange(range.id, "max_budget", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter full number (or leave empty for no max)"
              />
            </div>
            <div>
              <label
                htmlFor={`order-${range.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order
              </label>
              <input
                type="number"
                id={`order-${range.id}`}
                value={range.budget_order || 0}
                onChange={(e) =>
                  handleChange(
                    range.id,
                    "budget_order",
                    parseInt(e.target.value, 10)
                  )
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => handleRemoveRange(range.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove Range
          </button>
        </div>
      ))}
      <button
        onClick={handleAddRange}
        className="w-full mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Add New Range
      </button>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Ranges
        </button>
      </div>
    </div>
  );
};

// ProjectTimelineSettings Component
const ProjectTimelineSettings = () => {
  const [selectedTab, setSelectedTab] = useState(
    "Expected activities duration"
  );
  let range = [];
  const [showRangeSettings, setShowRangeSettings] = useState(false);
  const [budgetRanges, setBudgetRanges] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [changesToSave, setChangesToSave] = useState([]);
  useEffect(() => {
    const fetchranges = async () => {
      try {
        const result = await axiosInstance.get(`/admin/getBudgetRanges`);
        console.log("Fetched Data:", result.data.data);
        setBudgetRanges(result.data.data.map((item) => ({ ...item })));
      } catch (e) {
        console.log(e);
      }
    };
    const fetchPhaseData = async () => {
      try {
        const result = await axiosInstance.get(`/admin/getPhaseDurations`);
        console.log("the fetched data");
        console.log(result);
        setTimelineData(
          result.data.data.map((phase) => ({
            ...phase,
            budget_durations:
              phase.budget_durations &&
              Object.entries(phase.budget_durations).reduce(
                (acc, [key, budget]) => ({
                  ...acc,
                  [key]: {
                    ...budget,
                    duration_weeks: Math.floor(budget.duration_days / 7),
                  },
                }),
                {}
              ),
          }))
        );
      } catch (e) {
        console.log(e);
      }
    };
    fetchranges();
    fetchPhaseData();
  }, []);

  useEffect(() => {
    console.log("timeline data");
    console.log(structuredClone(timelineData));
  }, [timelineData]);

  // Track when state is updated

  const tabs = [
    "Main Roles",
    "Schedule Plan Reference",
    "Team access Policies",
    "Expected activities duration",
  ];

  const handleWeekChange = (phaseId, rangeId, newValue) => {
    setTimelineData((prevData) =>
      prevData.map((phase) => {
        if (phase.phase_id === phaseId) {
          return {
            ...phase,
            budget_durations: {
              ...phase.budget_durations,
              [rangeId]: {
                ...phase.budget_durations?.[rangeId],
                duration_weeks: parseInt(newValue) || 0,
                duration_days: parseInt(newValue) * 7,
              },
            },
          };
        }
        return phase;
      })
    );
    setChangesToSave((prevChanges) => {
      // Remove existing entry if present
      const filtered = prevChanges.filter(
        (change) =>
          !(change.phase_id === phaseId && change.range_id === rangeId)
      );

      // Add new entry
      return [
        ...filtered,
        {
          phase_id: phaseId,
          range_id: rangeId,
          duration_weeks: Number(newValue.split(" ")[0]),
        },
      ];
    });
    console.log(changesToSave);
  };

  const handleRangeSettingsSave = async (ranges) => {
    console.log("Saved ranges:", ranges);
    // Here you would update your application state with the new ranges
    try {
      const result = await axiosInstance.post(`/admin/updateBudgetRanges`, {
        updates: budgetRanges,
      });
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  async function saveData() {
    console.log("save button clicked");
    console.log("the changes to save");
    console.log(changesToSave);
    try {
      const result = await axiosInstance.post(`/admin/updatephaseduration`, {
        updates: changesToSave.map(({ duration_weeks, ...rest }) => ({
          ...rest,
          duration_days: duration_weeks * 7,
        })),
      });
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white dark:bg-black dark:text-white">
      {/* Main Content */}
      <div className="border rounded shadow-sm">
        <div className="p-4">
          {/* Table Header */}
          <div className="flex justify-between items-center mb-2">
            <div></div>
            <div className="text-right">
              <button
                className="inline-flex items-center text-sm font-medium text-gray-700"
                onClick={() => setShowRangeSettings(true)}
              >
                <span className="dark:text-gray-200">Ranges settings</span>
                <ArrowIcon direction="down" size={16} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto " style={{ minHeight: "400px" }}>
            {" "}
            {/* Extend table height */}
            <table className="w-full border-collapse rounded-xs">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-300 text-left text-sm font-medium text-gray-700">
                    Phase
                  </th>
                  {budgetRanges.map((range, index) => {
                    return (
                      <th
                        key={index}
                        className="border p-2 bg-gray-300 text-left text-sm font-medium text-gray-700"
                      >
                        {index === 0
                          ? `Budget < ${range.max}`
                          : index === budgetRanges.length - 1
                          ? `Budget > ${range.min}`
                          : `${range.min} > Budget < ${range.max}`}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {timelineData.map((row, rowIndex) => (
                  <tr key={row.phase_id}>
                    {/* Better to use unique ID instead of rowIndex */}
                    <td className="border p-2 text-sm text-gray-600 font-medium dark:bg-black dark:text-white">
                      {row.phase_name}
                    </td>
                    {budgetRanges.map((range) => (
                      <td key={range.id} className="border p-2">
                        {" "}
                        {/* Added key */}
                        <WeekDropdown
                          value={`${
                            row.budget_durations[range.id]?.duration_weeks || 0
                          } weeks`}
                          onChange={(value) =>
                            handleWeekChange(row.phase_id, range.id, value)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className=" text-sm text-gray-600 dark:text-gray-300">
            <p>
              Changing parameters will not affect projects that are already
              created.
            </p>
          </div>

          {/* Save Button */}
          <div className="mt-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm"
              onClick={saveData}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Range Settings Modal */}
      <RangeSettingsDropdown
        isOpen={showRangeSettings}
        budgetRanges={budgetRanges}
        setBudgetRanges={setBudgetRanges}
        onClose={() => setShowRangeSettings(false)}
        onSave={handleRangeSettingsSave}
      />
    </div>
  );
};

export default ProjectTimelineSettings;
