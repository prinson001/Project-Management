const sql = require("../database/db");
const {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
} = require("./taskCreationController");
//  @Description add new Project
//  @Route site.com/data-management/addproject
const addProject = async (req, res) => {
  // Check if data exists in the request body
  if (!req.body || !req.body.data || typeof req.body.data !== "object") {
    return res.status(400).json({
      status: "failure",
      message: "Data missing or invalid format",
      result: null,
    });
  }

  const { data } = req.body;
  console.log("Inside Add Project...");

  // Make sure we have at least some data to insert
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for insertion",
      result: null,
    });
  }

  try {
    // Extract column names and values from the data object
    const columns = Object.keys(data);
    const values = Object.values(data);
    console.log("Column Names: ", columns);
    // Validate column names to prevent SQL injection
    for (const column of columns) {
      if (!/^[a-zA-Z0-9_]+$/.test(column)) {
        return res.status(400).json({
          status: "failure",
          message: `Invalid column name: ${column}`,
          result: null,
        });
      }
    }

    // Build parameterized query
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const queryText = `
        INSERT INTO project (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Return success response with the newly created project
    return res.status(201).json({
      status: "success",
      message: "Project added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding project:", error);

    // Handle unique constraint violations or other specific errors
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Project with this identifier already exists",
        result: error.detail || error,
      });
    }

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message: "Referenced entity (portfolio, manager, etc.) does not exist",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error adding project",
      result: error.message || error,
    });
  }
};

//  @Description update existing project
//  @Route site.com/data-management/updateproject
const updateProject = async (req, res) => {
  // Check if id and data exist in the request body
  if (
    !req.body ||
    !req.body.id ||
    !req.body.data ||
    typeof req.body.data !== "object"
  ) {
    return res.status(400).json({
      status: "failure",
      message: "Required fields missing: id and data object are required",
      result: null,
    });
  }

  const { id, data } = req.body;

  // Make sure we have at least some data to update
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for update",
      result: null,
    });
  }

  try {
    // Validate that id is numeric
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    // Extract column names and values from the data object
    const columns = Object.keys(data);
    const values = Object.values(data);

    // Validate column names to prevent SQL injection
    for (const column of columns) {
      if (!/^[a-zA-Z0-9_]+$/.test(column)) {
        return res.status(400).json({
          status: "failure",
          message: `Invalid column name: ${column}`,
          result: null,
        });
      }
    }
    if (req.body.approval == true) {
      console.log("the pmo sent the project for approval");
      columns.push("approval_status");
      values.push("Waiting on deputy");
    }

    // Build the SET part of the query with parameterized values
    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");

    // Add the id parameter at the end
    values.push(id);
    const idPlaceholder = `$${values.length}`;

    // Build the complete query
    const queryText = `
        UPDATE project
        SET ${setClause}
        WHERE id = ${idPlaceholder}
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Check if any row was updated
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }
    try {
      if (req.body.approval == true) {
        // logic to create a task for
        console.log(req.body.approval);
        console.log("the approval is true");
        createProjectCreationTaskForDeputy(req.body.id);
      }
    } catch (e) {
      console.log("there was an error in creation of tasks object ", e);
    }

    // Return success response with the updated project
    return res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating project:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Update violates unique constraint",
        result: error.detail || error,
      });
    }

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message: "Referenced entity (portfolio, manager, etc.) does not exist",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error updating project",
      result: error.message || error,
    });
  }
};

//  @Description delete existing project
//  @Route site.com/data-management/deleteproject
const deleteProject = async (req, res) => {
  // Check if id exists in the request body
  if (!req.body || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  const { id } = req.body;

  try {
    // Validate that id is numeric
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    // Build the query with parameterized id
    const queryText = `
        DELETE FROM project
        WHERE id = $1
        RETURNING id
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, [id]);

    // Check if any row was deleted
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Project deleted successfully",
      result: { id: result[0].id },
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message:
          "Cannot delete this project because it's referenced by other records",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error deleting project",
      result: error.message || error,
    });
  }
};

//  @Description get project details by id
//  @Route site.com/data-management/getproject
const getProjectById = async (req, res) => {
  // Check if id exists in the request body
  if (!req.body || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  const { id } = req.body;

  try {
    // Validate that id is numeric
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    // Build the query with parameterized id
    const queryText = `
        SELECT * FROM project
        WHERE id = $1
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, [id]);

    // Check if any row was found
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }

    // Return success response with project data
    return res.status(200).json({
      status: "success",
      message: "Project retrieved successfully",
      result: result[0],
    });
  } catch (error) {
    console.error("Error retrieving project:", error);

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving project",
      result: error.message || error,
    });
  }
};

const updateProjectApprovalbyDeputy = async (req, res) => {
  console.log("update approval status by deputy");
  if (!req.body.approval || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id , approval is required",
      result: null,
    });
  }
  const status = req.body.approval ? "Approved" : "Rejected";
  try {
    const result = await sql`
    UPDATE project
    SET approval_status = ${status}
    WHERE id = ${req.body.id}
    RETURNING *;
  `;
    createBoqTaskForPM(result);
    res.status(200).json({
      status: "success",
      message: "successfully updated project approval",
      result,
    });
  } catch (e) {
    res.status(200).json({
      status: "failed",
      message: "failed to update project approval",
      result: e,
    });
  }
};
const upsertSchedulePlan = async (req, res) => {
  const { projectId, schedule } = req.body;

  // Validate input
  if (!projectId || !schedule || !Array.isArray(schedule)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid data provided: projectId and schedule are required",
      result: null,
    });
  }

  try {
    // Check if a schedule plan already exists for the project
    const existingSchedule = await sql`
      SELECT id FROM schedule_plan
      WHERE project_id = ${projectId}
      LIMIT 1;
    `;

    if (existingSchedule.length > 0) {
      // Update existing schedule plan
      const updateQueries = schedule.map((plan) => {
        return sql`
          UPDATE schedule_plan
          SET
            mainPhase = ${plan.mainPhase},
            subPhase = ${plan.subPhase},
            phaseId = ${plan.phaseId},
            duration = ${plan.duration},
            startDate = ${plan.startDate || null},
            endDate = ${plan.endDate || null}
          WHERE project_id = ${projectId} AND phaseId = ${plan.phaseId}
          RETURNING *;
        `;
      });

      const results = await Promise.all(updateQueries);

      return res.status(200).json({
        status: "success",
        message: "Schedule updated successfully",
        result: results,
      });
    } else {
      // Insert new schedule plan
      const insertQueries = schedule.map((plan) => {
        return sql`
          INSERT INTO schedule_plan (project_id, mainPhase, subPhase, phaseId, duration, startDate, endDate)
          VALUES (
            ${projectId},
            ${plan.mainPhase},
            ${plan.subPhase},
            ${plan.phaseId},
            ${plan.duration},
            ${plan.startDate || null},
            ${plan.endDate || null}
          )
          RETURNING *;
        `;
      });

      const results = await Promise.all(insertQueries);

      return res.status(201).json({
        status: "success",
        message: "Schedule added successfully",
        result: results,
      });
    }
  } catch (error) {
    console.error("Error upserting schedule:", error);

    // Handle specific errors
    if (error.code === "23503") {
      // Foreign key violation (project_id does not exist)
      return res.status(409).json({
        status: "failure",
        message: "Project does not exist",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error upserting schedule",
      result: error.message || error,
    });
  }
};

module.exports = {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
  updateProjectApprovalbyDeputy,
  upsertSchedulePlan
};
