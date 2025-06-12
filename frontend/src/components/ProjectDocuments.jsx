import React, { useState } from "react";
import { StatusCard } from "../components/StatusCard";
import { SearchBar } from "../components/SearchBar";
import TableData from "../components/TableData";

const defaultStatusData = [
  { title: "Initiation & Planning", count: 5, status: "completed" },
  { title: "Bidding", count: 7, status: "completed" },
  { title: "Pre- executing", count: 3, status: "completed" },
  { title: "Executing", count: 8, status: "warning" },
  { title: "Operation", count: 0, status: "default" },
  { title: "Total Documents", count: 21, status: "default" },
  { title: "Pending Approval", count: 2, status: "default" },
  { title: "Total Missing", count: 3, status: "default" },
];

const defaultDocumentsData = [
  {
    phaseName: "Initiation",
    documentName: "Signed Contract",
    fileName: "Project Contract.pdf",
    creationDate: "18-Jan-25",
    approvalStatus: "Approved",
    approvalDate: "19-Jan-25",
    approvedBy: "PMO- Ahmad Omar",
  },
  // ... Add more rows as needed
];

const columnSetting = [
  { columnName: "Phase", dbColumn: "phaseName", isVisible: true, isInput: false },
  { columnName: "Document Name", dbColumn: "documentName", isVisible: true, isInput: false },
  { columnName: "File Name", dbColumn: "fileName", isVisible: true, isInput: false },
  { columnName: "Created Date", dbColumn: "creationDate", isVisible: true, isInput: false },
  { columnName: "Approval Status", dbColumn: "approvalStatus", isVisible: true, isInput: false },
  { columnName: "Approval Date", dbColumn: "approvalDate", isVisible: true, isInput: false },
  { columnName: "Approved By", dbColumn: "approvedBy", isVisible: true, isInput: false },
];

export default function ProjectDocuments({ className = "" }) {
  const [tableData, setTableData] = useState(defaultDocumentsData);

  const sortTableData = (column, order) => {
    const sorted = [...tableData].sort((a, b) => {
      if (order === "ASC") return a[column] > b[column] ? 1 : -1;
      else return a[column] < b[column] ? 1 : -1;
    });
    setTableData(sorted);
  };

  const getData = async () => {
    // Normally you'd fetch data here; for now use defaults
    setTableData(defaultDocumentsData);
  };

  return (
    <div className={`p-6 bg-white ${className}`}>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {defaultStatusData.map((item, index) => (
          <StatusCard
            key={index}
            title={item.title}
            count={item.count}
            status={item.status}
          />
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search files"
          onSearch={(query) => {
            const filtered = defaultDocumentsData.filter((row) =>
              Object.values(row).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
              )
            );
            setTableData(filtered);
          }}
          className="max-w-md ml-auto"
        />
      </div>

      {/* Reusable Table */}
      <TableData
        getData={getData}
        tableData={tableData}
        tableName="ProjectDocuments"
        setTableData={setTableData}
        showDate={true}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      />
    </div>
  );
}
