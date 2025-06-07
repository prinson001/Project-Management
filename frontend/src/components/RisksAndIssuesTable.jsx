import React, { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";

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

const AddRiskModal = ({ onClose }) => {
  return (
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
};

const RisksAndIssuesTable = ({ risks = sampleRisks }) => {
  const [showModal, setShowModal] = useState(false);

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

      <div className="overflow-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Case Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Creation Date</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No risks or issues available.
                </td>
              </tr>
            ) : (
              risks.map((risk, idx) => (
                <tr
                  key={risk.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-3 font-medium text-gray-700">{risk.id}</td>
                  <td className="px-4 py-3">{risk.caseName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        risk.type === "Risk"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {risk.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{risk.createdBy}</td>
                  <td className="px-4 py-3">{risk.creationDate}</td>
                  <td className="px-4 py-3">{risk.owner}</td>
                  <td className="px-4 py-3">{risk.severity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        risk.status === "Open"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      title="More actions"
                      className="text-gray-500 hover:text-gray-800 transition"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddRiskModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default RisksAndIssuesTable;
