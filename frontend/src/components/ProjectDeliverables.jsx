import React, { useState, useEffect } from "react";
import axios from "../axiosInstance";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { formatCurrency } from "../utils/currencyUtils";

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
        </div>        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Submit</button>
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
        </div>        <div>
          <label className="block text-sm font-medium text-gray-700">Deliverable remaining value (SAR)</label>
          <input type="text" value={formatCurrency(deliverable.remaining_budget || 100000, 'SAR')} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Amount (SAR)</label>
          <input type="text" value={formatCurrency(50000, 'SAR', false)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Full Amount</label>
          <input type="checkbox" className="h-4 w-4 text-green-600 border-gray-300 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Submit</button>
      </div>
    </div>
  </div>
);

const ViewDeliverableDetailsModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View Deliverable Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Name:</strong>
            <p className="text-gray-700">{deliverable.name}</p>
          </div>
          <div>
            <strong>Status:</strong>
            <p className="text-gray-700">{deliverable.status}</p>
          </div>
          <div>
            <strong>Progress:</strong>
            <p className="text-gray-700">{deliverable.progress_percentage || deliverable.calculatedProgress}%</p>
          </div>
          <div>
            <strong>Payment Progress:</strong>
            <p className="text-gray-700">{deliverable.calculatedPaymentProgress}%</p>
          </div>
          <div>
            <strong>Start Date:</strong>
            <p className="text-gray-700">{deliverable.startDate}</p>
          </div>
          <div>
            <strong>End Date:</strong>
            <p className="text-gray-700">{deliverable.endDate}</p>
          </div>
          <div>
            <strong>Duration:</strong>
            <p className="text-gray-700">{deliverable.duration} days</p>
          </div>
          <div>
            <strong>Scope:</strong>
            <p className="text-gray-700">{deliverable.scope_percentage}%</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Financial Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Budget:</strong>
              <p className="text-gray-700">{formatCurrency(deliverable.amount, 'SAR')}</p>
            </div>
            <div>
              <strong>Invoiced:</strong>
              <p className="text-gray-700">{formatCurrency(deliverable.invoiced, 'SAR')}</p>
            </div>
            <div>
              <strong>Remaining:</strong>
              <p className="text-gray-700">{formatCurrency(deliverable.remaining_budget, 'SAR')}</p>
            </div>
            <div>
              <strong>Payment %:</strong>
              <p className="text-gray-700">{deliverable.payment_percentage}%</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mt-4"
        >
          Close
        </button>
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
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Submit Request</button>
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
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Submit</button>
      </div>
    </div>
  </div>
);

// Calculate progress based on dates
const calculateProgress = (startDate, endDate, status) => {
  const today = new Date('2025-06-19'); // Current date
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
    return 100; // Show 100% but with different coloring
  }

  // Calculate percentage based on elapsed time
  const progress = (elapsedDuration / totalDuration) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
};

// Calculate delay visualization segments for progress bar
const calculateDelaySegments = (startDate, endDate, status) => {
  const today = new Date('2025-06-19');
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) return { greenWidth: 0, redWidth: 0 };

  const totalDuration = end - start;
  const elapsedDuration = today - start;
  
  // If task hasn't started yet or is completed
  if (today < start || status.toLowerCase() === 'completed') {
    return { greenWidth: 100, redWidth: 0 };
  }

  // If task is overdue
  if (today >= end && status.toLowerCase() === 'pending') {
    const scheduledProgress = 100;
    const delayDuration = today - end;
    const delayPercentage = Math.min((delayDuration / totalDuration) * 100, 100);
    
    return {
      greenWidth: Math.max(scheduledProgress - delayPercentage, 0),
      redWidth: Math.min(delayPercentage, 100)
    };
  }

  // Task is on track
  const progress = Math.min((elapsedDuration / totalDuration) * 100, 100);
  return { greenWidth: progress, redWidth: 0 };
};

// Calculate payment progress based on budget and invoiced amounts
const calculatePaymentProgress = (amount, invoiced) => {
  if (!amount || amount === 0) return 0;
  const progress = (invoiced / amount) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
};

export default function ProjectDeliverables({ projectId }) {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);  // Dummy data commented out since we're using real API data
  /*
  const dummyDeliverables = [
    {
      id: 1,
      name: "Current State Assessment Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
      amount: 150000, // Budget/total value
      invoiced: 120000, // Already invoiced amount
      remaining_budget: 30000,
      payment_percentage: 80,
      progress_percentage: 80,
      scope_percentage: 85,
      duration: 46,
    },
    {
      id: 2,
      name: "Gap Analysis Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "completed",
      calculatedProgress: 0,
      amount: 200000,
      invoiced: 100000,
      remaining_budget: 100000,
      payment_percentage: 50,
      progress_percentage: 100,
      scope_percentage: 100,
      duration: 46,
    },
    {
      id: 3,
      name: "Future State Report",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
      amount: 180000,
      invoiced: 18000,
      remaining_budget: 162000,
      payment_percentage: 10,
      progress_percentage: 20,
      scope_percentage: 25,
      duration: 46,
    },
    {
      id: 4,
      name: "Road Map",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
      amount: 120000,
      invoiced: 0,
      remaining_budget: 120000,
      payment_percentage: 0,
      progress_percentage: 0,
      scope_percentage: 0,
      duration: 46,
    },
    {
      id: 5,
      name: "Operating Model Activation",
      startDate: "2024-01-05",
      endDate: "2024-02-20",
      status: "pending",
      calculatedProgress: 0,
      amount: 250000,
      invoiced: 0,
      remaining_budget: 250000,
      payment_percentage: 0,
      progress_percentage: 0,
      scope_percentage: 0,
      duration: 46,
    },
  ];
  */

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError("No projectId provided. Please pass a valid projectId prop to ProjectDeliverables.");
      console.warn('No projectId provided to ProjectDeliverables component.');
      return;    }

    // Fetch real deliverables data from backend
    setLoading(true);
    console.log('Fetching deliverables for projectId:', projectId);
    axios
      .get(`/project-card/deliverables/${projectId}`)
      .then((res) => {
        console.log('Deliverables API response:', res);
        const enhancedDeliverables = res.data.map(deliverable => ({
          ...deliverable,
          // Map backend fields to frontend expected fields
          startDate: deliverable.start_date,
          endDate: deliverable.end_date,
          status: deliverable.status || 'NOT_STARTED',
          calculatedProgress: calculateProgress(deliverable.start_date, deliverable.end_date, deliverable.status || 'NOT_STARTED'),
          calculatedPaymentProgress: calculatePaymentProgress(deliverable.amount, deliverable.invoiced),
          delaySegments: calculateDelaySegments(deliverable.start_date, deliverable.end_date, deliverable.status || 'NOT_STARTED'),
        }));
        setDeliverables(enhancedDeliverables);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching deliverables:', err);
        setError("Failed to fetch deliverables");
        setLoading(false);
      });
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
      ) : (        <div className="space-y-3">
          {deliverables.map((deliverable) => (
            <div key={deliverable.id} className="border-b border-gray-200 pb-3 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-900">{deliverable.name}</h3>
                <button
                  onClick={() => toggleDropdown(deliverable.id)}
                  className="h-6 w-6 p-0 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded relative"
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

              {/* Progress Bar with percentage and dates in table-like row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600 w-12">Progress</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    {/* Green progress section */}
                    <div
                      className="h-full bg-green-500 transition-all duration-300 absolute left-0 top-0"
                      style={{ width: `${deliverable.delaySegments.greenWidth}%` }}
                    />
                    {/* Red delay section */}
                    {deliverable.delaySegments.redWidth > 0 && (
                      <div
                        className="h-full bg-red-500 transition-all duration-300 absolute top-0"
                        style={{ 
                          left: `${deliverable.delaySegments.greenWidth}%`,
                          width: `${deliverable.delaySegments.redWidth}%` 
                        }}
                      />
                    )}
                  </div>
                  <span className="font-medium w-8">{deliverable.progress_percentage || deliverable.calculatedProgress}%</span>
                </div>
                
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{formatDate(deliverable.startDate)}</span>
                  <span>{formatDate(deliverable.endDate)}</span>
                </div>
              </div>

              {/* Payment Bar in table-like row */}
              <div className="flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600 w-12">Payment</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${deliverable.calculatedPaymentProgress}%` }}
                    />
                  </div>
                  <span className="font-medium w-8">{deliverable.calculatedPaymentProgress}%</span>
                </div>
                
                {/* Empty space to align with dates above */}
                <div className="flex items-center gap-4 text-transparent">
                  <span>spacer</span>
                  <span>spacer</span>
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