const express = require("express");
const router = express.Router();

const {getProjectDetails , getProjectDeliverables , getPreviousMeetingNotes , createNextWeekProjectTask, getProjectTasksGroupedByWeek, getNextWeekProjectTasks, deleteNextWeekProjectTask} = require("../controllers/projectCardController");
const {getRisks , insertRisk} = require("../controllers/riskIssuesController");

router.get("/project-details/:projectid",getProjectDetails);
router.get("/deliverables/:projectid",getProjectDeliverables);
router.get("/risk",getRisks);
router.post("/risk",insertRisk);
router.get("/meeting-notes",getPreviousMeetingNotes);
router.post("/next-week-task",createNextWeekProjectTask);
router.get("/next-week-task/:projectId",getNextWeekProjectTasks);
router.delete("/next-week-task/:id",deleteNextWeekProjectTask);
router.get("/project-tasks/:projectid",getProjectTasksGroupedByWeek);



module.exports = router;