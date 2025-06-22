import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";

function DeliverableCompletionApprovalAccordion({
  task,
  closeAccordion,
}) {
  const [deliverable, setDeliverable] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("PENDING");

  // Helper function to extract deliverable ID from task description
  const extractDeliverableId = (description) => {
    if (!description) return null;
    const match = description.match(/deliverable_id:(\d+)/);
    return match ? match[1] : null;
  };

  const fetchDeliverableDetails = async () => {
    try {
      setLoading(true);
      
      // Extract deliverable ID from task description
      const deliverableId = extractDeliverableId(task.description);
      
      if (!deliverableId) {
        // Fallback to using related_entity_id if no deliverable ID in description
        console.warn("No deliverable ID found in task description, using related_entity_id");
        const deliverableIdFallback = task.related_entity_id;
        
        if (!deliverableIdFallback) {
          setError("No deliverable ID available");
          return;
        }
      }
      
      const targetDeliverableId = deliverableId || task.related_entity_id;
      
      // Get deliverable details
      const deliverableResult = await axiosInstance.get(
        `/deliverables/${targetDeliverableId}`
      );
      setDeliverable(deliverableResult.data.deliverable);

      // Get delivery notes for this deliverable
      const deliveryNotesResult = await axiosInstance.get(
        `/deliverables/${targetDeliverableId}/documents?documentType=DELIVERY_NOTE`
      );
      setDeliveryNotes(deliveryNotesResult.data.documents || []);

      // Check if there's already an approval status
      const completionResult = await axiosInstance.post(
        "/data-management/getDeliverableCompletionStatus",
        {
          deliverableId: targetDeliverableId,
        }
      );
      
      if (completionResult.data.completion_status) {
        setApprovalStatus(completionResult.data.completion_status);
      }
    } catch (e) {
      console.error("Error fetching deliverable details:", e);
      setError("Failed to load deliverable details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (task?.related_entity_id || task?.description) {
      fetchDeliverableDetails();
    }
  }, [task]);

  const updateCompletionApprovalStatus = async (status) => {
    if (!deliverable?.id) {
      setError("Deliverable ID is missing, cannot update status.");
      return;
    }

    try {
      // Update deliverable completion status
      await axiosInstance.post(
        "/data-management/updateDeliverableCompletionApproval",
        {
          deliverableId: deliverable.id,
          completionStatus: status,
        }
      );

      // Update the task status to "Done"
      await axiosInstance.post("/data-management/updateTaskStatusToDone", {
        taskId: task.id,
      });

      // Refetch details to show updated status
      fetchDeliverableDetails();
      setApprovalStatus(status);

      if (status === "APPROVED") {
        toast.success("Deliverable approved successfully!");
        closeAccordion();
      }
    } catch (error) {
      console.error("Error updating completion status:", error);
      setError(
        `Failed to update status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleApproveClick = () => {
    updateCompletionApprovalStatus("APPROVED");
  };

  const handleRejectClick = () => {
    updateCompletionApprovalStatus("REJECTED");
  };
  const handleDownloadDeliveryNote = async (note) => {
    try {
      if (note.download_url) {
        window.open(note.download_url, '_blank');
      } else {
        toast.error("Download URL not available for this document");
      }
    } catch (error) {
      console.error("Error downloading delivery note:", error);
      toast.error("Error downloading delivery note");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading deliverable details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Deliverable Completion Approval</h1>
      
      {/* Deliverable Information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Deliverable Information</h2>
        {deliverable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Deliverable Name</label>
              <p className="mt-1 text-sm text-gray-900">{deliverable.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget</label>
              <p className="mt-1 text-sm text-gray-900">
                {deliverable.budget ? `$${deliverable.budget.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scope Progress</label>
              <p className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  (deliverable.scope_percentage || 0) >= 100 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {deliverable.scope_percentage || 0}%
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Progress</label>
              <p className="mt-1 text-sm text-gray-900">{deliverable.payment_percentage || 0}%</p>
            </div>
            {deliverable.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{deliverable.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delivery Notes */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Delivery Notes</h2>
        {deliveryNotes.length > 0 ? (
          <div className="space-y-3">
            {deliveryNotes.map((note, index) => (
              <div key={note.id || index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{note.file_name}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {note.uploaded_at ? new Date(note.uploaded_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {note.description && (
                      <p className="text-xs text-gray-600 mt-1">{note.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownloadDeliveryNote(note)}
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No delivery notes found for this deliverable</p>
        )}
      </div>

      {/* Completion Summary */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Completion Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {deliverable?.scope_percentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Scope Completion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {deliverable?.payment_percentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Payment Completion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {deliveryNotes.length}
            </div>
            <div className="text-sm text-gray-600">Delivery Notes</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {task.status !== "Done" && (
        <div className="py-4 flex justify-center gap-6">
          <button
            onClick={handleRejectClick}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
          >
            Reject Completion
          </button>
          <button
            onClick={handleApproveClick}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
          >
            Approve Completion
          </button>
        </div>
      )}      {/* Status Display */}
      {task.status === "Done" && (
        <div className="flex align-center justify-center p-4">
          <p>
            Deliverable completion was{" "}
            <span
              className={
                approvalStatus === "REJECTED"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {approvalStatus === "REJECTED" ? "Rejected" : "Approved"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default DeliverableCompletionApprovalAccordion;
