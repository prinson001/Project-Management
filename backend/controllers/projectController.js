const sql = require("../database/db");

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
  console.log('Inside Add Project...')

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
    console.log('Column Names: ',columns)
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

module.exports = { addProject, updateProject, deleteProject, getProjectById };