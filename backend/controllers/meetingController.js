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


const getProject = async (req, res)=>{
  const {filterType , filterValue} = req.query;
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
module.exports = { getSubFilters , getProject , getMeetingNotes , addMeetingNotes , getMainFilters };


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

const fetchProjectsBasedOnProjectType = async (filterType, filterValue) =>{
  try {
    const result = await sql`
      SELECT 
        p.*, 
        pt.name AS project_type
      FROM 
        project p
      JOIN 
        project_type pt ON p.project_type_id = pt.id
      WHERE 
        pt.name = ${filterValue}
    `;
    
    return {
      status:"success",
      message:"Succefully fetched projects",
      result
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
    const result = await sql `
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
    
    return result;
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
    const result = await sql `
      SELECT
        p.*,
        pr.name AS program_name,
        port.name AS portfolio_name
      FROM
        project p
      JOIN
        program pr ON pr.id = p.program_id
      JOIN
        portfolio port ON port.id = pr.portfolio_id
      WHERE
        port.name = ${filterValue}
    `
    return {
      status:"success",
      message:"Successfully fetched projects",
      result
    }
  }
  catch(e)
  {
    return {
      status:"failure",
      message:"Error fetching project by portfolio",
      result :e.message,
    }
  }
}

const fetchProjectBasedOnProgram = async (filterType, filterValue) =>{
  try{
    const result = await sql `
      SELECT
        p.*,
        pr.name AS program_name
      FROM
        project p 
      JOIN 
        program pr ON p.program_id = pr.program.id
      WHERE
        pr.name = ${filterValue} 
    `
    return {
      status:"success",
      message:"Successfully fetched projects",
      result 
    }
  }
  catch(e)
  {
    return {
      status:"failure",
      message:"Error fetching project by portfolio",
      result :e.message,
    }
  }
}

const fetchProjectBasedOnVendor = async (filterType, filterValue) =>{
  try{
    const result = await sql `
      SELECT 
        p.*,
        v.name AS vendor_name
      FROM 
        project p
      JOIN
        vendor v ON p.vendor_id = v.id
      WHERE
        v.name = ${filterValue}
    `
    return {
      status:"success",
      message:"Successfully fetched projects",
      result
    }
  }
  catch(e)
  {
    return {
      status:"failure",
      message:"Error fetching project by portfolio",
      result :e.message,
    }
  }
}
