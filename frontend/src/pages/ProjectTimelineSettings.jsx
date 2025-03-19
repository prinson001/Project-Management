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
  onSave,
  budgetRanges,
  setbudgetRanges,
}) => {
  const handleInputChange = (e, index, field) => {
    console.log("budget Ranges");
    console.log(budgetRanges);
    const { value } = e.target;

    if (!isNaN(value) || value === "") {
      setbudgetRanges((prevRanges) =>
        prevRanges.map((range, i) =>
          i === index
            ? { ...range, [field]: value === "" ? null : parseInt(value) }
            : range
        )
      );
    }
  };

  const handleSave = () => {
    console.log(budgetRanges);
    if (
      budgetRanges.some((range) => {
        if (range.min != null && range.max != null) {
          range.min >= range.max;
        }
      })
    ) {
      alert("Invalid range: Min must be less than Max.");
      return;
    }
    onSave(budgetRanges);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        className="bg-white rounded shadow-lg w-72 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-center py-2 px-3 border-b">
          <h3 className="font-semibold text-gray-800">Ranges settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <ArrowIcon direction="up" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-3">
          <div className="space-y-2">
            {budgetRanges.map((range, index) => (
              <div
                key={range.id}
                className="grid grid-cols-12 gap-1 items-center"
              >
                <div className="col-span-3">
                  <span
                    className="font-medium"
                    style={{
                      color:
                        index === 0
                          ? "#1d4ed8"
                          : index === 1
                          ? "#d97706"
                          : index === 2
                          ? "#059669"
                          : "#dc2626",
                    }}
                  >
                    {range.name}
                  </span>
                </div>

                {index < 3 ? (
                  <>
                    <div className="col-span-2 text-right pr-1">
                      {index > 0 && (
                        <input
                          type="text"
                          className="w-full py-1 px-2 border rounded text-center"
                          value={range.min}
                          name={range.id}
                          onChange={(e) => handleInputChange(e, index, "min")}
                        />
                      )}
                    </div>
                    <div className="col-span-3 text-center text-sm">
                      {index === 0 ? (
                        <span className="text-gray-600">Budget</span>
                      ) : (
                        <span className="text-gray-600">&gt; Budget</span>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-gray-600">&lt;</span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        className="w-full py-1 px-2 border rounded text-center"
                        value={range.max}
                        name={range.id}
                        onChange={(e) => handleInputChange(e, index, "max")}
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 flex items-center">
                    <span className="text-gray-600 mr-1">Budget</span>
                    <span className="text-gray-600 mx-1">&gt;</span>
                    <input
                      type="text"
                      className="w-12 py-1 px-2 border rounded text-center"
                      value={range.min}
                      name={range.id}
                      onChange={(e) => handleInputChange(e, index, "min")}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-3 text-xs text-gray-500 italic">
            Values are equivalent to million SAR
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
          >
            Save
          </button>
        </div>
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
  const [budgetRanges, setbudgetRanges] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [changesToSave, setChangesToSave] = useState([]);
  useEffect(() => {
    const fetchranges = async () => {
      try {
        const result = await axiosInstance.get(`/admin/getBudgetRanges`);
        console.log("Fetched Data:", result.data.data);
        setbudgetRanges(result.data.data.map((item) => ({ ...item })));
      } catch (e) {
        console.log(e);
      }
    };
    const fetchPhaseData = async () => {
      try {
        const result = await axiosInstance.get(`/admin/getPhaseDurations`);
        console.log("the fetched data");
        console.log(result);
        setTimelineData(result.data.data.map((item) => ({ ...item })));
      } catch (e) {
        console.log(e);
      }
    };
    fetchranges();
    fetchPhaseData();
  }, []);

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
    try {
      const result = await axiosInstance.post(`/admin/updatephaseduration`, {
        updates: changesToSave,
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
        setbudgetRanges={setbudgetRanges}
        onClose={() => setShowRangeSettings(false)}
        onSave={handleRangeSettingsSave}
      />
    </div>
  );
};

export default ProjectTimelineSettings;
