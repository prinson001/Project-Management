const express = require("express");
const router = express.Router();
const {
  getData,
  getSetting,
  getFilteredData,
} = require("../controllers/dataManagementController");
const { addInitiative } = require("../controllers/initiativeController");

router.post("/setting", getSetting);
router.post("/data", getData);
router.post("/filtereddata", getFilteredData);
router.post("/addinitiative", addInitiative);
module.exports = router;
