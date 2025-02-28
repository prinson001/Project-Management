import React, { useState } from "react";

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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={
        {
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
  options = ["1 weeks", "2 weeks", "4 weeks", "5 weeks", "7 weeks", "10 weeks"],
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
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
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
const RangeSettingsDropdown = ({ isOpen, onClose, onSave }) => {
  const [ranges, setRanges] = useState([
    { id: 1, name: "Range 1", min: 0, max: 1 },
    { id: 2, name: "Range 2", min: 1, max: 3 },
    { id: 3, name: "Range 3", min: 3, max: 6 },
    { id: 4, name: "Range 4", min: 6, max: null },
  ]);

  const handleInputChange = (e, index, field) => {
    const value = e.target.value;
    if (!isNaN(value) || value === "") {
      const newRanges = [...ranges];
      newRanges[index][field] = value === "" ? null : parseInt(value);
      setRanges(newRanges);
    }
  };

  const handleSave = () => {
    if (ranges.some((range) => range.min >= range.max)) {
      alert("Invalid range: Min must be less than Max.");
      return;
    }
    onSave(ranges);
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
            {ranges.map((range, index) => (
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
  const [showRangeSettings, setShowRangeSettings] = useState(false);

  const [timelineData, setTimelineData] = useState([
    {
      phase: "Prepare RFP",
      budgetUnder1M: "2 weeks",
      budget1Mto3M: "5 weeks",
      budget3Mto6M: "7 weeks",
      budgetOver6M: "10 weeks",
    },
    {
      phase: "RFP Releasing Procedures",
      budgetUnder1M: "2 weeks",
      budget1Mto3M: "2 weeks",
      budget3Mto6M: "2 weeks",
      budgetOver6M: "2 weeks",
    },
    {
      phase: "Bidding Duration",
      budgetUnder1M: "2 weeks",
      budget1Mto3M: "4 weeks",
      budget3Mto6M: "7 weeks",
      budgetOver6M: "4 weeks",
    },
    {
      phase: "Technical and financial evaluation",
      budgetUnder1M: "1 weeks",
      budget1Mto3M: "2 weeks",
      budget3Mto6M: "2 weeks",
      budgetOver6M: "2 weeks",
    },
    {
      phase: "Contract preparation",
      budgetUnder1M: "2 weeks",
      budget1Mto3M: "2 weeks",
      budget3Mto6M: "2 weeks",
      budgetOver6M: "2 weeks",
    },
    {
      phase: "Waiting period before execution starts",
      budgetUnder1M: "1 weeks",
      budget1Mto3M: "1 weeks",
      budget3Mto6M: "1 weeks",
      budgetOver6M: "1 weeks",
    },
  ]);

  const tabs = [
    "Main Roles",
    "Schedule Plan Reference",
    "Team access Policies",
    "Expected activities duration",
  ];

  const handleWeekChange = (rowIndex, columnKey, newValue) => {
    const updatedData = [...timelineData];
    updatedData[rowIndex][columnKey] = newValue;
    setTimelineData(updatedData);
  };

  const handleRangeSettingsSave = (ranges) => {
    console.log("Saved ranges:", ranges);
    // Here you would update your application state with the new ranges
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`px-4 py-2 cursor-pointer ${
              selectedTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

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
                <span>Ranges settings</span>
                <ArrowIcon direction="down" size={16} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" style={{ minHeight: "400px" }}>
            {" "}
            {/* Extend table height */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 text-left text-sm font-medium text-gray-700">
                    Phase
                  </th>
                  <th className="border p-2 bg-gray-50 text-left text-sm font-medium text-gray-700">
                    Budget &lt; 1M
                  </th>
                  <th className="border p-2 bg-gray-50 text-left text-sm font-medium text-gray-700">
                    1M &gt; Budget &lt; 3M
                  </th>
                  <th className="border p-2 bg-gray-50 text-left text-sm font-medium text-gray-700">
                    3M &gt; Budget &lt; 6M
                  </th>
                  <th className="border p-2 bg-gray-50 text-left text-sm font-medium text-gray-700">
                    Budget &gt; 6M
                  </th>
                </tr>
              </thead>
              <tbody>
                {timelineData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border p-2 text-sm text-blue-600 font-medium">
                      {row.phase}
                    </td>
                    <td className="border p-2">
                      <WeekDropdown
                        value={row.budgetUnder1M}
                        onChange={(value) =>
                          handleWeekChange(rowIndex, "budgetUnder1M", value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <WeekDropdown
                        value={row.budget1Mto3M}
                        onChange={(value) =>
                          handleWeekChange(rowIndex, "budget1Mto3M", value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <WeekDropdown
                        value={row.budget3Mto6M}
                        onChange={(value) =>
                          handleWeekChange(rowIndex, "budget3Mto6M", value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <WeekDropdown
                        value={row.budgetOver6M}
                        onChange={(value) =>
                          handleWeekChange(rowIndex, "budgetOver6M", value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Changing parameters will not affect projects that are already
              created.
            </p>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Range Settings Modal */}
      <RangeSettingsDropdown
        isOpen={showRangeSettings}
        onClose={() => setShowRangeSettings(false)}
        onSave={handleRangeSettingsSave}
      />
    </div>
  );
};

export default ProjectTimelineSettings;
