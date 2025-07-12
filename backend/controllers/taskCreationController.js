const sql = require("../database/db");

const createProjectCreationTaskForDeputy = async (req, res) => {
  let result = null;
  let { projectId } = req.body;
  console.log("Deputy project Id", projectId);
  try {
    // First, check if project exists and get project details with phase info
    const projectCheck = await sql`
      SELECT p.project_documents_uploaded, p.project_schedule_uploaded, p.current_phase_id,
             ph.name as phase_name
      FROM project p
      JOIN project_phase ph ON p.current_phase_id = ph.id
      WHERE p.id = ${projectId};
    `;

    if (projectCheck.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Project not found",
        result: null,
      });
    }

    const project = projectCheck[0];
    
    // Always require schedule plan to be uploaded
    if (!project.project_schedule_uploaded) {
      return res.status(400).json({
        status: "failure",
        message: "Cannot send for approval: Schedule plan must be uploaded first",
        result: {
          project_documents_uploaded: project.project_documents_uploaded,
          project_schedule_uploaded: project.project_schedule_uploaded,
        },
      });
    }

    // Check if document templates exist for the current phase
    const documentTemplates = await sql`
      SELECT * FROM document_template 
      WHERE LOWER(phase::text) LIKE ${'%' + project.phase_name.toLowerCase() + '%'}
    `;

    const hasDocumentTemplates = documentTemplates.length > 0;
    console.log(`Document templates found for phase ${project.phase_name}:`, hasDocumentTemplates);

    // Only require documents if templates exist for this phase
    if (hasDocumentTemplates && !project.project_documents_uploaded) {
      return res.status(400).json({
        status: "failure",
        message: "Cannot send for approval: Project documents must be uploaded for this phase",
        result: {
          project_documents_uploaded: project.project_documents_uploaded,
          project_schedule_uploaded: project.project_schedule_uploaded,
          has_document_templates: hasDocumentTemplates,
        },
      });
    }

    // Get the activity duration for "Approve project creation"
    result =
      await sql`SELECT * FROM activity_duration WHERE activity_name = 'Approve project creation';`;

    if (result.length === 0) {
      console.log("No activity duration found for 'Approve project creation'.");
      return res.status(500).json({
        status: "failure",
        message: "Activity duration not configured for project approval",
        result: null,
      });
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
      return res.status(500).json({
        status: "failure",
        message: "No deputy user found in the system",
        result: null,
      });
    }

    const deputy = deputies[0]; // Assigning to the first deputy found
    console.log("Found Deputy", deputy);

    // Check if an approval task already exists for this project
    const existingTask = await sql`
      SELECT * FROM tasks 
      WHERE title = 'Approve Project Creation' 
        AND related_entity_type = 'project' 
        AND related_entity_id = ${Number(projectId)}
        AND status = 'Open';
    `;

    if (existingTask.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Project approval task already exists and is pending",
        result: {
          task_id: existingTask[0].id,
          already_sent: true,
        },
      });
    }

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
    return res.status(500).json({
      status: "failure",
      message: "Error creating approval task for deputy",
      result: e.message || e,
    });
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

const createSchedulePlanTaskForPM = async (projectId) => {
  try {
    console.log("project id in schedule plan", projectId);
    // Fetch project data
    const projectResult = await sql`
      SELECT * FROM project WHERE id = ${projectId};
    `;

    if (projectResult.length === 0) {
      console.log("Invalid project data.");
      return;
      // return res.status(400).json({
      //   status: "error",
      //   message: "Project not found",
      // });
    }

    const projectData = projectResult[0];

    // Fetch the activity duration
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Upload Schedule Plan';
    `;

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Upload Schedule Plan'.");
      return;
      // return res.status(400).json({
      //   status: "error",
      //   message: "Activity duration not found",
      // });
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

    // return res.status(200).json({
    //   status: "success",
    //   message: "Schedule plan task created successfully",
    // });
  } catch (e) {
    console.error("Error creating SchedulePlan task for Project Manager:", e);
    // return res.status(500).json({
    //   status: "error",
    //   message: "Internal server error",
    // });
  }
};

const createBoqApprovalTaskForPMO = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log("Project ID for BOQ approval:", projectId);

    // Fetch the activity duration for "Approve Uploaded BOQ"
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Approve Uploaded BOQ';
    `;

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Approve Uploaded BOQ'.");
      return res.status(400).json({
        status: "error",
        message: "Activity duration not found",
      });
    }

    const activityDuration = activityDurationResult[0];

    // Fetch the user with role "PMO"
    const pmos = await sql`
      SELECT u.* 
      FROM users u
      JOIN role r ON u.role_id = r.id
      WHERE r.name = 'PMO';
    `;

    if (pmos.length === 0) {
      console.log("No PMO found.");
      return res.status(400).json({
        status: "error",
        message: "No PMO found",
      });
    }

    const pmo = pmos[0]; // Assigning to the first PMO found
    console.log("Found PMO:", pmo);

    // Calculate due date
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration));

    // Insert a new task for the PMO
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id)
      VALUES (
        'Approve Uploaded BOQ',
        'Open',
        ${dueDate.toISOString().split("T")[0]},
        ${pmo.id},
        'project',
        ${projectId}
      );
    `;

    // Update project table to set boq_approval_status to 'Waiting on PMO'
    await sql`
      UPDATE project
      SET boq_approval_status = 'Waiting On PMO'
      WHERE id = ${projectId};
    `;

    console.log(
      `Task created for PMO (ID: ${pmo.id}) with due date ${
        dueDate.toISOString().split("T")[0]
      }`
    );

    return res.status(200).json({
      status: "success",
      message:
        "BOQ approval task created successfully and project status updated",
    });
  } catch (e) {
    console.error("Error creating BOQ approval task for PMO:", e);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const createDeliverableInvoiceApprovalTaskForPMO = async (deliverableId) => {
  try {
    console.log("Creating invoice approval task for deliverable:", deliverableId);

    // First, get the project ID from the deliverable
    const deliverableResult = await sql`
      SELECT d.*, i.project_id 
      FROM deliverable d 
      JOIN item i ON d.item_id = i.id 
      WHERE d.id = ${deliverableId}
    `;

    if (deliverableResult.length === 0) {
      console.log("Deliverable not found.");
      return;
    }

    const deliverable = deliverableResult[0];
    const projectId = deliverable.project_id;

    // Get the latest invoice for this deliverable to include in task title/description
    const latestInvoiceResult = await sql`
      SELECT * FROM deliverable_payment_history 
      WHERE deliverable_id = ${deliverableId} 
        AND document_type = 'INVOICE'
      ORDER BY uploaded_at DESC 
      LIMIT 1
    `;

    let invoiceInfo = "";
    let taskTitle = "Approve Uploaded Invoice";
    
    if (latestInvoiceResult.length > 0) {
      const latestInvoice = latestInvoiceResult[0];
      const amount = latestInvoice.invoice_amount || 0;
      const percentage = latestInvoice.related_payment_percentage || 0;
      invoiceInfo = ` - Amount: ${amount} SAR (${percentage}%)`;
      taskTitle = `Approve Uploaded Invoice${invoiceInfo}`;
    }

    // Check if an identical task already exists (same deliverable, same amount/percentage, and still open)
    // This prevents creating duplicate tasks for the exact same invoice upload
    const existingTask = await sql`
      SELECT * FROM tasks 
      WHERE title = ${taskTitle}
        AND related_entity_type = 'deliverable' 
        AND related_entity_id = ${projectId}
        AND description LIKE ${`%deliverable_id:${deliverableId}%`}
        AND status = 'Open'
    `;

    if (existingTask.length > 0) {
      console.log("Identical invoice approval task already exists for this deliverable and amount.");
      return;
    }

    // Fetch the activity duration for "Approve Uploaded Invoice"
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Approve Uploaded Invoice';
    `;

    let activityDuration;
    let defaultDuration = 3; // 3 days default

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Approve Uploaded Invoice', using default.");
      activityDuration = { duration: defaultDuration };
    } else {
      activityDuration = activityDurationResult[0];
    }
      
    // Get PMO user
    const pmos = await sql`
      SELECT u.* 
      FROM users u
      JOIN role r ON u.role_id = r.id
      WHERE r.name = 'PMO';
    `;

    if (pmos.length === 0) {
      console.log("No PMO found.");
      return;
    }

    const pmo = pmos[0];

    // Calculate due date
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration));

    // Create detailed description with invoice information
    const description = `Invoice approval required for deliverable: ${deliverable.name}${invoiceInfo} (deliverable_id:${deliverableId})`;

    // Insert task with project ID as related_entity_id but store deliverable info in description
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id, description)
      VALUES (
        ${taskTitle},
        'Open',
        ${dueDate.toISOString().split("T")[0]},
        ${pmo.id},
        'deliverable',
        ${projectId},
        ${description}
      );
    `;
      
    console.log(`Invoice approval task created for PMO (ID: ${pmo.id}) with due date ${dueDate.toISOString().split("T")[0]}`);
    console.log(`Task title: ${taskTitle}`);

  } catch (e) {
    console.error("Error creating deliverable invoice approval task for PMO:", e);
  }
};

const createDeliverableCompletionApprovalTaskForPMO = async (deliverableId) => {
  try {
    console.log("Creating deliverable completion approval task for deliverable:", deliverableId);

    // First, get the project ID from the deliverable
    const deliverableResult = await sql`
      SELECT d.*, i.project_id 
      FROM deliverable d 
      JOIN item i ON d.item_id = i.id 
      WHERE d.id = ${deliverableId}
    `;

    if (deliverableResult.length === 0) {
      console.log("Deliverable not found.");
      return;
    }

    const deliverable = deliverableResult[0];
    const projectId = deliverable.project_id;

    // Check if task already exists to avoid duplicates
    const existingTask = await sql`
      SELECT * FROM tasks 
      WHERE title = 'Approve Deliverable Completion' 
        AND related_entity_type = 'deliverable' 
        AND related_entity_id = ${projectId}
        AND description LIKE ${`%deliverable_id:${deliverableId}%`}
        AND status = 'Open'
    `;

    if (existingTask.length > 0) {
      console.log("Deliverable completion approval task already exists.");
      return;
    }

    // Fetch the activity duration for "Approve Deliverable Completion"
    const activityDurationResult = await sql`
      SELECT * FROM activity_duration WHERE activity_name = 'Approve Deliverable Completion';
    `;

    let activityDuration;
    let defaultDuration = 5; // 5 days default

    if (activityDurationResult.length === 0) {
      console.log("No activity duration found for 'Approve Deliverable Completion', using default.");
      activityDuration = { duration: defaultDuration };
    } else {
      activityDuration = activityDurationResult[0];
    }

    // Fetch the user with role "PMO"
    const pmos = await sql`
      SELECT u.* 
      FROM users u
      JOIN role r ON u.role_id = r.id
      WHERE r.name = 'PMO';
    `;

    if (pmos.length === 0) {
      console.log("No PMO found.");
      return;
    }

    const pmo = pmos[0];
    console.log("Found PMO:", pmo);

    // Calculate due date
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + Number(activityDuration.duration));

    // Insert task with project ID as related_entity_id but store deliverable info in description
    await sql`
      INSERT INTO tasks (title, status, due_date, assigned_to, related_entity_type, related_entity_id, description)
      VALUES (
        'Approve Deliverable Completion',
        'Open',
        ${dueDate.toISOString().split("T")[0]},
        ${pmo.id},
        'deliverable',
        ${projectId},
        ${`Completion approval required for deliverable: ${deliverable.name} (deliverable_id:${deliverableId})`}
      );
    `;

    console.log(
      `Deliverable completion approval task created for PMO (ID: ${pmo.id}) with due date ${
        dueDate.toISOString().split("T")[0]
      }`
    );

  } catch (e) {
    console.error("Error creating deliverable completion approval task for PMO:", e);
  }
};

const checkProjectApprovalTaskExists = async (req, res) => {
  const { projectId } = req.body;
  
  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "Project ID is required",
      result: null,
    });
  }

  try {
    // Check if an approval task already exists for this project
    const existingTask = await sql`
      SELECT t.*, 
             COALESCE(u.first_name || ' ' || u.family_name, u.first_name, u.family_name, 'Unknown User') as assigned_to_name 
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.title = 'Approve Project Creation' 
        AND t.related_entity_type = 'project' 
        AND t.related_entity_id = ${Number(projectId)}
        AND t.status = 'Open'
      ORDER BY t.created_date DESC
      LIMIT 1;
    `;

    return res.status(200).json({
      status: "success",
      message: "Task check completed",
      result: {
        exists: existingTask.length > 0,
        task: existingTask.length > 0 ? existingTask[0] : null,
      },
    });
  } catch (error) {
    console.error("Error checking project approval task:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error checking approval task status",
      result: error.message || error,
    });
  }
};

module.exports = {
  createProjectCreationTaskForDeputy,
  createBoqTaskForPM,
  createSchedulePlanTaskForPM,
  createBoqApprovalTaskForPMO,
  createDeliverableInvoiceApprovalTaskForPMO,
  createDeliverableCompletionApprovalTaskForPMO,
  checkProjectApprovalTaskExists,
};
