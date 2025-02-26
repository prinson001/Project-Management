const express = require("express");
const router = express.Router();
const {
  createUsersTable,
  createInitiativeTable,
  createDepartmentTable,
  createObjectiveTable,
  createVendorTable,
  createTableRole,
} = require("../database/dbConfig");

router.get("/cuser", createUsersTable);
router.get("/cinitiative", createInitiativeTable);
router.get("/cdepartment", createDepartmentTable);
router.get("/cobjective", createObjectiveTable);
router.get("/cvendor", createVendorTable);
router.get("/crole", createTableRole);

module.exports = router;
