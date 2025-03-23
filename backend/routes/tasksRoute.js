const express = require("express");
const router = express.Router();
const { getTasks, filterTasks } = require("../controllers/tasksController");
const {
  getProgramWithAllRelatedData,
} = require("../controllers/accordionDataController");

router.post("/getTasks", getTasks);
router.post("/filterTasks", filterTasks);
router.post("/getProjectWithAllRelatedData", getProgramWithAllRelatedData);

module.exports = router;
