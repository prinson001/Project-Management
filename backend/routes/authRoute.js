const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const authRouter = express.Router();

// Import the whole controller object first for debugging
const authController = require("../controllers/authController");

// Destructure after logging
const {
  login,
  updateUserData,
  getUsers,
  resetPassword,
} = authController || {}; // Add fallback to empty object to prevent further errors if authController is undefined

authRouter.post("/login", login);
authRouter.get("/change", updateUserData);
authRouter.get("/getUsers", verifyToken, getUsers);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;
