const express = require("express");
const router = express.Router();
const {
  updateProjectApprovalbyDeputy,
} = require("../controllers/projectController");

router.post("/updateApprovalStatus", updateProjectApprovalbyDeputy);

module.exports = router;
