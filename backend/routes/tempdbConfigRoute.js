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
} = require("../database/dbConfig");

router.get("/cuser", createUsersTable);
router.get("/cinitiative", createInitiativeTable);
router.get("/cdepartment", createDepartmentTable);
router.get("/cobjective", createObjectiveTable);
router.get("/cvendor", createVendorTable);
router.get("/crole", createTableRole);
router.get("/ctablesetting", createTableTableSetting);
router.get("/itablesetting", insertTableSetting);

module.exports = router;
