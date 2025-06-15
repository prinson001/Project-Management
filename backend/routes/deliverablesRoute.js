const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverableController');
const { verifyToken } = require('../middlewares/verifyToken'); // Assuming you have this middleware

// POST /api/deliverables/get-project-deliverables - Get deliverables for a project
router.post('/get-project-deliverables', verifyToken, deliverableController.getProjectDeliverablesFromBody);

// POST /api/deliverables/:deliverableId/documents - Upload document for a specific deliverable
router.post('/:deliverableId/documents', verifyToken, deliverableController.uploadDeliverableDocument);


module.exports = router;
