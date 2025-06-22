const cron = require("node-cron");
const sql = require("../database/db"); // Adjust path

function initCronJobs() {
  console.log("Initializing cron jobs...");


  cron.schedule("39 10 * * *", updateOverdueTasks, {
    timezone: "Asia/Kolkata",
  });

  cron.schedule("0 1 * * *", updateOverdueTasks, {
    timezone: "Asia/Kolkata",
  });

  cron.schedule("39 10 * * *", updateRiskToIssues, {
    timezone: "Asia/Kolkata",
  });

  cron.schedule("0 1 * * *", updateRiskToIssues, {
    timezone: "Asia/Kolkata",
  });
}
const updateOverdueTasks  = async()=> {
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

//  updates all the risk records type "risk" => "issue" when todays date is due date
const updateRiskToIssues = async () => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await sql`
      UPDATE 
        risks
      SET 
        type = 'issue'
      WHERE
        due_date = ${today} AND
        type = 'risk'
    `;

    console.log(`Updated ${result.count} risk(s) to type 'issue'`);
  } catch (e) {
    console.error("Error updating risks to issues:", e);
  }
};


module.exports = initCronJobs;
