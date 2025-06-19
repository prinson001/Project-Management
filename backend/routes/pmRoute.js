const express = require("express");
const router = express.Router();
const { getItems, saveItems } = require("../controllers/itemController");

const {
  getDeliverables,
  saveDeliverables,
  getItemsWithDeliverables,
  saveDeliverablesItems,
  getProjectDeliverablesFromBody,
} = require("../controllers/deliverableController");

const {
  getProjectPhaseDocuments,
} = require("../controllers/documentTemplateController");

const {
  getProjectDetailsWithVendor,
} = require("../controllers/projectController");

router.post("/getItems", getItems);
router.post("/saveItems", saveItems);
router.post("/items-with-deliverables", getItemsWithDeliverables);
router.post("/:projectId/save-deliverables", saveDeliverablesItems);
router.post("/getDeliverables", getDeliverables);
router.post("/saveDeliverables", saveDeliverables);
router.post("/getProjectDocuments", getProjectPhaseDocuments);
router.post("/getProjectDetailsWithVendor", getProjectDetailsWithVendor);
router.post("/getProjectDeliverables", getProjectDeliverablesFromBody);

module.exports = router;
