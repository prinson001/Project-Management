const express = require("express");
const adminRouter = express.Router();
const {
  addNewUser,
  getUsers,
  deleteUsers,
  getUser,
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

module.exports = adminRouter;
