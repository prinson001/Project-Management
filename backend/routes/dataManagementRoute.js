const express = require("express");
const multer = require("multer");

// Define storage
const storage = multer.memoryStorage(); // Store file in memory buffer

const upload = multer({ storage: storage });
const router = express.Router();
const {
  getData,
  getSetting,
  getFilteredData,
  getUsers,
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

const {
  createDocumentTemplate,
} = require("../controllers/documentTemplateController");

const {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
} = require("../controllers/projectController");

const {
  getPhaseDurations,
  getPhaseDurationsByBudget,
} = require("../database/dbConfig");

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
router.get("/users", getUsers);

router.post(
  "/addDocumentTemplate",
  upload.single("file"),
  createDocumentTemplate
);

router.get("/users", getUsers);

router.post("/addProject", addProject);
router.post("/updateProject", updateProject);
router.post("/deleteProject", deleteProject);
router.post("/getProject", getProjectById);

router.post("/getPhaseDurationsByBudget", getPhaseDurationsByBudget);

module.exports = router;
