import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { formatCurrency } from "../utils/currencyUtils";

// Utility functions for currency formatting
const formatAmountForInput = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-US').format(amount);
};

const parseInputAmount = (input) => {
  if (!input) return '';
  return input.replace(/,/g, '');
};

// Working modals from ProjectDeliverablesTable
const DeliveryCompletionModal = ({ onClose, deliverable, projectId, onSuccessfulSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a delivery note document to upload.');
      return;
    }
    if (!deliverable.id) {
      setUploadError('Missing deliverable ID.');
      return;
    }
    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('document_type', 'DELIVERY_NOTE');
    formData.append('description', 'Delivery completion evidence');
    formData.append('file', selectedFile);

    try {
      const response = await axiosInstance.post(`/deliverables/submit-document/${deliverable.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Delivery completion submitted successfully:', response.data);
      if (onSuccessfulSubmit) onSuccessfulSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting delivery completion:', error);
      setUploadError(error.response?.data?.error || 'Failed to submit delivery completion.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delivery Completion</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
            <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {selectedFile && <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>}
          </div>
          {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
          <button type="submit" disabled={uploading} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
            {uploading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

const DeliveryInvoiceModal = ({ onClose, deliverable, onSuccessfulSubmit, projectId }) => {
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [isFullAmount, setIsFullAmount] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [paymentPercentage, setPaymentPercentage] = useState(deliverable.payment_percentage || 0);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select an invoice document to upload.');
      return;
    }
    if (!deliverable.id) {
      setUploadError('Missing deliverable ID.');
      return;
    }
    if (!invoiceAmount && !isFullAmount) {
      setUploadError('Please enter an invoice amount or check Full Amount.');
      return;
    }
    setUploading(true);
    setUploadError('');

    const finalInvoiceAmount = isFullAmount ? remainingValue : parseFloat(invoiceAmount);
    const formData = new FormData();
    formData.append('document_type', 'INVOICE');
    formData.append('invoice_amount', finalInvoiceAmount);
    formData.append('related_payment_percentage', paymentPercentage);
    formData.append('description', `Invoice submission for ${deliverable.name}`);
    formData.append('file', selectedFile);

    try {
      const response = await axiosInstance.post(`/deliverables/submit-document/${deliverable.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Invoice submitted successfully:', response.data);
      if (onSuccessfulSubmit) onSuccessfulSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting invoice:', error);
      setUploadError(error.response?.data?.error || 'Failed to submit invoice.');
    } finally {
      setUploading(false);
    }
  };

  // Calculate remaining value for display
  const remainingValue = (deliverable.amount || 0) - (deliverable.invoiced || 0);

  const handleFullAmountChange = (e) => {
    setIsFullAmount(e.target.checked);
    if (e.target.checked) {
      setInvoiceAmount(remainingValue.toString());
    } else {
      setInvoiceAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delivery Invoice</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Deliverable Name</label>
            <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deliverable Remaining Value (SAR)</label>
            <input type="text" value={formatCurrency(remainingValue, 'SAR', false)} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
          </div>
          <div>
            <label htmlFor="invoiceAmount" className="block text-sm font-medium text-gray-700">Invoice Amount (SAR)</label>
            <input 
              id="invoiceAmount"
              type="text" 
              value={formatAmountForInput(invoiceAmount)} 
              onChange={(e) => setInvoiceAmount(parseInputAmount(e.target.value))}
              disabled={isFullAmount}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
              placeholder="Enter invoice amount (e.g., 100,000)"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="fullAmount"
              checked={isFullAmount}
              onChange={handleFullAmountChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
            />
            <label htmlFor="fullAmount" className="text-sm font-medium text-gray-700">Invoice Full Remaining Amount</label>
          </div>
          <div>
            <label htmlFor="paymentPercentage" className="block text-sm font-medium text-gray-700">Payment Percentage (%)</label>
            <input
              id="paymentPercentage"
              type="number"
              value={paymentPercentage}
              onChange={(e) => setPaymentPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter payment percentage"
              max="100"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="invoiceFile" className="block text-sm font-medium text-gray-700">Upload Invoice Document</label>
            <input 
              id="invoiceFile"
              type="file" 
              onChange={handleFileChange} 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>}
          </div>
          {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
          <button 
            type="submit" 
            disabled={uploading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? 'Submitting...' : 'Submit Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

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
          </div>          <div>
            <strong>Payment Progress:</strong>
            <p className="text-gray-700">{deliverable.paymentProgress}%</p>
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
            </div>            <div>
              <strong>Payment %:</strong>
              <p className="text-gray-700">{deliverable.paymentProgress}%</p>
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

const DeliverableDetailsModal = ({ onClose, deliverable, projectId }) => {
  const [scopeEvidenceFile, setScopeEvidenceFile] = useState(null);
  const [uploadingScope, setUploadingScope] = useState(false);
  const [uploadErrorScope, setUploadErrorScope] = useState('');

  const handleScopeFileChange = (event) => {
    setScopeEvidenceFile(event.target.files[0]);
    setUploadErrorScope('');
  };

  const handleScopeSubmit = async (event) => {
    event.preventDefault();
    if (!scopeEvidenceFile) {
      setUploadErrorScope('Please select a scope evidence document to upload.');
      return;
    }
    if (!deliverable.id) {
      setUploadErrorScope('Missing deliverable ID.');
      return;
    }
    setUploadingScope(true);
    setUploadErrorScope('');

    const formData = new FormData();
    formData.append('document_type', 'SCOPE_EVIDENCE');
    formData.append('description', 'Scope evidence upload');
    formData.append('file', scopeEvidenceFile);

    try {
      const response = await axiosInstance.post(`/deliverables/submit-document/${deliverable.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Scope evidence uploaded successfully:', response.data);
      onClose();
    } catch (error) {
      console.error('Error uploading scope evidence:', error);
      setUploadErrorScope(error.response?.data?.error || 'Failed to upload scope evidence.');
    } finally {
      setUploadingScope(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
      <form onSubmit={handleScopeSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Scope Evidence</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Deliverable Name</label>
            <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Scope Evidence Document</label>
            <input 
              type="file" 
              onChange={handleScopeFileChange} 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {scopeEvidenceFile && <p className="text-sm text-gray-600 mt-1">Selected: {scopeEvidenceFile.name}</p>}
          </div>
          {uploadErrorScope && <p className="text-red-500 text-sm">{uploadErrorScope}</p>}
          <button 
            type="submit" 
            disabled={uploadingScope}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploadingScope ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

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

// Payment progress is now calculated by the backend view, no need for frontend calculation

export default function ProjectDeliverables({ projectId }) {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState({});
  const [savingProgress, setSavingProgress] = useState({});// Dummy data commented out since we're using real API data
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
  // Fetch deliverables from the same endpoint as ProjectDeliverablesTable
  const fetchDeliverables = async () => {
    if (!projectId) {
      setLoading(false);
      setError("No projectId provided. Please pass a valid projectId prop to ProjectDeliverables.");
      console.warn('No projectId provided to ProjectDeliverables component.');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching deliverables for projectId:', projectId);
      const response = await axiosInstance.get(`/project-card/deliverables/${projectId}`);
      console.log('Deliverables API response:', response.data);
      
      const enhancedDeliverables = response.data.map(deliverable => {
        // Calculate duration if not provided
        const calculateDuration = (startDate, endDate) => {
          if (!startDate || !endDate) return null;
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (isNaN(start) || isNaN(end)) return null;
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        };

        // Convert months to days (quick fix for DB storage issue)
        const convertMonthsToDays = (months) => {
          if (!months || months === 0) return null;
          // Assuming average month = 30.44 days (365.25 days / 12 months)
          return Math.round(months * 30.44);
        };

        // Determine duration in days
        const getDurationInDays = () => {
          if (deliverable.duration) {
            // If duration exists and is less than 10, assume it's in months and convert
            if (deliverable.duration < 10) {
              return convertMonthsToDays(deliverable.duration);
            }
            // If duration is 10 or more, assume it's already in days
            return Math.round(deliverable.duration);
          }
          // Fallback to date calculation
          return calculateDuration(deliverable.start_date, deliverable.end_date);
        };

        return {
          ...deliverable,
          // Map backend fields to frontend expected fields
          startDate: deliverable.start_date,
          endDate: deliverable.end_date,
          status: deliverable.status || 'NOT_STARTED',
          duration: getDurationInDays(),
          // Use scope_percentage as the primary progress indicator
          displayProgress: deliverable.scope_percentage || deliverable.progress_percentage || 0,
          calculatedProgress: calculateProgress(deliverable.start_date, deliverable.end_date, deliverable.status || 'NOT_STARTED'),
          // Use backend payment_percentage instead of frontend calculation
          paymentProgress: deliverable.payment_percentage || 0,
          delaySegments: calculateDelaySegments(deliverable.start_date, deliverable.end_date, deliverable.status || 'NOT_STARTED'),
        };
      });
      
      setDeliverables(enhancedDeliverables);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      setError("Failed to fetch deliverables");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [projectId]);
  // Refresh data after successful modal operations
  const handleSuccessfulSubmit = () => {
    fetchDeliverables();
  };

  // Scope change logic: if scope is set to 100, open delivery completion modal
  const handleScopeChange = (id, value) => {
    const numericValue = Math.max(0, Math.min(100, Math.round(Number(value) / 10) * 10));
    setProgressUpdates((prev) => ({
      ...prev,
      [id]: numericValue,
    }));
    // Also update the deliverables to reflect the change immediately
    setDeliverables(deliverables.map(item =>
      item.id === id ? { 
        ...item, 
        scope_percentage: numericValue,
        displayProgress: numericValue
      } : item
    ));
  };

  const handleSaveProgress = async (id) => {
    setSavingProgress((prev) => ({ ...prev, [id]: true }));
    try {
      const progressValue = progressUpdates[id];
      
      // Make API call to save progress
      const response = await axiosInstance.put(`/deliverables/${id}/progress`, {
        scope_percentage: progressValue,
        progress_percentage: progressValue,
        status: progressValue === 100 ? 'COMPLETED' : 'IN_PROGRESS'
      });

      console.log(`Progress saved for deliverable ${id}: ${progressValue}%`);
      
      // Update UI optimistically
      setDeliverables(deliverables.map(item =>
        item.id === id ? { 
          ...item, 
          scope_percentage: progressValue,
          progress_percentage: progressValue,
          displayProgress: progressValue,
          status: progressValue === 100 ? 'COMPLETED' : 'IN_PROGRESS'
        } : item
      ));

      // Clear the progress update for this item since it's been saved
      setProgressUpdates((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // If scope is set to 100, open delivery completion modal for this deliverable
      if (progressValue === 100) {
        const deliverable = deliverables.find(item => item.id === id);
        setSelectedDeliverable(deliverable);
        setSelectedModal('completion');
      }

    } catch (error) {
      console.error('Error saving progress:', error);
      // You might want to show a user-friendly error message here
    } finally {
      setSavingProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

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
                </button>                {openDropdownId === deliverable.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('completion', deliverable)}>Delivery Completion</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('invoice', deliverable)}>Delivery Invoice</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('dates', deliverable)}>Change Deliverable Dates</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('scopeEvidence', deliverable)}>Upload Scope Evidence</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('details', deliverable)}>View Deliverable Details</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleModalOpen('changeRequest', deliverable)}>Apply for Change Request</button>
                  </div>
                )}
              </div>              {/* Status and Duration Row */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deliverable.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      deliverable.status?.toLowerCase() === 'in_progress' || deliverable.status?.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                      deliverable.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      deliverable.status?.toLowerCase() === 'not_started' || deliverable.status?.toLowerCase() === 'not started' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {deliverable.status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{deliverable.duration || 'N/A'} days</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{formatDate(deliverable.startDate)}</span>
                  <span>{formatDate(deliverable.endDate)}</span>
                </div>
              </div>              {/* Progress Bar with percentage */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600 w-12">Progress</span>                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${deliverable.displayProgress}%` }}
                    />
                  </div>
                  <span className="font-medium w-8">{deliverable.displayProgress}%</span>
                </div>
              </div>

              {/* Scope Input with Save Button */}
              <div className="flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600 w-12">Scope</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="10"
                      value={progressUpdates[deliverable.id] ?? (deliverable.scope_percentage || 0)}
                      onChange={(e) => handleScopeChange(deliverable.id, e.target.value)}
                      className="w-12 border border-gray-300 rounded-md p-1 text-xs"
                    />
                    <span className="text-xs">%</span>
                    <button
                      onClick={() => handleSaveProgress(deliverable.id)}
                      disabled={savingProgress[deliverable.id] || progressUpdates[deliverable.id] === undefined}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      title="Save progress"
                    >
                      {savingProgress[deliverable.id] ? 'Saving...' : 'Save'}
                    </button>
                    {deliverable.scope_percentage === 100 && (
                      <span className="text-green-600 text-xs">✓ Complete</span>
                    )}
                  </div>
                </div>
              </div>{/* Payment Bar */}
              <div className="flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600 w-12">Payment</span>                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${deliverable.paymentProgress}%` }}
                    />
                  </div>
                  <span className="font-medium w-8">{deliverable.paymentProgress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}      {selectedModal === 'completion' && (
        <DeliveryCompletionModal 
          onClose={handleModalClose} 
          deliverable={selectedDeliverable} 
          projectId={projectId}
          onSuccessfulSubmit={handleSuccessfulSubmit}
        />
      )}
      {selectedModal === 'invoice' && (
        <DeliveryInvoiceModal 
          onClose={handleModalClose} 
          deliverable={selectedDeliverable} 
          projectId={projectId}
          onSuccessfulSubmit={handleSuccessfulSubmit}
        />
      )}
      {selectedModal === 'details' && (
        <ViewDeliverableDetailsModal onClose={handleModalClose} deliverable={selectedDeliverable} />
      )}
      {selectedModal === 'scopeEvidence' && (
        <DeliverableDetailsModal 
          onClose={handleModalClose} 
          deliverable={selectedDeliverable} 
          projectId={projectId}
        />
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