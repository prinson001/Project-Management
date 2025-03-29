const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const authRouter = express.Router();
const {
  login,
  updateUserData,
  getUsers,
  resetPassword,
} = require("../controllers/authController");

authRouter.post("/login", login);
authRouter.get("/change", updateUserData);
authRouter.get("/getUsers", verifyToken, getUsers);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;
