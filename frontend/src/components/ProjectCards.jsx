"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Clock,
} from "lucide-react";
import RisksAndIssuesTable from "./RisksAndIssuesTable.jsx";
import ProjectDelivarablesTable from "./ProjectDelivarablesTable.jsx"; // Changed import

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main Component
const ProjectCards = () => {
  const [deliverables, setDeliverables] = useState([
    {
      id: "DEL-001",
      name: "Initial Project Setup & Configuration",
      duration: "15 days",
      progress: 100,
      budget: "5,000 SAR",
      invoiced: "5,000 SAR",
      startDate: "2025-01-10",
      endDate: "2025-01-25",
      scope: 100,
      payment: 100,
      status: "Completed",
    },
    {
      id: "DEL-002",
      name: "User Interface Design & Prototyping",
      duration: "30 days",
      progress: 75,
      budget: "12,000 SAR",
      invoiced: "8,000 SAR",
      startDate: "2025-01-26",
      endDate: "2025-02-24",
      scope: 75,
      payment: 50,
      status: "In Progress",
    },
    {
      id: "DEL-003",
      name: "Backend Development & API Integration",
      duration: "45 days",
      progress: 40,
      budget: "20,000 SAR",
      invoiced: "5,000 SAR",
      startDate: "2025-02-25",
      endDate: "2025-04-10",
      scope: 40,
      payment: 25,
      status: "In Progress",
    },
    {
      id: "DEL-004",
      name: "Testing, QA & Bug Fixing Phase",
      duration: "20 days",
      progress: 0,
      budget: "8,000 SAR",
      invoiced: "0 SAR",
      startDate: "2025-04-11",
      endDate: "2025-04-30",
      scope: 0,
      payment: 0,
      status: "Not Started",
    },
    {
      id: "DEL-005",
      name: "Deployment and Go-Live Activities",
      duration: "10 days",
      progress: 0,
      budget: "6,000 SAR",
      invoiced: "0 SAR",
      startDate: "2025-05-01",
      endDate: "2025-05-10",
      scope: 0,
      payment: 0,
      status: "Not Started",
    },
  ]);

  const deliverableColumns = [
    { Header: "ID", accessor: "id" },
    { Header: "Deliverable Name", accessor: "name" },
    { Header: "Duration", accessor: "duration" },
    { Header: "Progress %", accessor: "progress" },
    { Header: "Budget (SAR)", accessor: "budget" },
    { Header: "Invoiced (SAR)", accessor: "invoiced" },
    { Header: "Start Date", accessor: "startDate" },
    { Header: "End Date", accessor: "endDate" },
    { Header: "Scope %", accessor: "scope" },
    { Header: "Payment %", accessor: "payment" },
    { Header: "Status", accessor: "status" },
    { Header: "Actions", accessor: "actions" }, // Assuming 'actions' will be handled by the table component
  ];

  const [isDeliveryCompletionOpen, setDeliveryCompletionOpen] = useState(false);
  const [isDeliveryInvoiceOpen, setDeliveryInvoiceOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted!");
  };

  const openModal = (deliverable, modalType) => {
    setSelectedDeliverable(deliverable);
    if (modalType === "completion") setDeliveryCompletionOpen(true);
    if (modalType === "invoice") setDeliveryInvoiceOpen(true);
    if (modalType === "details") setDetailsOpen(true);
  };

  return (
    <div className="p-6">
      {/* Removed the main "Project Cards" h1 title as sections will have their own */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
          Project Deliverables
        </h2>
        <ProjectDelivarablesTable
          data={deliverables}
          columns={deliverableColumns}
          tableName="projectDeliverables"
        />
      </div>
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
          Risks and Issues
        </h2>
        <RisksAndIssuesTable /> {/* Assuming RisksAndIssuesTable handles its own data or uses a default */}
      </div>
    </div>
  );
};

export default ProjectCards;
