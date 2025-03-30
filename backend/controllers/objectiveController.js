const sql = require("../database/db");

//  @Description add new Objective
//  @Route site.com/data-management/addObjective
const addObjective = async (req, res) => {
  // Check if data exists in the request body
  console.log("Objective Body", req.body);

  // Create a data object from the request body
  const data = { ...req.body.data };

  // Remove userId from data as it's not a column in the objective table
  if (data.userId) {
    delete data.userId;
  }

  // Map form field names to database column names based on the actual schema
  // English fields
  if (data.objectiveEnglish) {
    data.name = data.objectiveEnglish;
    delete data.objectiveEnglish;
  }

  if (data.objectiveEnglishName) {
    data.name = data.objectiveEnglishName;
    delete data.objectiveEnglishName;
  }

  if (data.descriptionEnglish) {
    data.description = data.descriptionEnglish;
    delete data.descriptionEnglish;
  }

  if (data.objectiveEnglishDescription) {
    data.description = data.objectiveEnglishDescription;
    delete data.objectiveEnglishDescription;
  }

  // Arabic fields
  if (data.objectiveArabic) {
    data.arabic_name = data.objectiveArabic;
    delete data.objectiveArabic;
  }

  if (data.objectiveArabicName) {
    data.arabic_name = data.objectiveArabicName;
    delete data.objectiveArabicName;
  }

  if (data.descriptionArabic) {
    data.arabic_description = data.descriptionArabic;
    delete data.descriptionArabic;
  }

  if (data.objectiveArabicDescription) {
    data.arabic_description = data.objectiveArabicDescription;
    delete data.objectiveArabicDescription;
  }

  console.log("Processed data:", data);

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
        INSERT INTO objective (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Return success response with the newly created objective
    return res.status(201).json({
      status: "success",
      message: "Objective added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding objective:", error);

    // Handle column does not exist errors
    if (error.code === "42703") {
      return res.status(400).json({
        status: "failure",
        message: `Column error: ${error.message}`,
        result: null,
      });
    }

    // Handle unique constraint violations or other specific errors
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Objective with this identifier already exists",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error adding objective",
      result: error.message || error,
    });
  }
};

//  @Description get all objectives
//  @Route site.com/data-management/objectives
const getObjectives = async (req, res) => {
  try {
    // Build the query to get all objectives
    const queryText = `
      SELECT * FROM objective
      ORDER BY id DESC
    `;

    // Execute the query
    const result = await sql.unsafe(queryText);

    // Return success response with all objectives
    return res.status(200).json({
      status: "success",
      message: "Objectives retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving objectives:", error);

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving objectives",
      result: error.message || error,
    });
  }
};

const getRelatedProjectsforObjective = async (req, res) => {
  try {
    const { objectiveId } = req.body;
    if (!objectiveId) {
      return res.status(400).json({
        status: "failure",
        message: "Department ID is required",
      });
    }

    const projects = await sql`
      SELECT p.id, p.name, p.arabic_name 
      FROM project_objective pd
      JOIN project p ON pd.project_id = p.id
      WHERE pd.objective_id = ${objectiveId};
    `;

    return res.status(200).json({
      status: "success",
      message: "Related projects fetched successfully",
      result: projects,
    });
  } catch (error) {
    console.error("Error fetching related projects:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching related projects",
      result: error.message || error,
    });
  }
};

const updateObjective = async (req, res) => {
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

  if (Object.keys(data).length === 0) {
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

    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");
    values.push(id);
    const idPlaceholder = `$${values.length}`;

    const queryText = `
        UPDATE objective
        SET ${setClause}
        WHERE id = ${idPlaceholder}
        RETURNING *
      `;

    const result = await sql.unsafe(queryText, values);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Objective with id ${id} not found`,
        result: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Objective updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating objective:", error);

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
        message: "Referenced objective manager does not exist",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error updating objective",
      result: error.message || error,
    });
  }
};

module.exports = {
  addObjective,
  getObjectives,
  updateObjective,
  getRelatedProjectsforObjective,
};
