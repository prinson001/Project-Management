import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axiosInstance from "../axiosInstance";

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

const ProgressBar = React.memo(({ progress }) => {
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
});

const ProjectHighLevelTimeline = ({ timeline = [], projectName, projectId }) => {
  const [tableData, setTableData] = useState(sampleTimeline); // Initialize with sample data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastProjectId, setLastProjectId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  // Column settings - memoized to prevent recreation
  const columnSettings = useMemo(() => [
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
  ], []);

  // Fetch real timeline data - with request cancellation and mounting check
  const fetchTimelineData = useCallback(async () => {
    if (!projectId || !mountedRef.current) return;
    
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(
        `/data-management/getProjectTimeline`,
        { projectId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Only update if component is mounted and this is still the latest request
      if (mountedRef.current && requestId === requestIdRef.current) {
        if (response.data.status === "success") {
          setTableData(response.data.result.timeline);
        } else {
          throw new Error(response.data.message || "Failed to fetch timeline");
        }
      }
    } catch (error) {
      // Only update if component is mounted and this is still the latest request
      if (mountedRef.current && requestId === requestIdRef.current) {
        console.error("Error fetching project timeline:", error);
        setError(error.message);
        // Keep existing data on error, don't replace with sample data
      }
    } finally {
      // Only update loading if component is mounted and this is still the latest request
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [projectId]);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Simplified effect with debounce - only respond to projectId changes
  useEffect(() => {
    if (!mountedRef.current) return;
    
    // Reset request counter when projectId changes
    requestIdRef.current = 0;
    
    if (projectId && projectId !== lastProjectId) {
      setLastProjectId(projectId);
      // Small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          fetchTimelineData();
        }
      }, 50); // Reduced delay
      
      return () => clearTimeout(timeoutId);
    } else if (!projectId && timeline.length > 0) {
      // Use provided timeline if available
      setTableData(timeline);
    }
  }, [projectId, fetchTimelineData, lastProjectId, timeline]);

  return (
    <div className="bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Project High-level timeline</h2>
        {projectName && (
          <p className="text-sm text-gray-600 mt-1">{projectName}</p>
        )}
      </div>
      
      {loading && tableData.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading timeline...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading timeline</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {(tableData.length > 0 || !loading) && (
        <div className="border border-gray-200 rounded-lg overflow-hidden" key={`timeline-${projectId || 'default'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columnSettings
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
                  <tr key={`${projectId || 'default'}-${row.id || index}`} className="hover:bg-gray-50">
                    {columnSettings
                      .filter((col) => col.isVisible)
                      .map((column) => (
                        <td key={`${row.id || index}-${column.dbColumn}`} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render ? column.render(row) : row[column.dbColumn]}
                        </td>
                      ))}
                  </tr>
                ))}
                {tableData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={columnSettings.filter(col => col.isVisible).length} className="px-6 py-8 text-center text-gray-500">
                      No timeline data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Add display name for debugging
ProjectHighLevelTimeline.displayName = 'ProjectHighLevelTimeline';

export default React.memo(ProjectHighLevelTimeline);