const express = require("express");
const router = express.Router();
const { getTasks, filterTasks } = require("../controllers/tasksController");
const {
  getProjectWithAllRelatedData,
} = require("../controllers/accordionDataController");
const {
  createSchedulePlanTaskForPM,
  createBoqApprovalTaskForPMO,
} = require("../controllers/taskCreationController");

router.post("/getTasks", getTasks);
router.post("/filterTasks", filterTasks);
router.post("/getProjectWithAllRelatedData", getProjectWithAllRelatedData);
router.post("/createSchedulePlanTaskForPM", createSchedulePlanTaskForPM);
router.post("/createBoqApprovalTaskForPMO", createBoqApprovalTaskForPMO);
module.exports = router;
