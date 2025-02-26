const express = require("express");
const adminRouter = express.Router();
const {
  addNewUser,
  getUsers,
  deleteUsers,
} = require("../controllers/adminController");

adminRouter.post("/add", addNewUser);
adminRouter.get("/getUsers", getUsers);
adminRouter.delete("/deleteUser/:id", deleteUsers);

module.exports = adminRouter;
