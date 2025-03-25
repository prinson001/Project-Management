const sql = require("../database/db");

const createProjectCreationTaskForDeputy = async (req, res) => {
  let result = null;
  let { projectId } = req.body;
  console.log("Deputy project Id", projectId);
  try {
    // Get the activity duration for "Approve project creation"
    result =
      await sql`SELECT * FROM activity_duration WHERE activity_name = 'Approve project creation';`;

    if (result.length === 0) {
      console.log("No activity duration found for 'Approve project creation'.");
      return;
    }

    const activityDuration = result[0];

    // Get the user whose role is "deputy"
    const deputies = await sql`
      SELECT u.* 
      FROM users u
      JOIN role r ON u.role_id = r.id
      WHERE r.name = 'DEPUTY';
    `;

    if (deputies.length === 0) {
      console.log("No deputy found.");
      return;
    }

    const deputy = deputies[0]; // Assigning to the first deputy found
    console.log("Found Deputy", deputy);

    // Calculate due date (today's date + activity duration in days)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration)); // Add duration days
    console.log("deputy id " + deputy.id);
    console.log("due date " + dueDate);
    console.log("project id " + projectId);
    // Insert a new task for the deputy
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id)
      VALUES (
        'Approve Project Creation', 
        'Open', 
        ${dueDate.toISOString().split("T")[0]}, 
        ${Number(deputy.id)}, 
        'project', 
        ${Number(projectId)}
      );
    `;

    console.log(
      `Task created for Deputy (ID: ${deputy.id}) with due date ${
        dueDate.toISOString().split("T")[0]
      }`
    );
    return res.status(200).json({
      status: "success",
      message: "Approve Project Sent Successfully",
      result: null,
    });
  } catch (e) {
    console.error("Error creating project creation task for deputy:", e);
  }
};

const createBoqTaskForPM = async (project) => {
  try {
    // Ensure project is valid
    if (!project || project.length === 0) {
      console.log("Invalid project data.");
      return;
    }

    const projectData = project[0];

    // Fetch the activity duration for "Upload BOQ"
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Upload BOQ';
    `;

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Upload BOQ'.");
      return;
    }

    const activityDuration = activityDurationResult[0];

    // Calculate due date (today + activity duration days)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration)); // Add duration days

    // Insert a new task for the project manager
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id)
      VALUES (
        'Upload BOQ', 
        'Open', 
        ${dueDate.toISOString().split("T")[0]}, 
        ${projectData.project_manager_id}, 
        'project', 
        ${projectData.id}
      );
    `;

    console.log(
      `Task created for Project Manager (ID: ${
        projectData.project_manager_id
      }) with due date ${dueDate.toISOString().split("T")[0]}`
    );
  } catch (e) {
    console.error("Error creating BOQ task for Project Manager:", e);
  }
};

const createSchedulePlanTaskForPM = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log("project id in schedule plan", projectId);
    // Fetch project data
    const projectResult = await sql`
      SELECT * FROM project WHERE id = ${projectId};
    `;

    if (projectResult.length === 0) {
      console.log("Invalid project data.");
      return res.status(400).json({
        status: "error",
        message: "Project not found",
      });
    }

    const projectData = projectResult[0];

    // Fetch the activity duration
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Upload Schedule Plan';
    `;

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Upload Schedule Plan'.");
      return res.status(400).json({
        status: "error",
        message: "Activity duration not found",
      });
    }

    const activityDuration = activityDurationResult[0];

    // Calculate due date
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration));

    // Insert the task
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id)
      VALUES (
        'Upload Schedule Plan', 
        'Open', 
        ${dueDate.toISOString().split("T")[0]}, 
        ${projectData.project_manager_id}, 
        'project', 
        ${projectData.id}
      );
    `;

    console.log(
      `Task created for Project Manager (ID: ${
        projectData.project_manager_id
      }) with due date ${dueDate.toISOString().split("T")[0]}`
    );

    return res.status(200).json({
      status: "success",
      message: "Schedule plan task created successfully",
    });
  } catch (e) {
    console.error("Error creating SchedulePlan task for Project Manager:", e);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
  createSchedulePlanTaskForPM,
};
