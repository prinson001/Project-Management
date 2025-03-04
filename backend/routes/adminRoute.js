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

adminRouter.post("/add", addNewUser);
adminRouter.get("/getUsers", getUsers);
adminRouter.delete("/deleteUser/:id", deleteUsers);
adminRouter.get("/getactivitydurations", getActivityDurations);
adminRouter.post("/updateactivityduration", updateActivityDurations);
adminRouter.post("/getUser", getUser);
adminRouter.get("/getRoles", getRoles);
adminRouter.post("/updateUser", updateUser);
module.exports = adminRouter;
