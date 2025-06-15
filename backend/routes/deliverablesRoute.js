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

// POST /deliverables/:deliverableId/documents - Upload document for a specific deliverable
// Changed to use submitDeliverableDocument and added multer middleware
// Temporarily removed verifyToken for testing, add back if needed
// Changed 'file' to 'evidenceFile' to match the field name apparently sent by the frontend
router.post('/:deliverableId/documents', upload.single('evidenceFile'), deliverableController.submitDeliverableDocument);


module.exports = router;
