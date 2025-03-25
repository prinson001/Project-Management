const sql = require("../database/db");

// @Description Upsert schedule plan for a project
// @Route site.com/data-management/upsertSchedulePlan
const upsertSchedulePlan = async (req, res) => {
  console.log("schedule plan body:", req.body);
  const { projectId, schedule } = req.body;

  if (!projectId || !schedule || !Array.isArray(schedule)) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: projectId and schedule array are required",
      result: null,
    });
  }

  try {
    for (const plan of schedule) {
      if (
        !plan.phaseId ||
        !plan.durationDays ||
        !plan.startDate ||
        !plan.endDate
      ) {
        return res.status(400).json({
          status: "failure",
          message:
            "Missing required fields in schedule data: phaseId, durationDays, startDate, and endDate are required",
          result: null,
        });
      }
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          status: "failure",
          message: "Invalid date format in schedule data",
          result: null,
        });
      }
    }

    const result = await sql.begin(async (sql) => {
      try {
        // Delete existing schedule plan for the project
        await sql`
          DELETE FROM schedule_plan_new
          WHERE project_id = ${projectId};
        `;

        const insertQueries = schedule.map((plan) => {
          const startDate = new Date(plan.startDate)
            .toISOString()
            .split("T")[0];
          const endDate = new Date(plan.endDate).toISOString().split("T")[0];

          return sql`
            INSERT INTO schedule_plan_new (
              project_id,
              phase_id,
              duration_days,
              start_date,
              end_date
            )
            VALUES (
              ${projectId},
              ${plan.phaseId},
              ${plan.durationDays},
              ${startDate},
              ${endDate}
            )
            RETURNING *;
          `;
        });

        // Execute inserts sequentially to avoid prepared statement conflicts
        const results = [];
        for (const query of insertQueries) {
          const result = await query;
          results.push(result);
        }

        return results;
      } catch (error) {
        // Ensure the transaction is rolled back if any query fails
        throw error;
      }
    });

    return res.status(201).json({
      status: "success",
      message: "Schedule plan upserted successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error upserting schedule plan:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message: "Project or phase does not exist",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error upserting schedule plan",
      result: error.message || error,
    });
  }
};

// @Description Get all phases with default durations based on budget
// @Route site.com/data-management/getPhases
const getSchedulePhases = async (req, res) => {
  const { budget } = req.body;
  console.log("Budget", budget);
  console.log(typeof budget);
  if (!budget || isNaN(budget)) {
    return res.status(400).json({
      status: "failure",
      message: "Budget is required and must be a number",
      result: null,
    });
  }

  try {
    const budgetRange = await sql`
      SELECT id
      FROM budget_range
      WHERE (${budget} > min_budget AND ${budget} <= max_budget)
         OR (${budget} > min_budget AND max_budget IS NULL)
      LIMIT 1;
    `;

    if (!budgetRange || budgetRange.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "No budget range found for the provided budget",
        result: null,
      });
    }

    const rangeId = budgetRange[0].id;

    const result = await sql`
      SELECT 
        p.id,
        p.phase_name,
        p.main_phase,
        pd.duration_days
      FROM phase p
      LEFT JOIN phase_duration pd ON p.id = pd.phase_id AND pd.range_id = ${rangeId}
      ORDER BY p.id;
    `;

    return res.status(200).json({
      status: "success",
      message: "Phases retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving phases:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving phases",
      result: error.message || error,
    });
  }
};

// @Description Get schedule plan for a project
// @Route site.com/data-management/getSchedulePlan
const getSchedulePlan = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: projectId is required",
      result: null,
    });
  }

  try {
    if (isNaN(projectId)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid projectId format: must be a number",
        result: null,
      });
    }

    const result = await sql`
      SELECT sp.*, p.main_phase, p.phase_name
      FROM schedule_plan_new sp
      JOIN phase p ON sp.phase_id = p.id
      WHERE sp.project_id = ${projectId}
      ORDER BY sp.phase_id;
    `;

    return res.status(200).json({
      status: "success",
      message: "Schedule plan retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving schedule plan:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving schedule plan",
      result: error.message || error,
    });
  }
};

module.exports = {
  upsertSchedulePlan,
  getSchedulePhases,
  getSchedulePlan,
};
