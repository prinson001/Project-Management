const cron = require("node-cron");
const sql = require("../database/db"); // Adjust path

function initCronJobs() {
  console.log("Initializing cron jobs...");

  async function updateOverdueTasks() {
    console.log("running");
    try {
      const result = await sql`
        UPDATE tasks
        SET status = 'Delayed'
        WHERE 
          due_date < CURRENT_DATE AND
          status = 'Open'
      `;
      console.log(
        `Updated ${result.count} overdue tasks at ${new Date().toISOString()}`
      );
    } catch (error) {
      console.error("Error updating overdue tasks:", error);
    }
  }

  cron.schedule("39 10 * * *", updateOverdueTasks, {
    timezone: "Asia/Kolkata",
  });

  cron.schedule("0 1 * * *", updateOverdueTasks, {
    timezone: "Asia/Kolkata",
  });
}

module.exports = initCronJobs;
