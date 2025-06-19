const postgres = require("postgres");
const dotenv = require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = postgres(connectionString, {
  idle_timeout: 20, // Auto-close idle connections after 20s
  max: 20, // Increase concurrent connections
  connect_timeout: 30, // 30 seconds connection timeout
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
  retry: 3, // Retry failed connections 3 times
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  onnotice: (notice) => {
    console.log('Database notice:', notice);
  },
  onparameter: (key, value) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Database parameter:', key, value);
    }
  }
});

// Test initial connection
sql`SELECT 1`.then(() => {
  console.log("✅ Database connected successfully");
}).catch(err => {
  console.error("❌ Initial database connection failed:", err.message);
});

// Gracefully close connection on app shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connection...");
  await sql.end(); // Close the connection properly
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Closing database connection...");
  await sql.end();
  process.exit(0);
});

module.exports = sql;
