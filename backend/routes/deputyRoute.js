const express = require("express");
const router = express.Router();
const {
  updateProjectApprovalbyDeputy,
  getProjectApprovalStatus,
} = require("../controllers/projectController");
const { updateTaskStatusToDone } = require("../controllers/tasksController");

router.post("/updateApprovalStatus", updateProjectApprovalbyDeputy);
router.post("/getProjectApprovalStatus", getProjectApprovalStatus);

router.post("/updateTaskStatusToDone", updateTaskStatusToDone);

module.exports = router;
