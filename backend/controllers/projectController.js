const sql = require("../database/db");
const {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
} = require("./taskCreationController");
//  @Description add new Project
//  @Route site.com/data-management/addproject
const addProject = async (req, res) => {
  // Check if data exists in the request body

  console.log("Project Body", req.body);
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
    // Extract beneficiary_departments from data and remove it from the main data object
    const { beneficiary_departments, objectives, ...projectData } = data;

    // Map budget fields to correct column names
    if (projectData.planned_budget) {
      projectData.project_budget = projectData.planned_budget;
      delete projectData.planned_budget;
    }

    if (projectData.approved_budget) {
      projectData.approved_project_budget = projectData.approved_budget;
      delete projectData.approved_budget;
    }

    // Extract column names and values from the projectData object
    const columns = Object.keys(projectData);
    const values = Object.values(projectData);

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

    // Build parameterized query for inserting the project
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const queryText = `
      INSERT INTO project (${columns.map((col) => `"${col}"`).join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *;
    `;

    // Execute the query to insert the project
    const result = await sql.unsafe(queryText, values);
    const projectId = result[0].id; // Get the newly created project ID

    // Insert beneficiary departments into the project_department table
    if (beneficiary_departments && beneficiary_departments.length > 0) {
      console.log(
        "Inserting beneficiary departments:",
        beneficiary_departments
      );

      const departmentInsertQueries = beneficiary_departments.map(
        (departmentId) => {
          return sql`
          INSERT INTO project_department (project_id, department_id)
          VALUES (${projectId}, ${departmentId});
        `;
        }
      );

      await Promise.all(departmentInsertQueries);
    }

    // Insert project objectives
    if (objectives && Array.isArray(objectives) && objectives.length > 0) {
      console.log("Inserting project objectives:", objectives);

      try {
        // Build the query to insert project objectives
        const objectiveValues = objectives
          .map((objectiveId) => {
            return `(${projectId}, ${objectiveId})`;
          })
          .join(", ");

        const objectiveQuery = `
          INSERT INTO project_objective (project_id, objective_id)
          VALUES ${objectiveValues}
        `;

        await sql.unsafe(objectiveQuery);
        console.log("Project objectives inserted successfully");
      } catch (error) {
        console.error("Error inserting project objectives:", error);
        // Continue execution even if objectives insertion fails
      }
    }

    // Return success response with the newly created project
    return res.status(201).json({
      status: "success",
      message: "Project and beneficiary departments added successfully",
      result: result[0],
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
  const beneficiaryDepartments = data.beneficiary_departments;

  // Remove beneficiary_departments from data to avoid SQL errors
  if (data.beneficiary_departments) {
    delete data.beneficiary_departments;
  }

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

    // Update beneficiary departments if provided
    if (beneficiaryDepartments && Array.isArray(beneficiaryDepartments)) {
      try {
        // First, delete existing relationships
        await sql`
          DELETE FROM project_department
          WHERE project_id = ${id}
        `;

        // Then insert new relationships
        if (beneficiaryDepartments.length > 0) {
          const departmentInsertQueries = beneficiaryDepartments.map(
            (departmentId) => {
              return sql`
              INSERT INTO project_department (project_id, department_id)
              VALUES (${id}, ${departmentId});
            `;
            }
          );

          await Promise.all(departmentInsertQueries);
        }
      } catch (error) {
        console.error("Error updating beneficiary departments:", error);
        // Continue with the response even if department updates fail
      }
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

    // Build the query with parameterized id to get project details
    const projectQuery = `
        SELECT * FROM project
        WHERE id = $1
    `;

    // Query to get associated departments
    const departmentsQuery = `
        SELECT d.id, d.name, d.arabic_name
        FROM department d
        JOIN project_department pd ON d.id = pd.department_id
        WHERE pd.project_id = $1
    `;

    // Execute the query
    const projectResult = await sql.unsafe(projectQuery, [id]);
    const departmentsResult = await sql.unsafe(departmentsQuery, [id]);

    // Check if any row was found
    if (!projectResult || projectResult.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }

    // Combine project data with departments
    const projectData = projectResult[0];
    projectData.beneficiary_departments = departmentsResult;

    // Return success response with project data
    return res.status(200).json({
      status: "success",
      message: "Project retrieved successfully",
      result: projectData,
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
            durationType = ${plan.durationType || null}, -- Add durationType
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
          INSERT INTO schedule_plan (
            project_id,
            mainPhase,
            subPhase,
            phaseId,
            duration,
            durationType, -- Add durationType
            startDate,
            endDate
          )
          VALUES (
            ${projectId},
            ${plan.mainPhase},
            ${plan.subPhase},
            ${plan.phaseId},
            ${plan.duration},
            ${plan.durationType || null}, -- Add durationType
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

// @Description Get all project phases
// @Route site.com/data-management/getProjectPhases
const getProjectPhases = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name, description FROM project_phase;
    `;

    return res.status(200).json({
      status: "success",
      message: "Project phases retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving project phases:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving project phases",
      result: error.message || error,
    });
  }
};

// @Description Get all project types
// @Route site.com/data-management/getProjectTypes
const getProjectTypes = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name, description FROM project_type;
    `;

    return res.status(200).json({
      status: "success",
      message: "Project types retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving project types:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving project types",
      result: error.message || error,
    });
  }
};

// @Description Get project phase information by phase ID
// @Route site.com/data-management/getProjectPhase
const getProjectPhase = async (req, res) => {
  // Check if phase_id exists in the request body
  if (!req.body || !req.body.phase_id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: phase_id is required",
      result: null,
    });
  }

  const { phase_id } = req.body;

  try {
    // Validate that phase_id is numeric
    if (isNaN(phase_id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid phase_id format: must be a number",
        result: null,
      });
    }

    // Query to get phase information
    const result = await sql`
      SELECT id, name, arabic_name 
      FROM project_phase
      WHERE id = ${phase_id}
    `;

    // Check if phase was found
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Phase with id ${phase_id} not found`,
        result: null,
      });
    }

    // Return success response with the phase information
    return res.status(200).json({
      status: "success",
      message: "Phase information retrieved successfully",
      result: result[0],
    });
  } catch (error) {
    console.error("Error retrieving phase information:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving phase information",
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
  upsertSchedulePlan,
  getProjectPhases,
  getProjectPhase,
  getProjectTypes,
};
