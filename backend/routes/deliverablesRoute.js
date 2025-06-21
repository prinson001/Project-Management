const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverableController');
const { verifyToken } = require('../middlewares/verifyToken');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /deliverables/get-project-deliverables - Get deliverables for a project
// Keeping verifyToken for this one as it's a GET-like operation
router.post('/get-project-deliverables', verifyToken, deliverableController.getProjectDeliverablesFromBody);

// GET /deliverables/:deliverableId/payment-history - Get payment history for a deliverable
router.get('/:deliverableId/payment-history', verifyToken, deliverableController.getDeliverablePaymentHistory);

// GET /deliverables/:deliverableId/progress-history - Get progress history for a deliverable
router.get('/:deliverableId/progress-history', verifyToken, deliverableController.getDeliverableProgressHistory);

// GET /deliverables/:deliverableId/documents - Get all documents for a deliverable with download URLs
router.get('/:deliverableId/documents', verifyToken, deliverableController.getDeliverableDocuments);

// POST /deliverables/:deliverable_id/documents - Upload document for a specific deliverable
// Use deliverable_id in the URL to match controller expectations
router.post('/:deliverable_id/documents', upload.single('evidenceFile'), deliverableController.submitDeliverableDocument);


module.exports = router;
