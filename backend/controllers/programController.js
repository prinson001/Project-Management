const sql = require("../database/db");

//  @Description add new Program
//  @Route site.com/data-management/addprogram
const addProgram = async (req, res) => {
  // Check if data exists in the request body
  if (!req.body || !req.body.data || typeof req.body.data !== "object") {
    return res.status(400).json({
      status: "failure",
      message: "Data missing or invalid format",
      result: null,
    });
  }

  const { data } = req.body;

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
        INSERT INTO program (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Return success response with the newly created program
    return res.status(201).json({
      status: "success",
      message: "Program added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding program:", error);

    // Handle unique constraint violations or other specific errors
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Program with this identifier already exists",
        result: error.detail || error,
      });
    }

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message: "Referenced program manager does not exist",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error adding program",
      result: error.message || error,
    });
  }
};

//  @Description update existing program
//  @Route site.com/data-management/updateprogram
const updateProgram = async (req, res) => {
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
        UPDATE program
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
        message: `Program with id ${id} not found`,
        result: null,
      });
    }

    // Return success response with the updated program
    return res.status(200).json({
      status: "success",
      message: "Program updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating program:", error);

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
        message: "Referenced program manager does not exist",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error updating program",
      result: error.message || error,
    });
  }
};

//  @Description delete existing program
//  @Route site.com/data-management/deleteprogram
const deleteProgram = async (req, res) => {
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
        DELETE FROM program
        WHERE id = $1
        RETURNING id
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, [id]);

    // Check if any row was deleted
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Program with id ${id} not found`,
        result: null,
      });
    }

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Program deleted successfully",
      result: { id: result[0].id },
    });
  } catch (error) {
    console.error("Error deleting program:", error);

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message:
          "Cannot delete this program because it's referenced by other records",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error deleting program",
      result: error.message || error,
    });
  }
};

module.exports = { addProgram, updateProgram, deleteProgram };
