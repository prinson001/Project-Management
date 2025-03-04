const express = require("express");
const router = express.Router();
const {
  createUsersTable,
  createInitiativeTable,
  createDepartmentTable,
  createObjectiveTable,
  createVendorTable,
  createTableRole,
  createTableTableSetting,
  insertTableSetting,
  connectUserWithRole,
  connectUserWithDepartment,
  createTableActivityDuration,
  createTablePhase,
  createTableBudgetRange,
  createTablePhaseDuration,
  setDefaultPhases,
  getPhaseDurations,
  getBudgetRanges,
  updatePhaseDurations,
  createTableTask,
  createTablePortfolio,
  createTableProgram,
  createTypeProjectCategory,
  createTableProjectType,
  createTableProjectPhase,
  createTableProject,
  createTableItem,
  createTableDeliverable,
} = require("../database/dbConfig");

router.get("/cuser", createUsersTable);
router.get("/cinitiative", createInitiativeTable);
router.get("/cdepartment", createDepartmentTable);
router.get("/cobjective", createObjectiveTable);
router.get("/cvendor", createVendorTable);
router.get("/crole", createTableRole);
router.get("/ctablesetting", createTableTableSetting);
router.get("/itablesetting", insertTableSetting);
router.get("/conuserwithrole", connectUserWithRole);
router.get("/conuserwithdepartment", connectUserWithDepartment);
router.get("/cactivityduration", createTableActivityDuration);
router.get("/cphase", createTablePhase);
router.get("/cbudgetrange", createTableBudgetRange);
router.get("/cphaseduration", createTablePhaseDuration);
router.get("/iphase", setDefaultPhases);
router.get("/rphaseduration", getPhaseDurations);
router.get("/rbudgetrange", getBudgetRanges);
router.post("/updatephaseduration", updatePhaseDurations);
router.get("/ctask", createTableTask);
router.get("/cportfolio", createTablePortfolio);
router.get("/cprogram", createTableProgram);
router.get("/cEnumProjectCategory", createTypeProjectCategory);
router.get("/cprojectType", createTableProjectType);
router.get("/cprojectphase", createTableProjectPhase);
router.get("/cproject", createTableProject);
router.get("/citem", createTableItem);
router.get("/cdeliverable", createTableDeliverable);

module.exports = router;
