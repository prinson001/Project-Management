const express = require("express");
const router = express.Router();
const {
  getData,
  getSetting,
} = require("../controllers/dataManagementController");

router.post("/setting", getSetting);
router.post("/data", getData);
module.exports = router;
