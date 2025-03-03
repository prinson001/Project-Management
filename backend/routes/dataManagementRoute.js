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

const {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/portfolioController");

const {
  addProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");

router.post("/setting", getSetting);
router.post("/data", getData);
router.post("/filtereddata", getFilteredData);

router.post("/addinitiative", addInitiative);
router.post("/updateinitiative", updateInitiative);
router.post("/deleteinitiative", deleteInitiative);

router.post("/addPortfolio", addPortfolio);
router.post("/updatePortfolio", updatePortfolio);
router.post("/deletePortfolio", deletePortfolio);

router.post("/addProgram", addProgram);
router.post("/updateProgram", updateProgram);
router.post("/deleteProgram", deleteProgram);
module.exports = router;
