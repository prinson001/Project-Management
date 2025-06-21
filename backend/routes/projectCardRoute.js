const express = require("express");
const router = express.Router();
const multer = require('multer');

const { getProjectDetails, getPreviousMeetingNotes , createNextWeekProjectTask , getNextWeekProjectTasks, deleteNextWeekProjectTask, getProjectTasksGroupedByWeek,getProjectPhaseNames, getProjectDocumentsGrouped , getProjectDocumentsOverview, getProjectsBasedOnUserId , getProjectDocuments}  = require("../controllers/projectCardController");
const { getRisks, insertRisk , deleteRisk } = require("../controllers/riskIssuesController");
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




router.get("/project-details/:projectid",getProjectDetails);
// router.get("/deliverables/:projectid",getProjectDeliverables);
router.get("/risk",getRisks);
router.post("/risk",insertRisk);
router.get("/meeting-notes",getPreviousMeetingNotes);``
router.get("/meeting-notes",getPreviousMeetingNotes);
router.post("/next-week-task",createNextWeekProjectTask);
router.get("/next-week-task/:projectId",getNextWeekProjectTasks);
router.delete("/next-week-task/:id",deleteNextWeekProjectTask);
router.get("/project-tasks/:projectid",getProjectTasksGroupedByWeek);
router.get("/project-phase",getProjectPhaseNames);
router.delete("/risk/:riskId",deleteRisk)

router.get("/project-documents/:projectId",getProjectDocuments);
router.get("/project-documents-overview/:projectId",getProjectDocumentsOverview);
router.get("/projects/:userId",getProjectsBasedOnUserId);

module.exports = router;