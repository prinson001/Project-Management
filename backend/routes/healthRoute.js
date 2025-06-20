const express = require("express");
const router = express.Router();
const { testDatabaseConnection } = require("../middlewares/databaseHealth");
const sql = require("../database/db");

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const dbHealth = await testDatabaseConnection();
    
    if (dbHealth) {
      return res.status(200).json({
        status: "healthy",
        message: "Database connection is working",
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(503).json({
        status: "unhealthy",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    return res.status(503).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Database connection test endpoint
router.get("/db-test", async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        NOW() as current_time,
        version() as db_version,
        current_database() as database_name,
        current_user as current_user
    `;
    
    return res.status(200).json({
      status: "success",
      message: "Database test successful",
      data: result[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return res.status(500).json({
      status: "failure",
      message: "Database test failed",
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
