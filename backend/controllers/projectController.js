const sql = require("../database/db");
const supabase = require("../database/supabase");
const { withRetry } = require("../middlewares/databaseHealth");
const {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
  createSchedulePlanTaskForPM,
} = require("./taskCreationController");
const { getProjectTimeline } = require("./timelineController");

// @Description Add new Project
// @Route site.com/data-management/addproject
const addProject = async (req, res) => {
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

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for insertion",
      result: null,
    });
  }

  // Test database connection before proceeding
  try {
    await sql`SELECT 1`;
    console.log("Database connection verified");
  } catch (connectionError) {
    console.error("Database connection failed:", connectionError);
    return res.status(500).json({
      status: "failure",
      message: "Database connection failed",
      result: connectionError.message,
    });
  }

  try {
    const { beneficiary_departments, objectives, ...projectData } = data;

    // Convert empty strings to null for numeric fields
    const numericFields = [
      "vendor_id",
      "program_id",
      "portfolio_id",
      "initiative_id",
      "project_manager_id",
      "alternative_project_manager_id",
      "approved_project_budget",
      "project_budget",
    ];

    for (const field of numericFields) {
      if (projectData[field] === "") {
        projectData[field] = null;
      }
      // Convert to number if it's a string
      if (projectData[field] !== null && projectData[field] !== undefined) {
        projectData[field] = Number(projectData[field]);
      }
    }

    // Ensure execution_duration is in proper PostgreSQL interval format
    if (projectData.execution_duration) {
      if (typeof projectData.execution_duration === "number") {
        // Convert number to interval string (e.g., 30 -> "30 days")
        projectData.execution_duration = `${projectData.execution_duration} days`;
      } else if (typeof projectData.execution_duration === "string") {
        // Handle existing string formats
        if (projectData.execution_duration.includes("weeks days")) {
          projectData.execution_duration = projectData.execution_duration.replace(
            "weeks days",
            "weeks"
          );
        }
        // If it's just a number string, convert to days
        if (/^\d+$/.test(projectData.execution_duration.trim())) {
          projectData.execution_duration = `${projectData.execution_duration} days`;
        }
      }
    }

    // Check if project is Internal (1) or Proof of Concept (4)
    const isInternalOrPoC = [1, 4].includes(
      Number(projectData.project_type_id)
    );

    // For Internal/PoC projects, ensure certain fields are null
    if (isInternalOrPoC) {
      projectData.vendor_id = null;
      projectData.project_budget = null;
      projectData.approved_project_budget = null;
      projectData.category = null;
    }    // Derive portfolio_id and initiative_id from program_id if provided
    if (projectData.program_id) {
      const programQuery = await withRetry(async () => {
        return await sql`
          SELECT portfolio_id
          FROM program
          WHERE id = ${projectData.program_id}
        `;
      });
      
      if (programQuery.length === 0) {
        return res.status(400).json({
          status: "failure",
          message: `Program with id ${projectData.program_id} not found`,
          result: null,
        });
      }
      projectData.portfolio_id = programQuery[0].portfolio_id;

      if (projectData.portfolio_id) {
        const portfolioQuery = await withRetry(async () => {
          return await sql`
            SELECT initiative_id
            FROM portfolio
            WHERE id = ${projectData.portfolio_id}
          `;
        });
        
        if (portfolioQuery.length === 0) {
          return res.status(400).json({
            status: "failure",
            message: `Portfolio with id ${projectData.portfolio_id} not found`,
            result: null,
          });
        }
        projectData.initiative_id = portfolioQuery[0].initiative_id;
      }
    }

    // Insert project data with retry mechanism
    const columns = Object.keys(projectData).filter(
      (key) => projectData[key] !== undefined
    );
    const values = columns.map((col) => projectData[col]);

    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const queryText = `
      INSERT INTO project (${columns.map((col) => `"${col}"`).join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING id;
    `;

    console.log("Inserting project with data:", projectData);
    const result = await withRetry(async () => {
      return await sql.unsafe(queryText, values);
    });
    const projectId = result[0].id;    // Insert beneficiary departments
    if (beneficiary_departments && beneficiary_departments.length > 0) {
      console.log(
        "Inserting beneficiary departments:",
        beneficiary_departments
      );
      const departmentInsertQueries = beneficiary_departments.map(
        (departmentId) => {
          return withRetry(async () => {
            return await sql`
              INSERT INTO beneficiary_departments (project_id, department_id)
              VALUES (${projectId}, ${departmentId});
            `;
          });
        }
      );
      await Promise.all(departmentInsertQueries);
    }

    // Insert objectives
    if (objectives && Array.isArray(objectives) && objectives.length > 0) {
      console.log("Inserting project objectives:", objectives);
      try {
        const objectiveValues = objectives
          .map((objectiveId) => `(${projectId}, ${objectiveId})`)
          .join(", ");
        const objectiveQuery = `
          INSERT INTO project_objective (project_id, objective_id)
          VALUES ${objectiveValues}
        `;
        await withRetry(async () => {
          return await sql.unsafe(objectiveQuery);
        });
        console.log("Project objectives inserted successfully");
      } catch (error) {
        console.error("Error inserting project objectives:", error);
      }
    }

    // Fetch the complete project data to return
    const fullProjectData = await withRetry(async () => {
      return await sql`
        SELECT * FROM project 
        WHERE id = ${projectId}
      `;
    });

    return res.status(201).json({
      status: "success",
      message: "Project added successfully",
      result: fullProjectData[0],
    });  } catch (error) {
    console.error("Error adding project:", error);
    
    // Handle specific network/DNS errors
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        status: "failure",
        message: "Database connection failed - network or DNS issue",
        result: {
          error: "Cannot connect to database server",
          hostname: error.hostname,
          suggestion: "Please check your internet connection and try again"
        },
      });
    }
    
    if (error.code === "23505") {
      return res.status(409).json({
        status: "failure",
        message: "Project with this identifier already exists",
        result: error.detail || error,
      });
    }
    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message: "Referenced entity (portfolio, manager, etc.) does not exist",
        result: error.detail || error,
      });
    }
    return res.status(500).json({
      status: "failure",
      message: "Error adding project",
      result: error.message || error,
    });
  }
};
// @Description Update existing project
// @Route site.com/data-management/updateproject
const updateProject = async (req, res) => {
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
  const objectives = data.objectives;

  if (data.beneficiary_departments) {
    delete data.beneficiary_departments;
  }
  if (data.objectives) {
    delete data.objectives;
  }

  console.log("Update project - incoming data:", data);
  console.log("Update project - approval flag:", req.body.approval);

  if (Object.keys(data).length === 0 && !req.body.approval) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for update",
      result: null,
    });
  }

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    // Ensure execution_duration is in proper PostgreSQL interval format
    if (data.execution_duration) {
      if (typeof data.execution_duration === "number") {
        // Convert number to interval string (e.g., 30 -> "30 days")
        data.execution_duration = `${data.execution_duration} days`;
      } else if (typeof data.execution_duration === "string") {
        // Handle existing string formats
        if (data.execution_duration.includes("weeks days")) {
          data.execution_duration = data.execution_duration.replace(
            "weeks days",
            "weeks"
          );
        }
        // If it's just a number string, convert to days
        if (/^\d+$/.test(data.execution_duration.trim())) {
          data.execution_duration = `${data.execution_duration} days`;
        }
      }
    }

    const columns = Object.keys(data);
    const values = Object.values(data);

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
      // Only add approval_status if it's not already in the data
      if (!columns.includes('approval_status')) {
        columns.push("approval_status");
        values.push("Waiting on deputy");
      } else {
        // Update the existing approval_status value
        const approvalIndex = columns.indexOf('approval_status');
        if (approvalIndex !== -1) {
          values[approvalIndex] = "Waiting on deputy";
        }
      }
    }

    console.log("Final columns:", columns);
    console.log("Final values:", values);

    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");
    values.push(id);
    const idPlaceholder = `$${values.length}`;

    const queryText = `
      UPDATE project
      SET ${setClause}
      WHERE id = ${idPlaceholder}
      RETURNING *
    `;

    const result = await sql.unsafe(queryText, values);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }

    try {
      if (req.body.approval == true) {
        console.log(req.body.approval);
        console.log("the approval is true");
        console.log("Creating deputy task for project ID:", req.body.id);
        
        // Create deputy task for project approval
        try {
          await createProjectCreationTaskForDeputy({ body: { projectId: req.body.id } }, {
            status: (code) => ({ json: (data) => {
              console.log("Deputy task creation response:", data);
              return data;
            }})
          });
        } catch (taskError) {
          console.error("Error creating deputy task:", taskError);
          // Don't fail the project update if task creation fails
        }
      }
    } catch (e) {
      console.log("there was an error in creation of tasks object ", e);
    }

    if (beneficiaryDepartments && Array.isArray(beneficiaryDepartments)) {
      try {
        await sql`
          DELETE FROM beneficiary_departments
          WHERE project_id = ${id}
        `;
        if (beneficiaryDepartments.length > 0) {
          const departmentInsertQueries = beneficiaryDepartments.map(
            (departmentId) => {
              return sql`
              INSERT INTO beneficiary_departments (project_id, department_id)
              VALUES (${id}, ${departmentId});
            `;
            }
          );
          await Promise.all(departmentInsertQueries);
        }
      } catch (error) {
        console.error("Error updating beneficiary departments:", error);
      }
    }

    if (objectives && Array.isArray(objectives)) {
      try {
        await sql`
          DELETE FROM project_objective
          WHERE project_id = ${id}
        `;
        if (objectives.length > 0) {
          const objectiveInsertQueries = objectives.map((objectiveId) => {
            return sql`
              INSERT INTO project_objective (project_id, objective_id)
              VALUES (${id}, ${objectiveId});
            `;
          });
          await Promise.all(objectiveInsertQueries);
        }
      } catch (error) {
        console.error("Error updating project objectives:", error);
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        status: "failure",
        message: "Update violates unique constraint",
        result: error.detail || error,
      });
    }
    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message: "Referenced entity (portfolio, manager, etc.) does not exist",
        result: error.detail || error,
      });
    }
    return res.status(500).json({
      status: "failure",
      message: "Error updating project",
      result: error.message || error,
    });
  }
};
const deleteProject = async (req, res) => {
  if (!req.body?.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  const { id } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid id format: must be a number",
      result: null,
    });
  }

  try {
    const result = await sql.begin(async (sql) => {
      // First, get all document URLs associated with this project
      const projectDocuments = await sql`
        SELECT file_url FROM project_documents
        WHERE project_id = ${id}
      `;

      // Delete from Supabase storage
      if (projectDocuments && projectDocuments.length > 0) {
        const filePaths = projectDocuments.map((doc) => {
          const fullPath = doc.file_url;

          if (fullPath.includes("/storage/v1/object/public/")) {
            return fullPath.split("/storage/v1/object/public/")[1];
          }

          return fullPath;
        });

        // Delete files from storage
        const { error: storageError } = await supabase.storage
          .from("documents") // Replace with your bucket name
          .remove(filePaths);

        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
          // You might choose to continue even if storage deletion fails
        }
      }

      // 1. Delete deliverables linked to items associated with the project
      await sql`
        DELETE FROM deliverable
        WHERE item_id IN (
          SELECT id FROM item WHERE project_id = ${id}
        )
      `;

      // 2. Delete items linked to the project
      await sql`
        DELETE FROM item
        WHERE project_id = ${id}
      `;

      // 3. Delete objectives linked to the project
      await sql`
        DELETE FROM objective
        WHERE project_id = ${id}
      `;

      // 4. Delete from beneficiary_departments
      await sql`
        DELETE FROM beneficiary_departments
        WHERE project_id = ${id}
      `;

      // 5. Delete from schedule_plan (if exists)
      await sql`
        DELETE FROM schedule_plan_new
        WHERE project_id = ${id}
      `;

      // 6. Delete project documents (if exists)
      await sql`
        DELETE FROM project_documents
        WHERE project_id = ${id}
      `;

      // 7. Finally delete the project
      const [deletedProject] = await sql`
        DELETE FROM project
        WHERE id = ${id}
        RETURNING id
      `;

      if (!deletedProject) {
        throw new Error(`Project with id ${id} not found`);
      }

      return deletedProject;
    });

    return res.status(200).json({
      status: "success",
      message: "Project and associated documents deleted successfully",
      result: { id: result.id },
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message: "Cannot delete project - it's referenced by other records",
        result: error.detail || error.message,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error deleting project",
      result: error.message,
    });
  }
};

// @Description Get project details by id
// @Route site.com/data-management/getproject
const getProjectById = async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  const { id } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    const projectQuery = `
      SELECT * FROM project
      WHERE id = $1
    `;
    const departmentsQuery = `
      SELECT d.id, d.name, d.arabic_name
      FROM department d
      JOIN beneficiary_departments pd ON d.id = pd.department_id
      WHERE pd.project_id = $1
    `;
    const objectivesQuery = `
      SELECT o.id, o.name AS text, o.arabic_name AS arabic_text
      FROM objective o
      JOIN project_objective po ON o.id = po.objective_id
      WHERE po.project_id = $1
    `;

    const projectResult = await sql.unsafe(projectQuery, [id]);
    const departmentsResult = await sql.unsafe(departmentsQuery, [id]);
    const objectivesResult = await sql.unsafe(objectivesQuery, [id]);

    if (!projectResult || projectResult.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Project with id ${id} not found`,
        result: null,
      });
    }

    const projectData = projectResult[0];
    projectData.beneficiary_departments = departmentsResult;
    projectData.objectives = objectivesResult;

    return res.status(200).json({
      status: "success",
      message: "Project retrieved successfully",
      result: projectData,
    });
  } catch (error) {
    console.error("Error retrieving project:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving project",
      result: error.message || error,
    });
  }
};

// @Description Update project approval status by deputy
// @Route site.com/data-management/updateProjectApprovalbyDeputy
const updateProjectApprovalbyDeputy = async (req, res) => {
  console.log("update approval status by deputy:", req.body);
  if (!req.body.approval || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id, approval is required",
      result: null,
    });
  }
  const status = req.body.approval;
  try {
    const result = await sql`
      UPDATE project
      SET approval_status = ${status}
      WHERE id = ${req.body.id}
      RETURNING *;
    `;
    console.log("result", result);
    await createBoqTaskForPM(result);
    res.status(200).json({
      status: "success",
      message: "Successfully updated project approval",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failed",
      message: "Failed to update project approval",
      result: e,
    });
  }
};

// @Description Upsert schedule plan for a project
// @Route site.com/data-management/upsertSchedulePlan
const upsertSchedulePlan = async (req, res) => {
  const { projectId, schedule } = req.body;

  console.log("Schedule plan data:", req.body);

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
      // Validate date format
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

    await sql.begin(async (sql) => {
      // Delete existing schedule plan for the project
      await sql`
        DELETE FROM schedule_plan_new
        WHERE project_id = ${projectId};
      `;

      const insertQueries = schedule.map((plan) => {
        const startDate = new Date(plan.startDate).toISOString().split("T")[0];
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

      const results = await Promise.all(insertQueries);

      return res.status(201).json({
        status: "success",
        message: "Schedule plan upserted successfully",
        result: results,
      });
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
const getPhases = async (req, res) => {
  const { budget } = req.body; // Expecting full numeric budget, e.g., 1500000

  if (budget === undefined || budget === null || isNaN(parseFloat(budget))) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing or invalid: budget must be a number.",
    });
  }

  const projectBudget = parseFloat(budget);

  try {
    // Query to find the matching budget range and get phase durations
    // Ensure min_budget and max_budget in your budget_range table store full numeric values
    const result = await sql`
      SELECT
        p.id AS phase_id,
        p.phase_name,
        p.phase_order,
        p.main_phase,
        pd.duration_days
      FROM
        public.phase p
      INNER JOIN
        public.phase_duration pd ON p.id = pd.phase_id
      INNER JOIN
        public.budget_range br ON pd.range_id = br.id
      WHERE
        ${projectBudget} >= br.min_budget AND (${projectBudget} <= br.max_budget OR br.max_budget IS NULL)
      ORDER BY
        p.phase_order;
    `;
    
    res.status(200).json({
      status: "success",
      message: "Phases and durations retrieved successfully for the budget.",
      data: result,
    });
  } catch (error) {
    console.error("Error in getPhases:", error);
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch phases: ${error.message}`,
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
  if (!req.body || !req.body.phase_id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: phase_id is required",
      result: null,
    });
  }

  const { phase_id } = req.body;

  try {
    if (isNaN(phase_id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid phase_id format: must be a number",
        result: null,
      });
    }

    const result = await sql`
      SELECT id, name, arabic_name 
      FROM project_phase
      WHERE id = ${phase_id}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Phase with id ${phase_id} not found`,
        result: null,
      });
    }

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

// @Description Get all departments
// @Route site.com/data-management/getDepartments
const getDepartments = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, name, arabic_name 
      FROM department
      ORDER BY name;
    `;

    return res.status(200).json({
      status: "success",
      message: "Departments retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving departments:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving departments",
      result: error.message || error,
    });
  }
};

// @Description Get all objectives
// @Route site.com/data-management/getObjectives
const getObjectives = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, text, arabic_text 
      FROM objective
      ORDER BY text;
    `;

    return res.status(200).json({
      status: "success",
      message: "Objectives retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving objectives:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving objectives",
      result: error.message || error,
    });
  }
};
const addBeneficiaryDepartments = async (req, res) => {
  const { projectId, departmentIds } = req.body;

  // Validate input
  if (typeof projectId === "undefined" || !Array.isArray(departmentIds)) {
    return res.status(400).json({
      status: "failure",
      message: "projectId and departmentIds array are required",
      result: null,
    });
  }

  // Convert to numbers
  const numProjectId = Number(projectId);
  const numDeptIds = departmentIds
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));

  if (isNaN(numProjectId) || numDeptIds.length !== departmentIds.length) {
    return res.status(400).json({
      status: "failure",
      message: "All IDs must be valid numbers",
      result: null,
    });
  }

  try {
    // Start transaction
    await sql.begin(async (sql) => {
      // 1. Delete existing departments
      const deleted = await sql`
        DELETE FROM beneficiary_departments 
        WHERE project_id = ${numProjectId}
        RETURNING *
      `;
      console.log(`Deleted ${deleted.length} departments`);

      // 2. Validate department IDs exist (only if we have IDs to insert)
      if (numDeptIds.length > 0) {
        const validDepts = await sql`
          SELECT id FROM department 
          WHERE id IN ${sql(numDeptIds)}
        `;

        const validIds = validDepts.map((row) => row.id);
        const invalidIds = numDeptIds.filter((id) => !validIds.includes(id));

        if (invalidIds.length > 0) {
          throw new Error(`Invalid department IDs: ${invalidIds.join(", ")}`);
        }

        // 3. Insert new departments
        const values = numDeptIds.map((deptId) => ({
          project_id: numProjectId,
          department_id: deptId,
          created_at: new Date(),
        }));

        const inserted = await sql`
          INSERT INTO beneficiary_departments ${sql(values)}
          ON CONFLICT (project_id, department_id) DO NOTHING
          RETURNING *
        `;
        console.log(`Inserted ${inserted.length} departments`);
      }

      return {
        added: numDeptIds.length,
        removed: deleted.length,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Beneficiary departments updated successfully",
      result: null,
    });
  } catch (error) {
    console.error("Database error:", error);

    // Handle specific error cases
    if (error.message.includes("Invalid department IDs")) {
      return res.status(400).json({
        status: "failure",
        message: error.message,
        result: null,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Database operation failed",
      result: error.message,
    });
  }
};

const getBeneficiaryDepartments = async (req, res) => {
  const { projectId } = req.body;

  // Validate the request
  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid request: projectId is required",
      result: null,
    });
  }

  try {
    const result = await sql`
      SELECT department_id
      FROM beneficiary_departments
      WHERE project_id = ${projectId};
    `;

    return res.status(200).json({
      status: "success",
      message: "Beneficiary departments retrieved successfully",
      result: result.map((row) => row.department_id), // Return an array of department IDs
    });
  } catch (error) {
    console.error("Error retrieving beneficiary departments:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving beneficiary departments",
      result: error.message || error,
    });
  }
};

const getProjectApprovalStatus = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "projectId is required",
      result: null,
    });
  }

  try {
    // Query to fetch the approval_status of the given project
    const query = `
      SELECT approval_status 
      FROM project 
      WHERE id = $1;
    `;

    const result = await sql.unsafe(query, [projectId]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Project not found",
        result: null,
      });
    }

    res.json({
      status: "success",
      message: "Project approval status retrieved successfully",
      approval_status: result[0].approval_status,
    });
  } catch (error) {
    console.error("Error fetching project approval status:", error);
    res.status(500).json({
      status: "failure",
      message: "Error fetching project approval status",
      result: error.message,
    });
  }
};

const getProjectBoqApprovalStatus = async (req, res) => {
  const { projectId } = req.body;
  console.log("the project id is " + projectId);
  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "projectId is required",
      result: null,
    });
  }

  try {
    // Query to fetch the approval_status of the given project
    const query = `
      SELECT boq_approval_status 
      FROM project 
      WHERE id = $1;
    `;

    const result = await sql.unsafe(query, [projectId]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Project not found",
        result: null,
      });
    }
    console.log("the boq status");
    console.log(result);
    res.json({
      status: "success",
      message: "Project boq approval status retrieved successfully",
      approval_status: result[0].boq_approval_status,
    });
  } catch (error) {
    console.error("Error fetching project approval status:", error);
    res.status(500).json({
      status: "failure",
      message: "Error fetching project approval status",
      result: error.message,
    });
  }
};

const updateBOQApprovalbyPMO = async (req, res) => {
  console.log("update approval status by deputy:", req.body);
  if (!req.body.approval || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id, approval is required",
      result: null,
    });
  }
  const status = req.body.approval;
  try {
    const result = await sql`
      UPDATE project
      SET boq_approval_status = ${status}
      WHERE id = ${req.body.id}
      RETURNING *;
    `;
    console.log("result", result);
    // await createBoqTaskForPM(result);
    if (status == "Approved") {
      try {
        console.log("hello");
        await createSchedulePlanTaskForPM(req.body.id);
      } catch (e) {
        console.log("there was an error");
        console.log(e);
        console.log(e.message);
        res.status(500).json({
          status: "failed",
          message: "Failed to create a schedule plan task",
          result: e,
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: "Successfully updated project approval",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failed",
      message: "Failed to update project approval",
      result: e,
    });
  }
};

const getProjectDetailsWithVendor = async (req, res) => {
  try {
    const { projectId } = req.body; // Extract project ID from request params

    if (!projectId) {
      return res.status(400).json({
        status: "failure",
        message: "Project ID is required",
      });
    }

    const result = await sql`
      SELECT 
        project.*,
        vendor.name AS vendor_name
      FROM project
      LEFT JOIN vendor ON project.vendor_id = vendor.id
      WHERE project.id = ${projectId};
    `;

    if (result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Project not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Project details with vendor retrieved successfully",
      result: result[0], // Return a single project object
    });
  } catch (error) {
    console.error("Error retrieving project details with vendor:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving project details with vendor",
      result: error.message || error,
    });
  }
};

// @Description Add/Update objectives for a project
// @Route POST /data-management/addProjectObjectives
const addProjectObjectives = async (req, res) => {
  const { projectId, objectiveIds } = req.body;

  // Validate the request
  if (!projectId || !objectiveIds || !Array.isArray(objectiveIds)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid request: projectId and objectiveIds are required",
      result: null,
    });
  }

  try {
    await sql.begin(async (sql) => {
      // Step 1: Delete existing objectives for this project
      await sql`
        DELETE FROM project_objective
        WHERE project_id = ${projectId};
      `;

      // Step 2: Validate objective IDs
      const validObjectives = await sql`
        SELECT id FROM objective WHERE id = ANY(${objectiveIds});
      `;
      const validObjectiveIds = validObjectives.map((row) => row.id);
      const invalidIds = objectiveIds.filter(
        (id) => !validObjectiveIds.includes(id)
      );

      if (invalidIds.length > 0) {
        throw new Error(`Invalid objective IDs: ${invalidIds.join(", ")}`);
      }

      // Step 3: Insert new project objectives
      for (const objectiveId of objectiveIds) {
        await sql`
          INSERT INTO project_objective (project_id, objective_id)
          VALUES (${projectId}, ${objectiveId})
          ON CONFLICT (project_id, objective_id) DO NOTHING;
        `;
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Project objectives updated successfully",
      result: null,
    });
  } catch (error) {
    console.error("Error updating project objectives:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error updating project objectives",
      result: error.message || error,
    });
  }
};

// @Description Get objectives for a specific project
// @Route Post /data-management/getProjectObjectives
const getProjectObjectives = async (req, res) => {
  const { projectId } = req.body;

  try {
    const objectives = await sql`
      SELECT o.id, o.name, o.arabic_name 
      FROM objective o
      JOIN project_objective po ON o.id = po.objective_id
      WHERE po.project_id = ${projectId}
    `;

    return res.status(200).json({
      status: "success",
      message: "Project objectives retrieved successfully",
      result: objectives,
    });
  } catch (error) {
    console.error("Error fetching project objectives:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching project objectives",
      result: error.message || error,
    });
  }
};

// @Description Update objectives for a project
// @Route POST /data-management/updateProjectObjectives
const updateProjectObjectives = async (req, res) => {
  console.log("Update project objectives invoked");
  console.log("Body:", req.body);

  const { id, objective_ids } = req.body;

  if (!id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  if (!Array.isArray(objective_ids)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid objective_ids format: must be an array",
      result: null,
    });
  }

  try {
    await sql.begin(async (trx) => {
      // Clear existing objectives
      await trx`
        DELETE FROM project_objective
        WHERE project_id = ${id}
      `;

      // Insert new objectives if any provided
      if (objective_ids.length > 0) {
        const objectiveData = objective_ids.map((objective_id) => ({
          project_id: id,
          objective_id: objective_id,
        }));

        await trx`
          INSERT INTO project_objective ${sql(objectiveData)}
        `;
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Project objectives updated successfully",
      result: null,
    });
  } catch (error) {
    console.error("Error updating project objectives:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error updating project objectives",
      result: error.message || error,
    });
  }
};

// Get deliverable completion status
const getDeliverableCompletionStatus = async (req, res) => {
  const { deliverableId } = req.body;

  if (!deliverableId) {
    return res.status(400).json({
      status: "failure",
      message: "Deliverable ID is required",
    });
  }

  try {
    const idAsInt = parseInt(deliverableId, 10);
    if (isNaN(idAsInt)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid Deliverable ID format",
      });
    }

    const [deliverable] = await sql`
      SELECT status
      FROM deliverable
      WHERE id = ${idAsInt};
    `;

    if (!deliverable) {
      return res.status(404).json({
        status: "failure",
        message: "Deliverable not found",
      });
    }

    return res.status(200).json({
      status: "success",
      completion_status: deliverable.status,
    });
  } catch (error) {
    console.error("Error fetching deliverable completion status:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching deliverable completion status",
      result: error.message || error,
    });
  }
};

// Update deliverable completion approval status
const updateDeliverableCompletionApproval = async (req, res) => {
  const { deliverableId, completionStatus } = req.body;

  if (!deliverableId || !completionStatus) {
    return res.status(400).json({
      status: "failure",
      message: "Deliverable ID and completion status are required",
    });
  }

  try {
    const idAsInt = parseInt(deliverableId, 10);
    if (isNaN(idAsInt)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid Deliverable ID format",
      });
    }

    const [updatedDeliverable] = await sql`
      UPDATE deliverable
      SET status = ${completionStatus},
          updated_at = NOW()
      WHERE id = ${idAsInt}
      RETURNING id, status;
    `;

    if (!updatedDeliverable) {
      return res.status(404).json({
        status: "failure",
        message: "Deliverable not found",
      });
    }

    await sql`
      INSERT INTO deliverable_progress_history (deliverable_id, status, created_at, description)
      VALUES (${idAsInt}, ${completionStatus}, NOW(), 'Completion status updated via approval')
    `;

    return res.status(200).json({
      status: "success",
      message: "Deliverable completion status updated successfully",
      result: updatedDeliverable,
    });
  } catch (error) {
    console.error("Error updating deliverable completion status:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error updating deliverable completion status",
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
  getPhases,
  getSchedulePlan,
  getProjectPhases,
  getProjectPhase,
  getProjectTypes,
  getDepartments,
  getObjectives,
  addBeneficiaryDepartments,
  getBeneficiaryDepartments,
  getProjectApprovalStatus,
  updateBOQApprovalbyPMO,
  getProjectBoqApprovalStatus,
  getProjectDetailsWithVendor,
  addProjectObjectives,
  getProjectObjectives,
  updateProjectObjectives,
  getDeliverableCompletionStatus,
  updateDeliverableCompletionApproval,
  getProjectTimeline,
};
