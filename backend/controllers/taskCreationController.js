const sql = require("../database/db");

const createProjectCreationTaskForDeputy = async (projectId) => {
  let result = null;

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
    console.log(deputy);

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
        'Project Approval Required', 
        'Open', 
        ${dueDate.toISOString().split("T")[0]}, 
        ${Number(deputy.id)}, 
        'project', 
        ${Number(projectId)}
      );
    `;

    console.log(
      `Task created for Deputy ${deputy} (ID: ${deputy.id}) with due date ${
        dueDate.toISOString().split("T")[0]
      }`
    );
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

const createSchedulePlanTaskForPM = async (project) => {
  //logic to create schedule plan task for pm
  try {
    // Ensure project is valid
    if (!project || project.length === 0) {
      console.log("Invalid project data.");
      return;
    }

    const projectData = project[0];

    // Fetch the activity duration for "Upload BOQ"
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Upload SchedulePlan';
    `;

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Upload SchedulePlan'.");
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
  } catch (e) {
    console.error("Error creating SchedulePlan  task for Project Manager:", e);
  }
};

module.exports = {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
  createSchedulePlanTaskForPM,
};
