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
  upsertTableSetting,
  getRoles,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/dataManagementController");
const {
  addInitiative,
  updateInitiative,
  deleteInitiative,
  getInitiatives,
} = require("../controllers/initiativeController");

const {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolios,
} = require("../controllers/portfolioController");

const {
  addProgram,
  updateProgram,
  deleteProgram,
  getPrograms,
  getProgramDetails,
} = require("../controllers/programController");

const {
  createDocumentTemplate,
  getProjectPhaseDocuments,
  getCurrentPhaseDocumentTemplates,
} = require("../controllers/documentTemplateController");

const {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
  updateProjectApprovalbyDeputy,
  getProjectPhases,
  getProjectPhase,
  getProjectTypes,
  addBeneficiaryDepartments,
  getBeneficiaryDepartments,
  updateBOQApprovalbyPMO,
  getProjectBoqApprovalStatus,
  addProjectObjectives,
  getProjectObjectives,
  updateProjectObjectives,
  getDeliverableCompletionStatus,
  updateDeliverableCompletionApproval,
  getProjectTimeline,
} = require("../controllers/projectController");
const {
  getSchedulePlan,
  upsertSchedulePlan,
  getSchedulePhases,
  upsertInternalSchedulePlan,
  getInternalSchedulePlan,
} = require("../controllers/schedulePlanController");

const {
  addDepartment,
  getRelatedProjects,
  updateDepartment,
  deleteDepartment,
  getDepartments,
} = require("../controllers/departmentController");

const {
  getPhaseDurations,
  getPhaseDurationsByBudget,
} = require("../database/dbConfig");
const {
  addVendor,
  updateVendor,
  getVendors,
  deleteVendor,
} = require("../controllers/vendorController");
const {
  addObjective,
  getObjectives,
  updateObjective,
  deleteObjective,
  getRelatedProjectsforObjective,
} = require("../controllers/objectiveController");

const {
  getInitiativeWithAllRelatedData,
  getPortfolioWithAllRelatedData,
  getProgramWithAllRelatedData,
  getProjectWithAllRelatedData,
  getUserRelatedEntities,
} = require("../controllers/accordionDataController");
const {
  addProjectDocument,
  getProjectDocuments,
  deleteProjectDocument,
} = require("../controllers/documentController");
const {
  createProjectCreationTaskForDeputy,
  checkProjectApprovalTaskExists,
} = require("../controllers/taskCreationController");

const { updateTaskStatusToDone } = require("../controllers/tasksController");

router.post("/setting", getSetting);
router.post("/data", getData);
router.post("/filtereddata", getFilteredData);
router.post("/upsertTableSetting", upsertTableSetting);

router.post("/addInitiative", addInitiative);
router.post("/updateInitiative", updateInitiative);
router.post("/deleteInitiative", deleteInitiative);
router.post("/getInitiatives", getInitiatives);

router.post("/addPortfolio", addPortfolio);
router.post("/updatePortfolio", updatePortfolio);
router.post("/deletePortfolio", deletePortfolio);
router.post("/getPortfolios", getPortfolios);

router.post("/addprogram", addProgram);
router.post("/updateProgram", updateProgram);
router.post("/deleteProgram", deleteProgram);
router.post("/getPrograms", getPrograms);

router.post(
  "/addDocumentTemplate",
  upload.single("file"),
  createDocumentTemplate
);
router.post(
  "/getCurrentPhaseDocumentTemplates",
  getCurrentPhaseDocumentTemplates
);

router.get("/users", getUsers);

router.post("/addProject", addProject);
router.post("/updateProject", updateProject);
router.post("/deleteProject", deleteProject);
router.post("/getProject", getProjectById);

router.post("/getPhaseDurationsByBudget", getPhaseDurationsByBudget);
router.post("/updateProjectApproval", updateProjectApprovalbyDeputy);

router.post("/upsertSchedulePlan", upsertSchedulePlan);
router.post("/upsertInternalSchedulePlan", upsertInternalSchedulePlan);

router.post("/getInitiativeWithRelatedData", getInitiativeWithAllRelatedData);
router.post("/getPortfolioWithRelatedData", getPortfolioWithAllRelatedData);
router.post("/getProgramWithRelatedData", getProgramWithAllRelatedData);
router.post("/getProjectWithRelatedData", getProgramWithAllRelatedData);
router.post("/getUserRelatedEntities", getUserRelatedEntities);

router.post("/adddepartment", addDepartment);
router.post("/getDepartments", getDepartments);
router.post("/updateDepartment", updateDepartment);
router.post("/deleteDepartment", deleteDepartment);
router.post("/getDepartmentProjects", getRelatedProjects);
router.post("/addProjectObjectives", addProjectObjectives);
router.post("/getProjectObjectives", getProjectObjectives);
router.post("/updateProjectObjectives", updateProjectObjectives);

router.post("/addvendor", addVendor);
router.post("/updatevendor", updateVendor);
router.post("/getVendors", getVendors);
router.post("/deletevendor", deleteVendor);

router.post("/addObjective", addObjective);
router.post("/getObjectives", getObjectives);
router.post("/updateObjective", updateObjective);
router.post("/deleteObjective", deleteObjective);
router.post("/getRelatedProjectsforObjective", getRelatedProjectsforObjective);
router.post("/getProjectDocuments", getProjectDocuments);
router.post("/addProjectDocument", upload.single("file"), addProjectDocument);
//router.post("/addProjectDocument",addProjectDocument);
router.post("/getProjectPhases", getProjectPhases);
router.post("/getProjectPhase", getProjectPhase);
router.post("/getProjectTypes", getProjectTypes);

router.post("/deleteProjectDocument", deleteProjectDocument);
router.post("/getSchedulePhases", getSchedulePhases);
router.post("/getPhaseDurations", getPhaseDurations);

router.post("/getSchedulePlan", getSchedulePlan);
router.post("/getProjectTimeline", getProjectTimeline);

router.post("/addBeneficiaryDepartments", addBeneficiaryDepartments);
router.post("/getBeneficiaryDepartments", getBeneficiaryDepartments);

router.post("/getInternalSchedulePlan", getInternalSchedulePlan);

router.post("/getRoles", getRoles);
router.post("/addUser", addUser);
router.post("/updateUsers", updateUser);
router.post("/deleteUsers", deleteUser);

router.post(
  "/createProjectCreationTaskForDeputy",
  createProjectCreationTaskForDeputy
);
router.post(
  "/checkProjectApprovalTaskExists",
  checkProjectApprovalTaskExists
);

router.post("/getProgramDetails", getProgramDetails);

router.post("/updateBOQApprovalbyPMO", updateBOQApprovalbyPMO);
router.post("/getProjectBoqApprovalStatus", getProjectBoqApprovalStatus);
router.post("/updateTaskStatusToDone", updateTaskStatusToDone);

// Deliverable completion status routes
router.post("/getDeliverableCompletionStatus", getDeliverableCompletionStatus);
router.post(
  "/updateDeliverableCompletionApproval",
  updateDeliverableCompletionApproval
);

module.exports = router;
