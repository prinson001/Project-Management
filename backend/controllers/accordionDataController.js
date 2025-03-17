const sql = require("../database/db");
const getInitiativeWithAllRelatedData = async (req, res) => {
  let { initiativeId } = req.body;

  if (!initiativeId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: initiativeId",
      result: null,
    });
  }

  try {
    // Get initiative details
    const initiative = await sql`
        SELECT * FROM initiative WHERE id = ${initiativeId}`;

    if (initiative.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Initiative not found",
        result: null,
      });
    }

    // Get all portfolios linked to this initiative
    const portfolios = await sql`
        SELECT * FROM portfolio WHERE initiative_id = ${initiativeId}`;

    // Get all program ids linked to these portfolios
    const portfolioIds = portfolios.map((portfolio) => portfolio.id);

    // If no portfolios found, return just the initiative
    if (portfolioIds.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Initiative retrieved successfully with no linked portfolios",
        result: {
          initiative: initiative[0],
          portfolios: [],
          programs: [],
          projects: [],
        },
      });
    }

    const programs = await sql`
        SELECT * FROM program
        WHERE portfolio_id IN ${sql(portfolioIds)}`;

    // Get all project ids linked to these programs
    const programIds = programs.map((program) => program.id);

    // If no programs found, return initiative and portfolios
    if (programIds.length === 0) {
      return res.status(200).json({
        status: "success",
        message:
          "Initiative retrieved successfully with portfolios but no programs",
        result: {
          initiative: initiative[0],
          portfolios: portfolios,
          programs: [],
          projects: [],
        },
      });
    }

    const projects = await sql`
        SELECT * FROM project
        WHERE program_id IN ${sql(programIds)}`;

    // Return all the hierarchical data
    res.status(200).json({
      status: "success",
      message: "Initiative with all related data retrieved successfully",
      result: {
        initiative: initiative[0],
        portfolios: portfolios,
        programs: programs,
        projects: projects,
      },
    });
  } catch (e) {
    console.error("Error fetching initiative data:", e);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      result: e.message,
    });
  }
};

// Get Portfolio with all related data
const getPortfolioWithAllRelatedData = async (req, res) => {
  let { portfolioId } = req.body;

  if (!portfolioId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: portfolioId",
      result: null,
    });
  }

  try {
    // Get portfolio details
    const portfolio = await sql`
        SELECT * FROM portfolio WHERE id = ${portfolioId}`;

    if (portfolio.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Portfolio not found",
        result: null,
      });
    }

    // Get parent initiative
    const initiative = await sql`
        SELECT * FROM initiative WHERE id = ${portfolio[0].initiative_id}`;

    // Get all programs linked to this portfolio
    const programs = await sql`
        SELECT * FROM program WHERE portfolio_id = ${portfolioId}`;

    // Get all projects linked to these programs
    const programIds = programs.map((program) => program.id);

    let projects = [];
    if (programIds.length > 0) {
      projects = await sql`
          SELECT * FROM project 
          WHERE program_id IN ${sql(programIds)}`;
    }

    // Return all the hierarchical data
    res.status(200).json({
      status: "success",
      message: "Portfolio with all related data retrieved successfully",
      result: {
        initiative: initiative[0] || null,
        portfolio: portfolio[0],
        programs: programs,
        projects: projects,
      },
    });
  } catch (e) {
    console.error("Error fetching portfolio data:", e);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      result: e.message,
    });
  }
};

// Get Program with all related data
const getProgramWithAllRelatedData = async (req, res) => {
  let { programId } = req.body;

  if (!programId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: programId",
      result: null,
    });
  }

  try {
    // Get program details
    const program = await sql`
        SELECT * FROM program WHERE id = ${programId}`;

    if (program.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Program not found",
        result: null,
      });
    }

    // Get parent portfolio
    const portfolio = await sql`
        SELECT * FROM portfolio WHERE id = ${program[0].portfolio_id}`;

    // Get parent initiative (if portfolio exists)
    let initiative = null;
    if (portfolio.length > 0) {
      initiative = await sql`
          SELECT * FROM initiative WHERE id = ${portfolio[0].initiative_id}`;
    }

    // Get all projects linked to this program
    const projects = await sql`
        SELECT * FROM project WHERE program_id = ${programId}`;

    // Return all the hierarchical data
    res.status(200).json({
      status: "success",
      message: "Program with all related data retrieved successfully",
      result: {
        initiative: initiative && initiative.length > 0 ? initiative[0] : null,
        portfolio: portfolio.length > 0 ? portfolio[0] : null,
        program: program[0],
        projects: projects,
      },
    });
  } catch (e) {
    console.error("Error fetching program data:", e);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      result: e.message,
    });
  }
};

// Get Project with all related data
const getProjectWithAllRelatedData = async (req, res) => {
  let { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: projectId",
      result: null,
    });
  }

  try {
    // Get project details
    const project = await sql`
        SELECT * FROM projects WHERE id = ${projectId}`;

    if (project.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Project not found",
        result: null,
      });
    }

    // Get parent program
    const program = await sql`
        SELECT * FROM programs WHERE id = ${project[0].program_id}`;

    // Get parent portfolio (if program exists)
    let portfolio = null;
    if (program.length > 0) {
      portfolio = await sql`
          SELECT * FROM portfolio WHERE id = ${program[0].portfolio_id}`;
    }

    // Get parent initiative (if portfolio exists)
    let initiative = null;
    if (portfolio && portfolio.length > 0) {
      initiative = await sql`
          SELECT * FROM initiative WHERE id = ${portfolio[0].initiative_id}`;
    }

    // Return all the hierarchical data
    res.status(200).json({
      status: "success",
      message: "Project with all related data retrieved successfully",
      result: {
        initiative: initiative && initiative.length > 0 ? initiative[0] : null,
        portfolio: portfolio && portfolio.length > 0 ? portfolio[0] : null,
        program: program.length > 0 ? program[0] : null,
        project: project[0],
      },
    });
  } catch (e) {
    console.error("Error fetching project data:", e);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      result: e.message,
    });
  }
};

module.exports = {
  getInitiativeWithAllRelatedData,
  getPortfolioWithAllRelatedData,
  getProgramWithAllRelatedData,
  getProjectWithAllRelatedData,
};
