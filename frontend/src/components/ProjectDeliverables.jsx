import React, { useState, useEffect } from "react";
import axios from "../axiosInstance";
import { MoreHorizontal, ChevronDown } from "lucide-react";

// Modal components remain unchanged
const DeliveryCompletionModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Delivery Completion</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery name</label>
          <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <button className="flex items-center space-x-2 text-blue-600 hover:underline">
            <span>Delivery note Template</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
      </div>
    </div>
  </div>
);

const DeliveryInvoiceModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Delivery Invoice</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery name</label>
          <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deliverable remaining value (SAR)</label>
          <input type="text" value="100,000" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Amount (SAR)</label>
          <input type="text" value="50,000" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Full Amount</label>
          <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
      </div>
    </div>
  </div>
);

const ViewDeliverableDetailsModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View Deliverable Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <p><strong>Name:</strong> {deliverable.name}</p>
        <p><strong>Progress:</strong> {deliverable.calculatedProgress}%</p>
        <p><strong>Start Date:</strong> {deliverable.startDate}</p>
        <p><strong>End Date:</strong> {deliverable.endDate}</p>
        <p><strong>Status:</strong> {deliverable.status}</p>
      </div>
    </div>
  </div>
);

const ChangeRequestModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Apply for Change Request</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <p>Request changes for {deliverable.name}.</p>
        <textarea className="w-full h-32 border border-gray-300 rounded-md p-2" placeholder="Describe the change request"></textarea>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit Request</button>
      </div>
    </div>
  </div>
);

const ChangeDatesModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Change Deliverable Dates</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">New Start Date</label>
          <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New End Date</label>
          <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
      </div>
    </div>
  </div>
);

// Calculate progress based on dates
const calculateProgress = (startDate, endDate, status) => {
  const today = new Date('2025-06-16'); // Current date for testing
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If dates are invalid, return 0
  if (isNaN(start) || isNaN(end)) return 0;

  const totalDuration = end - start;
  const elapsedDuration = today - start;

  // If task hasn't started yet
  if (today < start) return 0;

  // If task is completed
  if (status.toLowerCase() === 'completed') return 100;

  // If task is overdue and pending
  if (today >= end && status.toLowerCase() === 'pending') {
    return 100; // Will show as red due to overdue status
  }

  // Calculate percentage based on elapsed time
  const progress = (elapsedDuration / totalDuration) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
};

// Determine progress bar color
const getProgressColor = (progress, startDate, endDate, status) => {
  const today = new Date('2025-06-16');
  const end = new Date(endDate);

  // If overdue and pending, show red
  if (today >= end && status.toLowerCase() === 'pending') {
    return "bg-red-500";
  }

  // Otherwise, use green for progress
  if (progress > 0) return "bg-green-500";
  return "bg-gray-300";
};

export default function ProjectDeliverables({ projectId }) {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  // Dummy data for testing
  const dummyDeliverables = [
    {
      id: 1,
      name: "Current State Assessment Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
    },
    {
      id: 2,
      name: "Gap Analysis Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "completed",
      calculatedProgress: 0,
    },
    {
      id: 3,
      name: "Future State Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
    },
    {
      id: 4,
      name: "Road Map",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
    },
    {
      id: 5,
      name: "Operating Model Activation",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
    },
  ];

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("No projectId provided. Please pass a valid projectId prop to ProjectDeliverables.");
      console.warn('No projectId provided to ProjectDeliverables component.');
      return;
    }

    // For testing, use dummy data instead of API call
    const enhancedDeliverables = dummyDeliverables.map(deliverable => ({
      ...deliverable,
      calculatedProgress: calculateProgress(deliverable.startDate, deliverable.endDate, deliverable.status),
    }));

    setDeliverables(enhancedDeliverables);
    setLoading(false);

    // Uncomment below to use actual API call
    /*
    setLoading(true);
    console.log('Fetching deliverables for projectId:', projectId);
    axios
      .get(`/project-card/deliverables/${projectId}`)
      .then((res) => {
        console.log('Deliverables API response:', res);
        const enhancedDeliverables = res.data.map(deliverable => ({
          ...deliverable,
          calculatedProgress: calculateProgress(deliverable.start_date, deliverable.end_date, deliverable.status),
        }));
        setDeliverables(enhancedDeliverables);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching deliverables:', err);
        setError("Failed to fetch deliverables");
        setLoading(false);
      });
    */
  }, [projectId]);

  const toggleDropdown = (id) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const handleModalOpen = (modalType, deliverable) => {
    setSelectedModal(modalType);
    setSelectedDeliverable(deliverable);
    setOpenDropdownId(null);
  };

  const handleModalClose = () => {
    setSelectedModal(null);
    setSelectedDeliverable(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-red-600">Deliverables</h2>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((deliverable) => (
            <div key={deliverable.id} className="space-y-2 relative">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-gray-900">{deliverable.name}</h3>
                <button
                  onClick={() => toggleDropdown(deliverable.id)}
                  className="h-6 w-6 p-0 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {openDropdownId === deliverable.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('completion', deliverable)}>Delivery Completion</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('invoice', deliverable)}>Delivery Invoice</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('dates', deliverable)}>Change Deliverable Dates</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('details', deliverable)}>View Deliverable Details</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('changeRequest', deliverable)}>Apply for Change Request</button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Progress</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(deliverable.calculatedProgress, deliverable.startDate, deliverable.endDate, deliverable.status)} transition-all duration-300`}
                      style={{ width: `${deliverable.calculatedProgress}%` }}
                    />
                  </div>
                  <span className="font-medium">{deliverable.calculatedProgress}%</span>
                </div>

                <div className="flex items-center gap-4">
                  <span>{formatDate(deliverable.startDate)}</span>
                  <span>{formatDate(deliverable.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedModal === 'completion' && (
        <DeliveryCompletionModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
      {selectedModal === 'invoice' && (
        <DeliveryInvoiceModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
      {selectedModal === 'details' && (
        <ViewDeliverableDetailsModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
      {selectedModal === 'changeRequest' && (
        <ChangeRequestModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
      {selectedModal === 'dates' && (
        <ChangeDatesModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
    </div>
  );
}