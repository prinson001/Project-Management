import React from "react";
import { MoreHorizontal } from "lucide-react";

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


const RisksAndIssuesTable = ({ risks = sampleRisks }) => {
  return (
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
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
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
  );
};

export default RisksAndIssuesTable;
