const sql = require("../database/db");

// Database health check middleware
const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Quick health check query
    await sql`SELECT 1`;
    next();
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(503).json({
      status: "failure",
      message: "Database service unavailable",
      result: error.message,
    });
  }
};

// Function to test database connection
const testDatabaseConnection = async () => {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log("✅ Database connection test successful");
    console.log("Time:", result[0].current_time);
    console.log("Version:", result[0].db_version);
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
};

// Retry wrapper for database operations
const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

module.exports = {
  checkDatabaseConnection,
  testDatabaseConnection,
  withRetry,
};
