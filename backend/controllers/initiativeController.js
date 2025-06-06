const sql = require("../database/db");

//  @Description add new Initiative
//  @Route site.com/data-management/addinitiative
const addInitiative = async (req, res) => {
  console.log('Initiative Data:', req.body);        // Log the full body
  console.log('Initiative Dataa:', req.body.data);  // Log the nested data

  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({
      status: "failure",
      message: "Data missing or invalid format",
      result: null,
    });
  }

  const { data } = req.body;

  // Check if data is present and not empty
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for insertion",
      result: null,
    });
  }

  try {
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

    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const queryText = `
      INSERT INTO initiative (${columns.map((col) => `"${col}"`).join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `;

    const result = await sql.unsafe(queryText, values);

    return res.status(201).json({
      status: "success",
      message: "Initiative added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding initiative:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        status: "failure",
        message: "Initiative with this identifier already exists",
        result: error.detail || error,
      });
    }
    return res.status(500).json({
      status: "failure",
      message: "Error adding initiative",
      result: error.message || error,
    });
  }
};

//  @Description update exisiting initiative
//  @Route site.com/data-management/updateinitiative
const updateInitiative = async (req, res) => {
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
        UPDATE initiative
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
        message: `Initiative with id ${id} not found`,
        result: null,
      });
    }

    // Return success response with the updated initiative
    return res.status(200).json({
      status: "success",
      message: "Initiative updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating initiative:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Update violates unique constraint",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error updating initiative",
      result: error.message || error,
    });
  }
};

//  @Description delete exisiting initiative
//  @Route site.com/data-management/deleteinitiative
const deleteInitiative = async (req, res) => {
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
        DELETE FROM initiative
        WHERE id = $1
        RETURNING id
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, [id]);

    // Check if any row was deleted
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Initiative with id ${id} not found`,
        result: null,
      });
    }

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Initiative deleted successfully",
      result: { id: result[0].id },
    });
  } catch (error) {
    console.error("Error deleting initiative:", error);

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      // PostgreSQL foreign key violation code
      return res.status(409).json({
        status: "failure",
        message:
          "Cannot delete this initiative because it's referenced by other records",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error deleting initiative",
      result: error.message || error,
    });
  }
};

//  @Description get all initiatives
//  @Route site.com/data-management/initiatives
const getInitiatives = async (req, res) => {
  try {
    // Build the query to get all initiatives
    const queryText = `
      SELECT * FROM initiative
      ORDER BY id DESC
    `;

    // Execute the query
    const result = await sql.unsafe(queryText);

    // Return success response with all initiatives
    return res.status(200).json({
      status: "success",
      message: "Initiatives retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving initiatives:", error);

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving initiatives",
      result: error.message || error,
    });
  }
};

module.exports = { addInitiative, updateInitiative, deleteInitiative, getInitiatives };
