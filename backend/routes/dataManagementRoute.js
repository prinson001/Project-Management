const express = require("express");
const router = express.Router();
const {
  getData,
  getSetting,
  getFilteredData,
} = require("../controllers/dataManagementController");
const {
  addInitiative,
  updateInitiative,
  deleteInitiative,
} = require("../controllers/initiativeController");

router.post("/setting", getSetting);
router.post("/data", getData);
router.post("/filtereddata", getFilteredData);
router.post("/addinitiative", addInitiative);
router.post("/updateinitiative", updateInitiative);
router.post("/deleteinitiative", deleteInitiative);
module.exports = router;
