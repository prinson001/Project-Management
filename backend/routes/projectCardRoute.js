const express = require("express");
const router = express.Router();
const multer = require('multer');

const { getProjectDetails, getPreviousMeetingNotes } = require("../controllers/projectCardController");
const { getRisks, insertRisk } = require("../controllers/riskIssuesController");
const {
    getDeliverablesByProjectId,
    getProjectDeliverablesFromBody,
    submitDeliverableDocument, // Changed from uploadDeliverableDocument
    updateDeliverableProgressManual // Added
} = require("../controllers/deliverableController");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Removed verifyToken middleware as per the change request

router.get("/project-details/:projectid", getProjectDetails);

// This route uses projectid from params and calls the controller that expects it in params
router.get("/deliverables/:projectid", getDeliverablesByProjectId);

// This route uses projectId from body and calls the controller that expects it in body
router.post("/get-project-deliverables", getProjectDeliverablesFromBody);

// Route for submitting/uploading deliverable documents
// Uses deliverable_id in params, and other data + file in body (multipart/form-data)
router.post("/deliverables/:deliverable_id/documents", upload.single('file'), submitDeliverableDocument);

// NEW: Route for manually updating deliverable progress
router.put("/deliverables/:deliverableId/progress", updateDeliverableProgressManual);

router.get("/risk", getRisks);
router.post("/risk", insertRisk);
router.get("/meeting-notes", getPreviousMeetingNotes);

module.exports = router;