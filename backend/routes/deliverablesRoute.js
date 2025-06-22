const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverableController');
const { verifyToken } = require('../middlewares/verifyToken');
const multer = require('multer');
const { 
  createDeliverableInvoiceApprovalTaskForPMO, 
  createDeliverableCompletionApprovalTaskForPMO 
} = require('../controllers/taskCreationController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /deliverables/get-project-deliverables - Get deliverables for a project
// Keeping verifyToken for this one as it's a GET-like operation
router.post('/get-project-deliverables', verifyToken, deliverableController.getProjectDeliverablesFromBody);

// GET /deliverables/:deliverableId/payment-history - Get payment history for a deliverable
router.get('/:deliverableId/payment-history', deliverableController.getDeliverablePaymentHistory);

// GET /deliverables/:deliverableId/progress-history - Get progress history for a deliverable
router.get('/:deliverableId/progress-history', verifyToken, deliverableController.getDeliverableProgressHistory);

// GET /deliverables/:deliverableId/documents - Get all documents for a deliverable with download URLs
router.get('/:deliverableId/documents', deliverableController.getDeliverableDocuments);

// PUT /deliverables/payment-history/:paymentId - Update payment history status
router.put('/payment-history/:paymentId', deliverableController.updatePaymentHistoryStatus);

// GET /deliverables/documents/download-url - Get document download URL
router.get('/documents/download-url', deliverableController.getDocumentDownloadUrlEndpoint);

// GET /deliverables/project/:projectId - Get deliverables by project ID
router.get('/project/:projectId', deliverableController.getDeliverablesByProject);

// GET /deliverables/:deliverableId - Get deliverable by ID
router.get('/:id',  deliverableController.getDeliverableById);

// POST /deliverables/:deliverable_id/documents - Upload document for a specific deliverable
// Use deliverable_id in the URL to match controller expectations
router.post('/:deliverable_id/documents', upload.single('evidenceFile'), deliverableController.submitDeliverableDocument);

// POST /deliverables/:deliverable_id/create-invoice-approval-task - Create invoice approval task for PMO
router.post('/:deliverable_id/create-invoice-approval-task', async (req, res) => {
  try {
    const { deliverable_id } = req.params;
    await createDeliverableInvoiceApprovalTaskForPMO(deliverable_id);
    res.status(201).json({
      success: true,
      message: "Invoice approval task created successfully for PMO"
    });
  } catch (error) {
    console.error("Error creating invoice approval task:", error);
    res.status(500).json({
      success: false,
      message: "Error creating invoice approval task",
      error: error.message
    });
  }
});

// POST /deliverables/:deliverable_id/create-completion-approval-task - Create completion approval task for PMO
router.post('/:deliverable_id/create-completion-approval-task', async (req, res) => {
  try {
    const { deliverable_id } = req.params;
    await createDeliverableCompletionApprovalTaskForPMO(deliverable_id);
    res.status(201).json({
      success: true,
      message: "Completion approval task created successfully for PMO"
    });
  } catch (error) {
    console.error("Error creating completion approval task:", error);
    res.status(500).json({
      success: false,
      message: "Error creating completion approval task",
      error: error.message
    });
  }
});

module.exports = router;
