const express = require("express");
const router = express.Router();

const {getProjectDetails , getProjectDeliverables} = require("../controllers/projectCardController");
const {getRisks , insertRisk} = require("../controllers/riskIssuesController");

router.get("/project-details/:projectid",getProjectDetails);
router.get("/deliverables/:projectid",getProjectDeliverables);
router.get("/risk",getRisks);
router.post("/risk",insertRisk);

module.exports = router;