const express = require("express");
const router = express.Router();
const { getTasks, filterTasks } = require("../controllers/tasksController");
const {
  getProgramWithAllRelatedData,
} = require("../controllers/accordionDataController");
const {
  createSchedulePlanTaskForPM,
} = require("../controllers/taskCreationController");

router.post("/getTasks", getTasks);
router.post("/filterTasks", filterTasks);
router.post("/getProjectWithAllRelatedData", getProgramWithAllRelatedData);
router.post("/createSchedulePlanTaskForPM", createSchedulePlanTaskForPM);
module.exports = router;
