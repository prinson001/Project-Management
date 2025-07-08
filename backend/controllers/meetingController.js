const sql = require("../database/db");

// Controller

const getMainFilters = async (req,res)=>{
  try{
    const result = [
      {name:'projectType',icon:'Star'},
      {name:'projectPhase',icon:'GitBranch'},
      {name:'portfolio',icon:'Briefcase'},
      {name:'program',icon:'Code'},
      {name:'vendor',icon:'Building'}
    ];
    res.status(200).json({
      status:"success",
      message:"Successfully retreived main Filters",
      result 
    })
  }
  catch(e)
  {
    res.status(500).json({
      status:"Failure",
      message:"Failed to retreive main filter",
      result : e
    })
  }
}
const getSubFilters = async (req, res) => {
  const { type } = req.params;

  if (!type) {
    return res.status(400).json({
      status: "Failure",
      message: "Filter 'type' should be provided",
    });
  }

  try {
    let result;
    switch (type) {
      case 'projectType':
        result = await getProjectTypes();
        break;
      case 'projectPhase':
        result = await getProjectPhases();
        break;
      case 'portfolio':
        result = await getPortfolioNames();
        break;
      case 'program':
        result = await getProgramNames();
        break;
      case 'vendor':
        result = await getVendors();
        break;
    //   case 'buisnessOwner':
    //     result = await getBuisnessOwners();
    //     break;
    //   case 'projectBudgetStatus':
    //     result = await getProjectBudgetStatus();
    //     break;
      default:
        return res.status(400).json({ status: "Failure", message: "Invalid filter type" });
    }

    res.status(200).json({
      status: "Success",
      message: `List of ${type}`,
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "Failure",
      message: `Error fetching data for ${type}`,
      result: e.message,
    });
  }
};


const getProjects = async (req, res)=>{
  const {filterType , filterValue} = req.query;
  console.log("filter type :"+filterType);
  console.log("filter Value :"+filterValue);
  try{
    let result ;
    switch(filterType)
    {
      case 'projectType':
          result = await fetchProjectsBasedOnProjectType(filterType , filterValue);
          break;
        case 'projectPhase':
          result = await fetchProjectsBasedOnProjectPhase(filterType,filterValue);
          break;
        case 'portfolio':
          result = await fetchProjectsBasedOnPortfolio(filterType,filterValue);
          break;
        case 'program':
          result = await fetchProjectBasedOnProgram(filterType,filterValue);
          break;
        case 'vendor':
          result = await fetchProjectBasedOnVendor(filterType,filterValue);
          break;
    }

    return res.status(200).json(result);
  }
  catch(e)
  {
    res.status(500).json({
      status:"failure",
      message:"Failed to fetch projects",
      result:e.message
    })
  }
  
}

const createMeeting = async (req,res)=>{
  const {name , user_id} = req.body;
  const now = new Date();
  const status = 'in_progress'
  try{
    const result = await sql `
      INSERT INTO meeting(name , started_by , started_at , status)
      VALUES(${name},${user_id},${now},${status})
      RETURNING *
    `
    res.status(201).json({
      status:"success",
      message:"Successfully created meeting",
      result
    })
  }
  catch(e)
  {
    res.status(500).json({
      status:"failure",
      message:"Failed to create a meeting",
      result :e
    })
  }
}
const getMeetingNotes= async (req,res)=>{
  const {startDate , endDate , projectId} = req.query;

  try{
    const result = await sql `
      SELECT 
        m.started_at
        mn.*
      FROM 
        meeting m 
      JOIN 
        meeting_notes mn ON mn.meeting_id = m.id
      WHERE
        m.started_at::date > ${startDate} AND
        m.started_at::date < ${endDate} AND
        mn.project_id = ${projectId}
    `;
    res.status(200).json({
      status:"success",
      message:"Successfully fetched meeting notes",
      result
    })
  }
  catch(e)
  {
    res.status(500).json({
      status:"failure",
      message:"failed to fetch meeting notes",
      result :e
    })
  }
}
const addMeetingNotes = async(req,res)=>{
  const {notes , project_id , meeting_id} =  req.body;

  try{
    const result = await sql `
      INSERT INTO meeting_notes(meeting_id , project_id , notes)
      VALUES(${meeting_id},${project_id},${notes})
      RETURNING *
    `
    res.status(201).json({
      status:"success",
      message:"Notes added successfully",
      result
    })
  }
  catch(e)
  {
    res.status(500).json({
      status:"failure",
      message:"Error in inserting meeting notes",
      result:e
    })
  }
}
const getPreviousMeetingNotes = async (req, res) => {
  const { projectId } = req.params;
  const { max = 5 } = req.query;

  try {
    const result = await sql`
      SELECT 
        m.id AS meeting_id,
        m.name,
        m.started_at,
        COALESCE(
          json_agg(
            json_build_object(
              'notes', n.notes
            )
          ) FILTER (WHERE n.id IS NOT NULL AND n.project_id = ${projectId}),
          '[]'
        ) AS meeting_notes
      FROM (
        SELECT *
        FROM meeting
        ORDER BY started_at DESC
        LIMIT ${max}
      ) m
      LEFT JOIN meeting_notes n ON n.meeting_id = m.id
      GROUP BY m.id, m.name, m.started_at
      ORDER BY m.started_at DESC;
    `;
    console.log(result)
    res.status(200).json({
      status: "success",
      message: "Latest 5 meetings with notes (if any) for the project",
      result,
    });
  } catch (e) {
    console.error("Error fetching meeting notes:", e);
    res.status(500).json({
      status: "failure",
      message: "Failed to get previous meeting notes",
      result: e,
    });
  }
};


module.exports = { getSubFilters , getProjects , getMeetingNotes , addMeetingNotes , getMainFilters , createMeeting , getPreviousMeetingNotes};


// --- Helper functions ---

const getProjectTypes = async () => {
  return await sql`SELECT name FROM project_type`;
};

const getProjectPhases = async () => {
  return await sql`SELECT name FROM project_phase`;
};

const getPortfolioNames = async () => {
  return await sql`SELECT name FROM portfolio`;
};

const getProgramNames = async () => {
  return await sql`SELECT name FROM program`;
};

const getVendors = async () => {
  return await sql`SELECT name FROM vendor`;
};

const getBuisnessOwners = async () => {
  return await sql`SELECT name FROM business_owner`;
};

const getProjectBudgetStatus = async () => {
  return await sql`SELECT status FROM project_budget_status`;
};

const calculateProjectProgress = async (project) => {
  try {
    // Get all deliverables for the project with their status and scope percentage
    const deliverables = await sql`
      SELECT 
        d.*,
        COALESCE(dp.scope_percentage, 0) as scope_pct,
        COALESCE(dp.progress_percentage, 0) as progress_percentage,
        d.status as deliverable_status,
        d.start_date as deliverable_start_date,
        d.end_date as deliverable_end_date,
        dp.status as progress_status
      FROM deliverable d
      JOIN item i ON d.item_id = i.id
      LEFT JOIN deliverable_progress dp ON d.id = dp.deliverable_id
      WHERE i.project_id = ${project.id}
    `;

    const now = new Date();
    
    // Calculate overall progress based on average of all deliverables
    let totalProgress = 0;
    let completedDeliverables = 0;
    let totalDeliverables = deliverables.length;
    let onTimeDeliverables = 0;
    let delayedDeliverables = 0;

    // Count completed and on-time deliverables, sum up progress
    deliverables.forEach((deliverable) => {
      let progress = 0;
      const status = (deliverable.deliverable_status || deliverable.status || deliverable.progress_status || '').toUpperCase();
      const scopePct = parseFloat(deliverable.scope_pct) || 0;
      const progressPct = parseFloat(deliverable.progress_percentage) || 0;
      
      // Use the highest available progress value
      const maxProgress = Math.max(scopePct, progressPct);
      
      // More flexible status checking with fallback to progress percentage
      if (status === 'COMPLETED' || status === 'COMPLETE' || maxProgress === 100) {
        progress = 100;
        completedDeliverables++;
        // Check if completed on time
        if (deliverable.deliverable_end_date && new Date(deliverable.deliverable_end_date) >= now) {
          onTimeDeliverables++;
        } else {
          delayedDeliverables++;
        }
      } else if (status === 'IN_PROGRESS' || status === 'IN PROGRESS' || status === 'INPROGRESS' || maxProgress > 0) {
        progress = Math.min(100, Math.max(0, maxProgress));
        // Check if in progress but past due
        if (deliverable.deliverable_end_date && new Date(deliverable.deliverable_end_date) < now) {
          delayedDeliverables++;
        }
      } else if ((status === 'NOT_STARTED' || status === 'NOT STARTED' || status === 'NOTSTARTED' || !status) && 
                deliverable.deliverable_start_date && 
                new Date(deliverable.deliverable_start_date) < now) {
        // Not started but should have started
        delayedDeliverables++;
        progress = 0;
      } else {
        progress = maxProgress; // Use the progress percentage even if status is unclear
      }
      
      totalProgress += progress;
    });

    // Calculate overall progress as simple average of all deliverables
    const overallProgress = totalDeliverables > 0 
      ? Math.round(totalProgress / totalDeliverables) 
      : 0;

    // Calculate time-based progress if project has start and end dates
    let timeProgress = 0;
    let projectStart = null;
    let projectEnd = null;
    
    if (project.execution_start_date && project.execution_enddate) {
      projectStart = new Date(project.execution_start_date);
      projectEnd = new Date(project.execution_enddate);
    } else if (project.execution_start_date && project.execution_duration) {
      projectStart = new Date(project.execution_start_date);
      // Parse execution_duration to calculate end date
      let durationDays = 0;
      if (typeof project.execution_duration === 'string') {
        const durationStr = project.execution_duration.toLowerCase();
        if (durationStr.includes('week')) {
          const weeks = parseInt(durationStr, 10) || 0;
          durationDays = weeks * 7;
        } else if (durationStr.includes('month')) {
          const months = parseInt(durationStr, 10) || 0;
          durationDays = months * 30;
        } else if (durationStr.includes('day')) {
          durationDays = parseInt(durationStr, 10) || 0;
        } else {
          // Assume it's in weeks if no unit specified
          durationDays = (parseInt(durationStr, 10) || 0) * 7;
        }
      } else if (typeof project.execution_duration === 'number') {
        // Assume days if it's a number
        durationDays = project.execution_duration;
      }
      
      if (durationDays > 0) {
        projectEnd = new Date(projectStart.getTime() + durationDays * 24 * 60 * 60 * 1000);
      }
    } else if (project.start_date && project.end_date) {
      projectStart = new Date(project.start_date);
      projectEnd = new Date(project.end_date);
    }
    
    if (projectStart && projectEnd) {
      const totalDuration = projectEnd - projectStart;
      const elapsedDuration = now - projectStart;
      
      if (totalDuration > 0) {
        timeProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
      }
    }

    // Calculate health status with multiple factors
    let healthScore = 0;
    const maxScore = 10;
    
    // 1. Progress vs Time (40% weight)
    const progressVsTime = overallProgress / Math.max(timeProgress, 1);
    healthScore += Math.min(4, progressVsTime * 4);
    
    // 2. Deliverable on-time rate (30% weight)
    const onTimeRate = totalDeliverables > 0 
      ? (onTimeDeliverables / totalDeliverables) * 3 
      : 3; // Default to full score if no deliverables
    healthScore += onTimeDeliverables === 0 ? 3 : onTimeRate;
    
    // 3. Additional scoring for overall progress (30% weight)
    healthScore += (overallProgress / 100) * 3;
    
    // Determine health status based on score (0-10)
    let health;
    if (healthScore >= 8) {
      health = 'good';
    } else if (healthScore >= 5) {
      health = 'warning';
    } else {
      health = 'danger';
    }

    return {
      ...project,
      // Progress metrics
      progress: overallProgress,
      timeProgress: Math.round(timeProgress),
      health,
      healthScore: Math.round((healthScore / maxScore) * 100), // Convert to percentage
      
      // Deliverable metrics
      completedDeliverables,
      totalDeliverables,
      onTimeDeliverables,
      delayedDeliverables,
      
      // Timestamps
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error calculating progress for project ${project.id}:`, error);
    return {
      ...project,
      progress: 0,
      timeProgress: 0,
      health: 'unknown',
      completedDeliverables: 0,
      totalDeliverables: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

const fetchProjectsBasedOnProjectType = async (filterType, filterValue) =>{
  try {
    const projects = await sql`
      SELECT 
        p.*, 
        pt.name AS project_type,
        pp.name AS phase_name
      FROM 
        project p
      JOIN 
        project_type pt ON p.project_type_id = pt.id
      JOIN
        project_phase pp ON pp.id = p.current_phase_id
      WHERE 
        pt.name = ${filterValue}
    `;

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(project => calculateProjectProgress(project))
    );

    console.log("projects with progress:", projectsWithProgress);
    return {
      status:"success",
      message:"Successfully fetched projects",
      result: projectsWithProgress
    };
  } catch (e) {
    return {
      status: "failure",
      message: "Error fetching projects by project type",
      result:e.message
    };
  }
}

const fetchProjectsBasedOnProjectPhase = async (filterType, filterValue) =>{
  try{
    const projects = await sql `
      SELECT
        p.*,
        pp.name AS project_phase
      FROM
        project p
      JOIN
        project_phase pp ON pp.id = p.current_phase_id
      
      WHERE
        pp.name = ${filterValue}
    `;

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(project => calculateProjectProgress(project))
    );

    console.log("projects with progress:", projectsWithProgress);
    return {
      status:"success",
      message:"Successfully fetched projects",
      result: projectsWithProgress
    };
  }
  catch(e)
  {
    return{
      status:"failure",
      message:"Error fetching project by project phase",
      result:e.message
    }
  }
}

const fetchProjectsBasedOnPortfolio = async (filterType, filterValue) =>{
  try{
    const projects = await sql `
      SELECT
        p.*,
        pr.name AS program_name,
        port.name AS portfolio_names
      FROM
        project p
      JOIN
        program pr ON pr.id = p.program_id
      JOIN
        portfolio port ON port.id = pr.portfolio_id
      WHERE
        port.name = ${filterValue}
    `

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(project => calculateProjectProgress(project))
    );

    console.log("projects with progress:", projectsWithProgress);
    return {
      status:"success",
      message:"Successfully fetched projects",
      result: projectsWithProgress
    }
  }
  catch(e)
  {
    console.log(e);
    return {
      status:"failure",
      message:"Error fetching project by portfolio",
      result :e.message,
    }
  }
}

const fetchProjectBasedOnProgram = async (filterType, filterValue) =>{
  try{
    const projects = await sql `
      SELECT
        p.*,
        pr.name AS program_name
      FROM
        project p 
      JOIN 
        program pr ON pr.id = p.program_id
      WHERE
        pr.name = ${filterValue} 
    `

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(project => calculateProjectProgress(project))
    );

    console.log("projects with progress:", projectsWithProgress);
    return {
      status:"success",
      message:"Successfully fetched projects",
      result: projectsWithProgress
    }
  }
  catch(e)
  {
    console.log(e);
    return {
      status:"failure",
      message:"Error fetching project by program",
      result :e.message,
    }
  }
}

const fetchProjectBasedOnVendor = async (filterType, filterValue) =>{
  try{
    const projects = await sql `
      SELECT 
        p.*,
        v.name AS vendor_name,
        pp.name AS phase_name
      FROM 
        project p
      JOIN
        vendor v ON p.vendor_id = v.id
      JOIN
        project_phase pp ON pp.id = p.current_phase_id
      WHERE
        v.name = ${filterValue}
    `

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(project => calculateProjectProgress(project))
    );

    console.log("projects with progress:", projectsWithProgress);
    return {
      status:"success",
      message:"Successfully fetched projects",
      result: projectsWithProgress
    }
  }
  catch(e)
  {
    console.log(e);
    return {
      status:"failure",
      message:"Error fetching project by vendor",
      result :e.message,
    }
  }
}
