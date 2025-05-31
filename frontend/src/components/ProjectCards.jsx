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
import DeliverableTimeline from "./DeliverableTimeline.jsx";

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
      name: "The long name of the deliverable for this project",
      duration: "25 days",
      progress: 100,
      budget: 15000,
      invoiced: 0,
      startDate: "2024-01-01",
      endDate: "2024-01-25",
      scope: 100,
      payment: 100,
    },
    {
      name: "Deliverable Number Two",
      duration: "16 days",
      progress: 100,
      budget: 15000,
      invoiced: 0,
      startDate: "2024-01-15",
      endDate: "2024-01-31",
      scope: 100,
      payment: 100,
    },
    {
      name: "Deliverable Number Three",
      duration: "22 days",
      progress: 90,
      budget: 15000,
      invoiced: 0,
      startDate: "2024-02-01",
      endDate: "2024-02-22",
      scope: 90,
      payment: 0,
    },
    {
      name: "Deliverable Number Four",
      duration: "18 days",
      progress: 90,
      budget: 15000,
      invoiced: 0,
      startDate: "2024-02-10",
      endDate: "2024-02-28",
      scope: 90,
      payment: 0,
    },
    {
      name: "Deliverable Number Five",
      duration: "33 days",
      progress: 0,
      budget: 15000,
      invoiced: 0,
      startDate: "2024-03-01",
      endDate: "2024-04-03",
      scope: 0,
      payment: 0,
    },
  ]);

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
      <h1 className="text-2xl font-bold mb-4">Project Cards</h1>
      <DeliverableTimeline deliverables={deliverables} />
    </div>
  );
};

export default ProjectCards;
