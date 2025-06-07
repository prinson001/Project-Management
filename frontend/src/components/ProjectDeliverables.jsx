import React, { useState } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";

// Modal components from ProjectDelivarablesTable
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
        <p><strong>Progress:</strong> {deliverable.progress}%</p>
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

const deliverables = [
  {
    id: "1",
    name: "Current State assessment Report",
    progress: 80,
    startDate: "5-Jan-24",
    endDate: "20-Feb-24",
    status: "on-track",
  },
  {
    id: "2",
    name: "Gap Analysis Report",
    progress: 70,
    startDate: "5-Jan-24",
    endDate: "20-Feb-24",
    status: "on-track",
  },
  {
    id: "3",
    name: "Future State Report",
    progress: 20,
    startDate: "5-Jan-24",
    endDate: "20-Feb-24",
    status: "at-risk",
  },
  {
    id: "4",
    name: "Road map",
    progress: 0,
    startDate: "5-Jan-24",
    endDate: "20-Feb-24",
    status: "delayed",
  },
  {
    id: "5",
    name: "Operating model activation",
    progress: 0,
    startDate: "5-Jan-24",
    endDate: "20-Feb-24",
    status: "delayed",
  },
];

const getProgressColor = (status) => {
  switch (status) {
    case "on-track":
      return "bg-green-500";
    case "at-risk":
      return "bg-yellow-500";
    case "delayed":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

export default function ProjectDeliverables() {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null); // 'completion', 'invoice', 'details', 'changeRequest', 'dates'
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-red-600">Deliverables</h2>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

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
                    className={`h-full ${getProgressColor(deliverable.status)} transition-all duration-300`}
                    style={{ width: `${deliverable.progress}%` }}
                  />
                </div>
                <span className="font-medium">{deliverable.progress}%</span>
              </div>

              <div className="flex items-center gap-4">
                <span>{deliverable.startDate}</span>
                <span>{deliverable.endDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
