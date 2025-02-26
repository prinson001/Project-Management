import React, { useState } from "react";

import { Users } from "lucide-react";

// IMPORTING CHILDREN COMPONENTS

import TableData from "../components/TableData";
import TableConfig from "../components/TableConfig";
import TableConfigFilter from "../components/TableConfigFilter";

let searchFilter = "";
let showMyorAllDepartment = "Department";
let daysFilter = "All";
let openOrClosedTaskFilter = "";
let projectFilter = "";
let statusFilter = "";
let targetedFilter = "";
let showDates = false;

const TasksPage = () => {
  const [showDate, setShowDate] = useState(false);
  const [columnSetting, setColumnSetting] = useState([
    {
      columnName: "createdDate",
      columnOrder: 0,
      isVisible: true,
    },
    {
      columnName: "taskType",
      columnOrder: 1,
      isVisible: true,
    },
    {
      columnName: "projectName",
      columnOrder: 2,
      isVisible: true,
    },
    {
      columnName: "to",
      columnOrder: 3,
      isVisible: true,
    },
    {
      columnName: "targeted",
      columnOrder: 4,
      isVisible: true,
    },
    {
      columnName: "actual",
      columnOrder: 5,
      isVisible: true,
    },
    {
      columnName: "status",
      columnOrder: 6,
      isVisible: true,
    },
  ]);

  const [tableData, setTableData] = useState([
    {
      createdDate: "2025-2-18",
      taskType: "Approve project creation",
      projectName: "A INC PROJECT",
      to: "Me",
      targeted: "Tomorrow",
      actual: "-",
      status: "Delayed",
      details: "Additional project details and information can go here...",
    },
    {
      createdDate: "2025-2-17",
      taskType: "Approve project creation",
      projectName: "A INC PROJECT",
      to: "Department",
      targeted: "Tomorrow",
      actual: "-",
      status: "Open",
      details: "More details about this specific task...",
    },
    {
      createdDate: "2025-2-1",
      taskType: "Approve project creation",
      projectName: "C INC PROJECT",
      to: "Me",
      targeted: "Tomorrow",
      actual: "-",
      status: "Done",
      details: "Completed task details and outcomes...",
    },
    {
      createdDate: "2025-1-20",
      taskType: "Review budget approval",
      projectName: "XYZ CORP PROJECT",
      to: "Finance",
      targeted: "Next Week",
      actual: "-",
      status: "In Progress",
      details: "Budget review is pending manager approval...",
    },
    {
      createdDate: "2024-08-25",
      taskType: "Approve hiring request",
      projectName: "DEF INC PROJECT",
      to: "HR",
      targeted: "Tomorrow",
      actual: "-",
      status: "Pending",
      details: "New hiring request is under review...",
    },
    {
      createdDate: "2024-08-10",
      taskType: "Complete code review",
      projectName: "GHI INC PROJECT",
      to: "Development Team",
      targeted: "Next Week",
      actual: "-",
      status: "Delayed",
      details: "Code review pending due to testing issues...",
    },
    {
      createdDate: "2024-07-30",
      taskType: "Approve project launch",
      projectName: "JKL INC PROJECT",
      to: "Management",
      targeted: "Today",
      actual: "-",
      status: "Open",
      details: "Final approval required before launch...",
    },
    {
      createdDate: "2024-07-15",
      taskType: "Review compliance policy",
      projectName: "MNO INC PROJECT",
      to: "Legal",
      targeted: "Next Week",
      actual: "-",
      status: "Done",
      details: "Compliance policy review completed...",
    },
  ]);

  // Sample data - you can replace this with your actual data
  const originalTableData = [
    {
      createdDate: "2024-10-15",
      taskType: "Approve project creation",
      projectName: "A INC PROJECT",
      to: "Me",
      targeted: "Tomorrow",
      actual: "-",
      status: "Delayed",
      statusColor: "text-red-500",
      details: "Additional project details and information can go here...",
    },
    {
      createdDate: "2024-10-10",
      taskType: "Approve project creation",
      projectName: "A INC PROJECT",
      to: "Department",
      targeted: "Tomorrow",
      actual: "-",
      status: "Open",
      statusColor: "text-yellow-500",
      details: "More details about this specific task...",
    },
    {
      createdDate: "2024-09-20",
      taskType: "Approve project creation",
      projectName: "C INC PROJECT",
      to: "Me",
      targeted: "Tomorrow",
      actual: "-",
      status: "Done",
      statusColor: "text-green-500",
      details: "Completed task details and outcomes...",
    },
    {
      createdDate: "2024-09-05",
      taskType: "Review budget approval",
      projectName: "XYZ CORP PROJECT",
      to: "Finance",
      targeted: "Next Week",
      actual: "-",
      status: "In Progress",
      statusColor: "text-blue-500",
      details: "Budget review is pending manager approval...",
    },
    {
      createdDate: "2024-08-25",
      taskType: "Approve hiring request",
      projectName: "DEF INC PROJECT",
      to: "HR",
      targeted: "Tomorrow",
      actual: "-",
      status: "Pending",
      statusColor: "text-gray-500",
      details: "New hiring request is under review...",
    },
    {
      createdDate: "2024-08-10",
      taskType: "Complete code review",
      projectName: "GHI INC PROJECT",
      to: "Development Team",
      targeted: "Next Week",
      actual: "-",
      status: "Delayed",
      statusColor: "text-red-500",
      details: "Code review pending due to testing issues...",
    },
    {
      createdDate: "2024-07-30",
      taskType: "Approve project launch",
      projectName: "JKL INC PROJECT",
      to: "Management",
      targeted: "Today",
      actual: "-",
      status: "Open",
      statusColor: "text-yellow-500",
      details: "Final approval required before launch...",
    },
    {
      createdDate: "2024-07-15",
      taskType: "Review compliance policy",
      projectName: "MNO INC PROJECT",
      to: "Legal",
      targeted: "Next Week",
      actual: "-",
      status: "Done",
      statusColor: "text-green-500",
      details: "Compliance policy review completed...",
    },
  ];

  function updateFilters(value, key) {
    switch (key) {
      case "searchFilter":
        searchFilter = value;
        break;
      case "showMyorAllDepartment":
        showMyorAllDepartment = value;
        break;
      case "daysFilter":
        daysFilter = value;
        break;
      case "openOrClosedTaskFilter":
        openOrClosedTaskFilter = value;
        break;
      case "tableFilters":
        Object.keys(value).forEach((e) => {
          console.log(e);
          switch (e) {
            case "projectFilter":
              projectFilter = value[e];
              break;
            case "statusFilter":
              statusFilter = value[e];
              break;
            case "targetedFilter":
              targetedFilter = value[e];
              break;
            default:
              break;
          }
        });
      default:
        break;
    }
    filterTableData();
  }

  function filterTableData() {
    console.log("searchFilter", searchFilter);
    console.log("showMeorAllDepartment", showMyorAllDepartment);
    console.log("daysFilter", daysFilter);
    console.log("openOrClosedTaskFilter", openOrClosedTaskFilter);
    console.log("projectFilter", projectFilter);
    console.log("statusFilter", statusFilter);
    console.log("targetedFilter", targetedFilter);

    const updatedTable = originalTableData.filter((task) => {
      // Apply each filter only if it is not empty or null
      if (
        searchFilter &&
        !task.details.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        return false;
      }

      if (
        showMyorAllDepartment &&
        task.to !== showMyorAllDepartment &&
        showMyorAllDepartment !== "Department"
      ) {
        return false;
      }

      if (
        daysFilter &&
        daysFilter !== "All" &&
        task.createdDate !== daysFilter
      ) {
        return false;
      }

      if (openOrClosedTaskFilter) {
        const isOpen = task.status === "Open";
        const isClosed = task.status === "Done" || task.status === "Delayed";
        if (
          (openOrClosedTaskFilter === "Open" && !isOpen) ||
          (openOrClosedTaskFilter === "Closed" && !isClosed)
        ) {
          return false;
        }
      }

      if (projectFilter && task.projectName !== projectFilter) {
        return false;
      }

      if (statusFilter && task.status !== statusFilter) {
        return false;
      }

      if (targetedFilter && task.targeted !== targetedFilter) {
        return false;
      }

      return true;
    });
    console.log("the updated table is");
    console.log(updatedTable);
    console.log(originalTableData);
    setTableData((state) => updatedTable);
  }

  function updateShowDateFunctionality() {
    setShowDate((state) => !state);
  }

  function sortTableData(keyParameter, type) {
    console.log(keyParameter, type);

    // Sorting logic
    const sortedData = [...tableData].sort((a, b) => {
      if (keyParameter === "status") {
        // Define priority for statuses
        const statusPriority = { Delayed: 3, Open: 2, Closed: 1 };
        const valA = statusPriority[a.status] || 0;
        const valB = statusPriority[b.status] || 0;
        return type === "aesc" ? valA - valB : valB - valA;
      }

      if (keyParameter === "projectName") {
        return type === "aesc"
          ? a.projectName.localeCompare(b.projectName)
          : b.projectName.localeCompare(a.projectName);
      }

      if (keyParameter === "createdDate") {
        const dateA = new Date(a.createdDate);
        const dateB = new Date(b.createdDate);
        return type === "aesc" ? dateA - dateB : dateB - dateA;
      }

      return 0; // Default case, no sorting
    });

    setTableData((state) => sortedData);
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 p-5 h-full">
      <TableConfig
        updateFilters={updateFilters}
        filterTableData={filterTableData}
      >
        <TableConfigFilter
          updateFilters={updateFilters}
          updateShowDateFunctionality={updateShowDateFunctionality}
          showDate={showDate}
          columnSetting={columnSetting}
          setColumnSetting={setColumnSetting}
        ></TableConfigFilter>
      </TableConfig>
      <TableData
        tableData={tableData}
        showDate={showDate}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      ></TableData>
    </div>
  );
};

export default TasksPage;
