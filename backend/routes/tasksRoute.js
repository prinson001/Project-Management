const express = require("express");
const router = express.Router();
const { getTasks, filterTasks } = require("../controllers/tasksController");

router.post("/getTasks", getTasks);
router.post("/filterTasks", filterTasks);

module.exports = router;
