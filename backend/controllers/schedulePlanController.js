const sql = require("../database/db");

// @Description Upsert schedule plan for a project
// @Route site.com/data-management/upsertSchedulePlan
const upsertSchedulePlan = async (req, res) => {
  console.log("schedule plan body:", req.body);
  const {
    projectId,
    schedule,
    execution_duration,
    maintenance_duration,
    execution_start_date,
    execution_end_date,
  } = req.body;
  
  console.log("Extracted values:");
  console.log("- execution_duration:", execution_duration, "(type:", typeof execution_duration, ")");
  console.log("- maintenance_duration:", maintenance_duration, "(type:", typeof maintenance_duration, ")");
  console.log("- execution_start_date:", execution_start_date, "(type:", typeof execution_start_date, ")");
  console.log("- execution_end_date:", execution_end_date, "(type:", typeof execution_end_date, ")");
  
  if (!projectId || !schedule || !Array.isArray(schedule)) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: projectId and schedule array are required",
      result: null,
    });
  }

  // Validate execution_duration and maintenance_duration
  if (!execution_duration) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: execution_duration must be a string (e.g., '4 weeks')",
      result: null,
    });
  }
  if (
    !maintenance_duration ||
    isNaN(parseInt(maintenance_duration, 10)) ||
    parseInt(maintenance_duration, 10) < 1
  ) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: maintenance_duration must be a positive integer (days)",
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
        // Update project table with execution_duration, maintenance_duration, execution_start_date, execution_enddate, and schedule upload status
        await sql`
        UPDATE project
        SET 
          execution_duration = ${execution_duration}::interval,
          maintenance_duration = ${parseInt(maintenance_duration, 10)},
          execution_start_date = ${
            execution_start_date ? new Date(execution_start_date).toISOString().split("T")[0] : null
          }::date,
          execution_enddate = ${
            execution_end_date ? new Date(execution_end_date).toISOString().split("T")[0] : null
          }::date,
          project_schedule_uploaded = true
        WHERE id = ${projectId};
      `;

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

        const results = [];
        for (const query of insertQueries) {
          const result = await query;
          results.push(result);
        }

        return results;
      } catch (error) {
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
  if (budget == null || budget === undefined || isNaN(budget) || budget < 0) {
    return res.status(400).json({
      status: "failure",
      message: "Budget is required and must be a valid positive number",
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

// @Description Upsert internal schedule plan for a project (Internal or Proof of Concept)
// @Route site.com/data-management/upsertInternalSchedulePlan
const upsertInternalSchedulePlan = async (req, res) => {
  console.log("internal schedule plan body:", req.body);
  const { 
    projectId, 
    schedule, 
    executionDuration, 
    maintenanceDuration, 
    executionStartDate,
    executionEndDate
  } = req.body;

  // Validate input
  if (!projectId || !schedule || !Array.isArray(schedule)) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: projectId and schedule array are required",
      result: null,
    });
  }

  // Validate executionDuration and maintenanceDuration
  if (!executionDuration || !executionDuration.match(/^\d+\s*(weeks?|days?|months?)$/i)) {
    return res.status(400).json({
      status: "failure",
      message:
        "Invalid data provided: executionDuration must be in the format 'X weeks/days/months'",
      result: null,
    });
  }
  if (
    !maintenanceDuration ||
    isNaN(parseInt(maintenanceDuration, 10)) ||
    parseInt(maintenanceDuration, 10) < 1
  ) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid data provided: maintenanceDuration must be a positive integer (days)",
      result: null,
    });
  }

  const validPhaseIds = [1, 4];
  for (const plan of schedule) {
    if (
      !plan.phaseId ||
      !validPhaseIds.includes(plan.phaseId) ||
      !plan.durationDays ||
      !plan.startDate ||
      !plan.endDate
    ) {
      return res.status(400).json({
        status: "failure",
        message:
          "Invalid schedule data: phaseId must be 1 (Planning) or 4 (Execution), and durationDays, startDate, and endDate are required",
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

  try {
    const result = await sql.begin(async (sql) => {
      try {
        // Update project table with execution_duration, maintenance_duration, execution_start_date, execution_enddate, and schedule upload status
        await sql`
          UPDATE project
          SET 
            execution_duration = ${executionDuration}::interval,
            maintenance_duration = ${parseInt(maintenanceDuration, 10)},
            execution_start_date = ${
              executionStartDate ? new Date(executionStartDate).toISOString().split("T")[0] : null
            }::date,
            execution_enddate = ${
              executionEndDate ? new Date(executionEndDate).toISOString().split("T")[0] : null
            }::date,
            project_schedule_uploaded = true
          WHERE id = ${projectId};
        `;

        // Delete existing internal schedule plan for the project (only for phase_id 1 and 4)
        await sql`
          DELETE FROM schedule_plan_new
          WHERE project_id = ${projectId}
          AND phase_id IN (1, 4);
        `;

        // Prepare insert queries for the internal schedule
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

        // Execute inserts sequentially
        const results = [];
        for (const query of insertQueries) {
          const result = await query;
          results.push(result);
        }

        return results;
      } catch (error) {
        throw error; // Roll back transaction on error
      }
    });

    return res.status(201).json({
      status: "success",
      message: "Internal schedule plan upserted successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error upserting internal schedule plan:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message: "Project or phase does not exist",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error upserting internal schedule plan",
      result: error.message || error,
    });
  }
};

// @Description Get internal schedule plan for a project
// @Route site.com/data-management/getInternalSchedulePlan
const getInternalSchedulePlan = async (req, res) => {
  const { projectId } = req.body;

  // Validate projectId
  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: projectId is required",
      result: null,
    });
  }

  if (isNaN(projectId)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid projectId format: must be a number",
      result: null,
    });
  }

  try {
    // Query schedule_plan_new joined with phase table for phases 1 and 4
    const scheduleResult = await sql`
      SELECT 
        sp.phase_id,
        p.main_phase,
        p.phase_name,
        sp.duration_days,
        sp.start_date,
        sp.end_date
      FROM schedule_plan_new sp
      JOIN phase p ON sp.phase_id = p.id
      WHERE sp.project_id = ${projectId}
      AND sp.phase_id IN (1, 4)
      ORDER BY sp.phase_id ASC;
    `;

    // Fetch execution_duration and maintenance_duration from project table
    const projectResult = await sql`
      SELECT execution_duration, maintenance_duration
      FROM project
      WHERE id = ${projectId};
    `;

    const response = {
      status: "success",
      message: "Internal schedule plan retrieved successfully",
      result: scheduleResult.map((row) => ({
        phase_id: row.phase_id,
        main_phase: row.main_phase,
        phase_name: row.phase_name,
        duration_days: row.duration_days || 0,
        start_date: row.start_date
          ? row.start_date.toISOString().split("T")[0]
          : null,
        end_date: row.end_date
          ? row.end_date.toISOString().split("T")[0]
          : null,
      })),
    };

    if (projectResult.length > 0) {
      response.execution_duration = projectResult[0].execution_duration; // e.g., "4 weeks"
      response.maintenance_duration = projectResult[0].maintenance_duration; // integer (days)
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving internal schedule plan:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving internal schedule plan",
      result: error.message || error,
    });
  }
};

module.exports = {
  upsertSchedulePlan,
  getSchedulePhases,
  getSchedulePlan,
  upsertInternalSchedulePlan,
  getInternalSchedulePlan,
};
