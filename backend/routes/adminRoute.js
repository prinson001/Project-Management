const express = require("express");
const adminRouter = express.Router();
const {
  addNewUser,
  getUsers,
  deleteUsers,
  getUser,
  getRoles,
  updateUser,
} = require("../controllers/adminController");

const {
  getActivityDurations,
  updateActivityDurations,
} = require("../controllers/activityDurationController");

const {
  getPhaseDurations,
  getBudgetRanges,
  updatePhaseDurations,
  updateBudgetRanges,
} = require("../controllers/projectTimelineController");

adminRouter.post("/addUser", addNewUser);
adminRouter.get("/getUsers", getUsers);
adminRouter.delete("/deleteUser/:id", deleteUsers);
adminRouter.get("/getactivitydurations", getActivityDurations);
adminRouter.post("/updateactivityduration", updateActivityDurations);
adminRouter.post("/getUser", getUser);
adminRouter.get("/getRoles", getRoles);
adminRouter.post("/updateUser", updateUser);
adminRouter.post("/updatephaseduration", updatePhaseDurations);
adminRouter.get("/getPhaseDurations", getPhaseDurations);
adminRouter.get("/getBudgetRanges", getBudgetRanges);
adminRouter.post("/updateBudgetRanges", updateBudgetRanges);
module.exports = adminRouter;
