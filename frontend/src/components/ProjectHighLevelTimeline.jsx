import React, { useEffect, useState } from "react";

const sampleTimeline = [
  {
    id: "phase-1",
    phaseName: "Planning",
    duration: "3 weeks",
    startDate: "5-May-23",
    endDate: "5-May-23",
    progress: 100,
    status: "Completed",
  },
  {
    id: "phase-2",
    phaseName: "Bidding",
    duration: "5 weeks",
    startDate: "6-Nov-23",
    endDate: "6-Nov-23",
    progress: 100,
    status: "Completed",
  },
  {
    id: "phase-3",
    phaseName: "Before executing",
    duration: "3 weeks",
    startDate: "6-Nov-23",
    endDate: "6-Nov-23",
    progress: 100,
    status: "Completed",
  },
  {
    id: "phase-4",
    phaseName: "Executing",
    duration: "10 months",
    startDate: "6-Nov-23",
    endDate: "6-Nov-23",
    progress: 49,
    status: "In Progress",
  },
  {
    id: "phase-5",
    phaseName: "Support",
    duration: "12 months",
    startDate: "6-Nov-23",
    endDate: "6-Nov-23",
    progress: 0,
    status: "Not Started",
  },
];

const ProgressBar = ({ progress }) => {
  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 0) return "bg-green-400";
    return "bg-gray-300";
  };

  const hasDelay = progress < 50 && progress > 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
          style={{ width: `${Math.max(progress, 0)}%` }}
        />
        {hasDelay && (
          <div
            className="absolute top-0 bg-red-500 h-full"
            style={{
              left: `${progress}%`,
              width: "10%",
              maxWidth: `${100 - progress}%`,
            }}
          />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 min-w-[40px]">{progress}%</span>
    </div>
  );
};

const columnSetting = [
  {
    columnName: "Phase name",
    dbColumn: "phaseName",
    isVisible: true,
    isInput: false,
    render: (row) => <span className="font-medium text-gray-900">{row.phaseName}</span>,
  },
  {
    columnName: "Duration",
    dbColumn: "duration",
    isVisible: true,
    isInput: false,
  },
  {
    columnName: "Start Date",
    dbColumn: "startDate",
    isVisible: true,
    isInput: false,
  },
  {
    columnName: "End Date",
    dbColumn: "endDate",
    isVisible: true,
    isInput: false,
  },
  {
    columnName: "Progress",
    dbColumn: "progress",
    isVisible: true,
    isInput: false,
    render: (row) => <ProgressBar progress={row.progress} />,
  },
];

const ProjectHighLevelTimeline = ({ timeline = [], projectName }) => {
  const [tableData, setTableData] = useState(sampleTimeline);

  useEffect(() => {
    if (timeline.length > 0) {
      setTableData(timeline);
    }
  }, [timeline]);

  return (
    <div className="bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Project High-level timeline</h2>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columnSetting
                  .filter((col) => col.isVisible)
                  .map((column) => (
                    <th
                      key={column.dbColumn}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.columnName}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50">
                  {columnSetting
                    .filter((col) => col.isVisible)
                    .map((column) => (
                      <td key={column.dbColumn} className="px-6 py-4 whitespace-nowrap text-sm">
                        {column.render ? column.render(row) : row[column.dbColumn]}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectHighLevelTimeline;