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

const ProgressBar = React.memo(({ progress, status }) => {
  const getProgressConfig = (progress, status) => {
    if (status === "Completed") {
      return {
        bgColor: "bg-green-500",
        gradient: "from-green-400 to-green-600",
        shadow: "shadow-green-200",
        glow: "shadow-lg shadow-green-200/50"
      };
    }
    if (status === "Delayed") {
      return {
        bgColor: "bg-red-500",
        gradient: "from-red-400 to-red-600", 
        shadow: "shadow-red-200",
        glow: "shadow-lg shadow-red-200/50"
      };
    }
    if (status === "In Progress") {
      return {
        bgColor: "bg-blue-500",
        gradient: "from-blue-400 to-blue-600",
        shadow: "shadow-blue-200", 
        glow: "shadow-lg shadow-blue-200/50"
      };
    }
    return {
      bgColor: "bg-gray-400",
      gradient: "from-gray-300 to-gray-500",
      shadow: "shadow-gray-200",
      glow: "shadow-md shadow-gray-200/30"
    };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed": 
        return {
          textColor: "text-green-700",
          bgColor: "bg-green-100",
          borderColor: "border-green-200"
        };
      case "In Progress": 
        return {
          textColor: "text-blue-700", 
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200"
        };
      case "Delayed": 
        return {
          textColor: "text-red-700",
          bgColor: "bg-red-100", 
          borderColor: "border-red-200"
        };
      case "Not Started": 
        return {
          textColor: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200"
        };
      default: 
        return {
          textColor: "text-gray-700",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200"
        };
    }
  };

  const displayProgress = Math.max(0, Math.min(100, progress || 0));
  const progressConfig = getProgressConfig(displayProgress, status);
  const statusConfig = getStatusConfig(status);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Enhanced Progress Bar */}
      <div className="flex-1 relative">
        {/* Background track */}
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          {/* Progress fill with gradient and glow effect */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressConfig.gradient} ${progressConfig.glow} transition-all duration-700 ease-out relative overflow-hidden transform`}
            style={{ 
              width: `${displayProgress}%`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          >
            {/* Animated shine effect */}
            {displayProgress > 0 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full"></div>
                {/* Moving shine effect */}
                <div 
                  className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full animate-ping"
                  style={{
                    left: `${Math.max(0, displayProgress - 20)}%`,
                    animationDuration: '2s',
                    animationDelay: '1s'
                  }}
                ></div>
              </>
            )}
          </div>
        </div>
        
        {/* Progress percentage floating above */}
        {displayProgress > 15 && (
          <div 
            className="absolute top-0 transform -translate-y-6 text-xs font-semibold text-gray-700 transition-all duration-300"
            style={{ left: `${Math.max(10, Math.min(90, displayProgress - 5))}%` }}
          >
            {displayProgress}%
          </div>
        )}
      </div>
      
      {/* Status Badge and Percentage */}
      <div className="flex flex-col items-end gap-1 min-w-[80px]">
        {/* Percentage (shown when progress is low) */}
        {displayProgress <= 15 && (
          <span className="text-sm font-bold text-gray-800">{displayProgress}%</span>
        )}
        
        {/* Enhanced Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} shadow-sm`}>
          <div className="flex items-center gap-1">
            {/* Status indicator dot */}
            <div className={`w-2 h-2 rounded-full ${progressConfig.bgColor}`}></div>
            <span>{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const ProjectHighLevelTimeline = ({ timeline = [], projectName, projectId, debug = false }) => {
  const [tableData, setTableData] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const mountedRef = useRef(true);

  // Debug logging
  console.log("ProjectHighLevelTimeline render:", { 
    projectId, 
    loading, 
    tableDataLength: tableData.length, 
    error 
  });

  // Column settings - memoized to prevent recreation
  const columnSettings = useMemo(() => [
    {
      columnName: "Phase name",
      dbColumn: "phaseName",
      isVisible: true,
      isInput: false,
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900 text-base">{row.phaseName}</span>
          {row.deliverableCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-500 font-medium">
                {row.deliverableCount} deliverable{row.deliverableCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      columnName: "Duration",
      dbColumn: "duration",
      isVisible: true,
      isInput: false,
      render: (row) => (
        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
          {row.duration}
        </span>
      ),
    },
    {
      columnName: "Start Date",
      dbColumn: "startDate",
      isVisible: true,
      isInput: false,
      render: (row) => (
        <span className="text-sm text-gray-700 font-medium">{row.startDate}</span>
      ),
    },
    {
      columnName: "End Date", 
      dbColumn: "endDate",
      isVisible: true,
      isInput: false,
      render: (row) => (
        <span className="text-sm text-gray-700 font-medium">{row.endDate}</span>
      ),
    },
    {
      columnName: "Progress",
      dbColumn: "progress",
      isVisible: true,
      isInput: false,
      render: (row) => <ProgressBar progress={row.progress} status={row.status} />,
    },
  ], []);

  // Fetch real timeline data
  const fetchTimelineData = useCallback(async () => {
    if (!projectId || !mountedRef.current) {
      console.log("fetchTimelineData early return:", { projectId, mounted: mountedRef.current });
      return;
    }
    
    console.log("fetchTimelineData starting:", { projectId });
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching timeline for project:", projectId);
      const response = await axiosInstance.post(
        `/data-management/getProjectTimeline`,
        { projectId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response received:", { 
        status: response.data.status, 
        hasResult: !!response.data.result,
        timelineLength: response.data.result?.timeline?.length 
      });

      if (mountedRef.current) {
        if (response.data.status === "success") {
          const timelineData = response.data.result.timeline || [];
          
          // Store debug info
          if (debug) {
            setDebugInfo({
              projectInfo: response.data.result.projectInfo,
              totalDeliverables: response.data.result.totalDeliverables,
              completedDeliverables: response.data.result.completedDeliverables,
              rawTimeline: timelineData
            });
          }
          
          // Ensure each timeline item has all required fields
          const processedData = timelineData.map((item, index) => ({
            id: item.id || `phase-${index + 1}`,
            phaseName: item.phaseName || "Unknown Phase",
            duration: item.duration || "N/A",
            startDate: item.startDate || "N/A",
            endDate: item.endDate || "N/A",
            progress: Math.max(0, Math.min(100, item.progress || 0)),
            status: item.status || "Not Started",
            deliverableCount: item.deliverableCount || 0,
            order: item.order || index + 1
          }));
          
          // Sort by order to ensure proper sequence
          const sortedData = processedData.sort((a, b) => a.order - b.order);
          
          console.log("Setting tableData (main phases):", sortedData);
          setTableData(sortedData);
        } else {
          throw new Error(response.data.message || "Failed to fetch timeline");
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error("Error fetching project timeline:", error);
        setError(error.message);
      }
    } finally {
      if (mountedRef.current) {
        console.log("Setting loading to false");
        setLoading(false);
      }
    }
  }, [projectId, debug]);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Effect to handle projectId changes
  useEffect(() => {
    console.log("useEffect triggered:", { projectId });
    
    if (projectId) {
      fetchTimelineData();
    } else if (timeline.length > 0) {
      console.log("Using provided timeline:", timeline.length);
      setTableData(timeline);
    } else {
      console.log("Using sample timeline");
      setTableData(sampleTimeline);
    }
  }, [projectId]); // Removed fetchTimelineData to prevent infinite loops

  return (
    <div className="bg-white p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Project High-level Timeline</h2>
        </div>
        {projectName && (
          <p className="text-base text-gray-700 font-medium mb-1">{projectName}</p>
        )}
        {projectId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Project ID:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{projectId}</span>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {debug && debugInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Debug Information</h3>
          <div className="text-xs space-y-1">
            <p><strong>Project:</strong> {debugInfo.projectInfo?.name}</p>
            <p><strong>Current Phase:</strong> {debugInfo.projectInfo?.currentPhase}</p>
            <p><strong>Total Deliverables:</strong> {debugInfo.totalDeliverables}</p>
            <p><strong>Completed Deliverables:</strong> {debugInfo.completedDeliverables}</p>
            <p><strong>Timeline Phases:</strong> {debugInfo.rawTimeline?.length}</p>
          </div>
        </div>
      )}
      
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
              {projectId && (
                <button 
                  onClick={fetchTimelineData}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading || tableData.length > 0 ? (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white" key={`timeline-${projectId || 'default'}`}>
          {/* Loading overlay for data refresh */}
          {loading && tableData.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-700 font-medium">Updating timeline...</span>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {columnSettings
                    .filter((col) => col.isVisible)
                    .map((column) => (
                      <th
                        key={column.dbColumn}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {column.columnName}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tableData.map((row, index) => (
                  <tr 
                    key={`${projectId || 'default'}-${row.id || index}`} 
                    className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 ${
                      row.status === 'In Progress' 
                        ? 'bg-gradient-to-r from-blue-50/50 to-white border-l-4 border-blue-400' 
                        : row.status === 'Completed'
                        ? 'bg-gradient-to-r from-green-50/30 to-white'
                        : ''
                    }`}
                  >
                    {columnSettings
                      .filter((col) => col.isVisible)
                      .map((column) => (
                        <td key={`${row.id || index}-${column.dbColumn}`} className="px-6 py-5 whitespace-nowrap text-sm">
                          {column.render ? column.render(row) : row[column.dbColumn]}
                        </td>
                      ))}
                  </tr>
                ))}
                {tableData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={columnSettings.filter(col => col.isVisible).length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        {projectId ? (
                          <div className="space-y-1 text-gray-500">
                            <p className="font-medium">No timeline data available for this project</p>
                            <p className="text-xs">Project may not have a schedule plan configured</p>
                          </div>
                        ) : (
                          <p className="text-gray-500 font-medium">No timeline data available</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Summary footer */}
          {tableData.length > 0 && debugInfo && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">{tableData.length} phases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {debugInfo.completedDeliverables}/{debugInfo.totalDeliverables} deliverables completed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// Add display name for debugging
ProjectHighLevelTimeline.displayName = 'ProjectHighLevelTimeline';

export default React.memo(ProjectHighLevelTimeline);