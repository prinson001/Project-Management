import React, { useState } from "react";
import { X } from "lucide-react";
import TableData from "../components/TableData"; // Adjust the import path if necessary

const sampleRisks = [
  {
    id: "R-101",
    caseName: "Login Timeout Issue",
    type: "Issue",
    createdBy: "Alex",
    creationDate: "2025-06-01",
    owner: "Taylor",
    severity: "High",
    status: "Open",
  },
  {
    id: "R-102",
    caseName: "Payment Gateway Delay",
    type: "Risk",
    createdBy: "Jordan",
    creationDate: "2025-06-05",
    owner: "Morgan",
    severity: "Medium",
    status: "Closed",
  },
];

const columnSetting = [
  { columnName: "ID", dbColumn: "id", isVisible: true, isInput: false },
  { columnName: "Case Name", dbColumn: "caseName", isVisible: true, isInput: false, type: "text" }, // Changed isInput to false
  { columnName: "Type", dbColumn: "type", isVisible: true, isInput: false },
  { columnName: "Created By", dbColumn: "createdBy", isVisible: true, isInput: false },
  { columnName: "Creation Date", dbColumn: "creationDate", isVisible: true, isInput: false },
  { columnName: "Owner", dbColumn: "owner", isVisible: true, isInput: false },
  { columnName: "Severity", dbColumn: "severity", isVisible: true, isInput: false },
  { columnName: "Status", dbColumn: "status", isVisible: true, isInput: false },
];

const AddRiskModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative shadow-lg">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <h2 className="text-xl font-semibold mb-4">Add Risk</h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Risk Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            placeholder="Enter risk name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deliverable name</label>
          <select className="w-full border rounded px-3 py-2 text-sm bg-gray-50">
            <option>Deliverable number one</option>
            <option>Deliverable two</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phase name</label>
          <select className="w-full border rounded px-3 py-2 text-sm bg-gray-50">
            <option>Bidding</option>
            <option>Execution</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Response Plan</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            rows={3}
            placeholder="Enter response plan"
          >Needs to do this or that</textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Risk status</label>
          <select className="w-full border rounded px-3 py-2 text-sm bg-gray-50">
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="flex justify-start gap-4 mt-6">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded"
          >
            Update
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
);

const RisksAndIssuesTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState(sampleRisks);

  const sortTableData = (column, order) => {
    const sorted = [...tableData].sort((a, b) =>
      order === "ASC"
        ? a[column]?.localeCompare(b[column])
        : b[column]?.localeCompare(a[column])
    );
    setTableData(sorted);
  };

  const getData = async () => {
    // Simulate data fetch
    return sampleRisks;
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          + Add Risk
        </button>
      </div>

      <TableData
        getData={getData}
        tableData={tableData}
        tableName="risksAndIssues"
        setTableData={setTableData}
        showDate={true}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      />

      {showModal && <AddRiskModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default RisksAndIssuesTable;
