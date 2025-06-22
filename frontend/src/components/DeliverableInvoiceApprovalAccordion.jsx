import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";

function DeliverableInvoiceApprovalAccordion({
  task,
  closeAccordion,
}) {
  const [deliverable, setDeliverable] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Get latest invoice payment history
      const paymentHistoryResult = await axiosInstance.get(
        `/deliverables/${targetDeliverableId}/payment-history`
      );
      
      if (paymentHistoryResult.data.paymentHistory && paymentHistoryResult.data.paymentHistory.length > 0) {
        // Get the most recent invoice
        const latestInvoice = paymentHistoryResult.data.paymentHistory
          .filter(payment => payment.document_type === 'INVOICE')
          .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))[0];
        setInvoiceDetails(latestInvoice);
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

  const updateInvoiceApprovalStatus = async (status) => {
    if (!task?.id || !invoiceDetails?.id) {
      console.error("Task ID or Invoice ID is missing");
      return;
    }

    try {
      // Update the invoice status in payment history
      const response = await axiosInstance.put(
        `/deliverables/payment-history/${invoiceDetails.id}`,
        {
          status: status === "Approved" ? "APPROVED" : "REJECTED",
          reviewed_at: new Date().toISOString(),
        }
      );

      if (response.data.success) {
        // Update task status to Done
        const taskResponse = await axiosInstance.post(
          `/data-management/updateTaskStatusToDone`,
          {
            taskId: task.id,
          }
        );

        if (taskResponse.data.status === "success") {
          toast.success(`Invoice ${status.toLowerCase()} successfully`);
          closeAccordion();
        } else {
          toast.error("Failed to update task status");
        }
      } else {
        toast.error(response.data.message || "Failed to update invoice status");
      }
    } catch (error) {
      console.error("Error updating invoice approval status:", error);
      toast.error("Error updating invoice approval status");
    }
  };

  const handleApproveClick = () => {
    updateInvoiceApprovalStatus("Approved");
  };

  const handleRejectClick = () => {
    updateInvoiceApprovalStatus("Rejected");
  };

  const getDocumentDownloadUrl = async (storagePath) => {
    try {
      const response = await axiosInstance.get(
        `/deliverables/documents/download-url?path=${encodeURIComponent(storagePath)}`
      );
      return response.data.downloadUrl;
    } catch (error) {
      console.error("Error getting download URL:", error);
      return null;
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceDetails?.storage_path) {
      toast.error("No invoice file available");
      return;
    }

    try {
      const downloadUrl = await getDocumentDownloadUrl(invoiceDetails.storage_path);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error downloading invoice");
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
      <h1 className="text-2xl font-bold mb-6">Invoice Approval</h1>
      
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
              <label className="block text-sm font-medium text-gray-700">Current Payment Percentage</label>
              <p className="mt-1 text-sm text-gray-900">{deliverable.payment_percentage || 0}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scope Percentage</label>
              <p className="mt-1 text-sm text-gray-900">{deliverable.scope_percentage || 0}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Invoice Details</h2>
        {invoiceDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Amount</label>
              <p className="mt-1 text-sm text-gray-900">
                {invoiceDetails.invoice_amount ? `$${invoiceDetails.invoice_amount.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Percentage</label>
              <p className="mt-1 text-sm text-gray-900">{invoiceDetails.related_payment_percentage || 0}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {invoiceDetails.uploaded_at ? new Date(invoiceDetails.uploaded_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File Name</label>
              <p className="mt-1 text-sm text-gray-900">{invoiceDetails.file_name || 'N/A'}</p>
            </div>
            {invoiceDetails.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{invoiceDetails.description}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No invoice details found</p>
        )}
      </div>

      {/* Invoice File */}
      {invoiceDetails && (
        <div className="mb-6">
          <button
            onClick={handleDownloadInvoice}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition duration-200"
          >
            Download Invoice File
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {task.status !== "Done" && (
        <div className="py-4 flex justify-center gap-6">
          <button
            onClick={handleRejectClick}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
          >
            Reject Invoice
          </button>
          <button
            onClick={handleApproveClick}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
          >
            Approve Invoice
          </button>
        </div>
      )}

      {/* Status Display */}
      {task.status === "Done" && invoiceDetails && (
        <div className="flex align-center justify-center p-4">
          <p>
            Invoice was{" "}
            <span
              className={
                invoiceDetails.status === "REJECTED"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {invoiceDetails.status === "REJECTED" ? "Rejected" : "Approved"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default DeliverableInvoiceApprovalAccordion;
