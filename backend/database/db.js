const postgres = require("postgres");
const dotenv = require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, {
  idle_timeout: 10, // Auto-close idle connections after 10s
  max: 10, // Limit concurrent connections
});

// Gracefully close connection on app shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connection...");
  await sql.end(); // Close the connection properly
  process.exit(0);
});

module.exports = sql;
