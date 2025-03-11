const express = require("express");
const router = express.Router();
const { getItems, saveItems } = require("../controllers/itemController");

const {
  getDeliverables,
  saveDeliverables,
  getItemsWithDeliverables,
  saveDeliverablesItems,
} = require("../controllers/deliverableController");

router.post("/getItems", getItems);
router.post("/saveItems", saveItems);
router.get("/:projectId/items-with-deliverables", getItemsWithDeliverables);
router.post("/:projectId/save-deliverables", saveDeliverablesItems);
router.post("/getDeliverables", getDeliverables);
router.post("/saveDeliverables", saveDeliverables);
module.exports = router;
