"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreHorizontal,
} from "lucide-react";

const defaultDeliverables = [
  {
    id: "1",
    name: "The long name of the deliverable for this project",
    budget: 15000,
    invoiced: 0,
    startDate: "2024-01-01",
    endDate: "2024-01-25",
    scopePercentage: 100,
    paymentPercentage: 100,
  },
  {
    id: "2",
    name: "Deliverable Number Two",
    budget: 15000,
    invoiced: 0,
    startDate: "2024-01-15",
    endDate: "2024-01-31",
    scopePercentage: 100,
    paymentPercentage: 100,
  },
  {
    id: "3",
    name: "Deliverable Number Three",
    budget: 15000,
    invoiced: 0,
    startDate: "2024-02-01",
    endDate: "2024-02-22",
    scopePercentage: 20,
    paymentPercentage: 0,
  },
  {
    id: "4",
    name: "Deliverable Number Four",
    budget: 15000,
    invoiced: 0,
    startDate: "2024-02-10",
    endDate: "2024-02-28",
    scopePercentage: 10,
    paymentPercentage: 0,
  },
  {
    id: "5",
    name: "Deliverable Number Five",
    budget: 15000,
    invoiced: 0,
    startDate: "2024-03-01",
    endDate: "2024-04-03",
    scopePercentage: 0,
    paymentPercentage: 0,
  },
];

export default function DeliverableTimeline({
  deliverables = defaultDeliverables,
  currentDate = "2024-02-15",
}) {
  const [timeUnit, setTimeUnit] = useState("Weeks");

  const timelineData = useMemo(() => {
    if (deliverables.length === 0)
      return { periods: [], startDate: new Date(), endDate: new Date() };

    // Find the overall project start and end dates
    const allDates = deliverables.flatMap((d) => [
      new Date(d.startDate),
      new Date(d.endDate),
    ]);
    const projectStart = new Date(
      Math.min(...allDates.map((d) => d.getTime()))
    );
    const projectEnd = new Date(Math.max(...allDates.map((d) => d.getTime())));

    // Generate time periods based on selected unit
    const periods = [];
    const current = new Date(projectStart);

    while (current <= projectEnd) {
      switch (timeUnit) {
        case "Weeks":
          periods.push({
            label: `${periods.length + 1}`,
            date: new Date(current),
          });
          current.setDate(current.getDate() + 7);
          break;
        case "Months":
          periods.push({
            label: current.toLocaleDateString("en-US", { month: "short" }),
            date: new Date(current),
          });
          current.setMonth(current.getMonth() + 1);
          break;
        case "Quarter":
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          periods.push({
            label: `Q${quarter}`,
            date: new Date(current),
          });
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }

    return { periods, startDate: projectStart, endDate: projectEnd };
  }, [deliverables, timeUnit]);

  const calculatePosition = (date, totalDuration) => {
    const targetDate = new Date(date);
    const startTime = timelineData.startDate.getTime();
    const totalTime = timelineData.endDate.getTime() - startTime;
    const targetTime = targetDate.getTime() - startTime;
    return Math.max(0, Math.min(100, (targetTime / totalTime) * 100));
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (deliverable) => {
    const currentDateObj = new Date(currentDate);
    const endDateObj = new Date(deliverable.endDate);
    const isOverdue =
      currentDateObj > endDateObj && deliverable.scopePercentage < 100;

    if (deliverable.scopePercentage === 100) return "bg-green-400";
    if (isOverdue) return "bg-red-500";
    if (deliverable.scopePercentage > 0) return "bg-yellow-400";
    return "bg-gray-300";
  };

  const getStatusIcon = (deliverable) => {
    const currentDateObj = new Date(currentDate);
    const endDateObj = new Date(deliverable.endDate);
    const isOverdue =
      currentDateObj > endDateObj && deliverable.scopePercentage < 100;

    if (deliverable.scopePercentage === 100)
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-yellow-600" />;
  };

  const currentDatePosition = calculatePosition(currentDate, 0);

  return (
    <div className="w-full space-y-6">
      {/* Timeline Card */}
      <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
        {/* CardHeader */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {/* CardTitle */}
          <h2 className="text-lg font-semibold">Project Deliverables</h2>
          <div className="flex gap-2">
            {["Weeks", "Months", "Quarter"].map((unit) => (
              <button
                key={unit}
                onClick={() => setTimeUnit(unit)}
                className={`text-xs px-2 py-1 rounded ${
                  timeUnit === unit
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        {/* CardContent */}
        <div className="p-6">
          {/* Timeline Chart */}
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="flex">
              <div className="w-80 flex-shrink-0">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Deliverable name</span>
                  <span>Duration</span>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  {timelineData.periods.slice(0, 20).map((period, index) => (
                    <div key={index} className="text-center w-8">
                      {period.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Rows */}
            {deliverables.map((deliverable) => {
              const startPos = calculatePosition(deliverable.startDate, 0);
              const endPos = calculatePosition(deliverable.endDate, 0);
              const width = endPos - startPos;
              const duration = calculateDuration(
                deliverable.startDate,
                deliverable.endDate
              );

              return (
                <div key={deliverable.id} className="flex items-center">
                  <div className="w-80 flex-shrink-0 pr-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 truncate max-w-60">
                        {deliverable.name}
                      </span>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {duration} days
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    {/* Timeline background */}
                    <div className="absolute inset-0 bg-gray-100 rounded"></div>

                    {/* Progress bar */}
                    <div
                      className={`absolute top-0 h-full rounded ${getStatusColor(
                        deliverable
                      )} flex items-center justify-end pr-2`}
                      style={{
                        left: `${startPos}%`,
                        width: `${
                          width * (deliverable.scopePercentage / 100)
                        }%`,
                        minWidth:
                          deliverable.scopePercentage > 0 ? "20px" : "0px",
                      }}
                    >
                      {deliverable.scopePercentage > 0 && (
                        <span className="text-xs font-medium text-white">
                          {deliverable.scopePercentage}%
                        </span>
                      )}
                    </div>

                    {/* Remaining duration bar */}
                    {deliverable.scopePercentage < 100 && (
                      <div
                        className="absolute top-0 h-full bg-gray-300 rounded-r"
                        style={{
                          left: `${
                            startPos +
                            width * (deliverable.scopePercentage / 100)
                          }%`,
                          width: `${
                            width * ((100 - deliverable.scopePercentage) / 100)
                          }%`,
                        }}
                      >
                        {deliverable.scopePercentage < 100 && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <span className="text-xs font-medium text-gray-600">
                              {100 - deliverable.scopePercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current date indicator */}
            <div className="flex">
              <div className="w-80 flex-shrink-0"></div>
              <div className="flex-1 relative">
                <div
                  className="absolute top-0 w-0.5 bg-red-500 z-10"
                  style={{
                    left: `${currentDatePosition}%`,
                    height: `${deliverables.length * 2 + 1}rem`,
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Calendar className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
        {/* CardContent with p-0 */}
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliverable name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoiced
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliverables.map((deliverable) => (
                  <tr key={deliverable.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverable.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverable.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverable.invoiced.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(deliverable.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(deliverable.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          {getStatusIcon(deliverable)}
                          {deliverable.scopePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          {deliverable.paymentPercentage === 100 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          {deliverable.paymentPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-gray-500 hover:text-gray-700 p-1 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
