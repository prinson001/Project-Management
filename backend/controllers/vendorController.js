const sql = require("../database/db");

//  @Description add new Vendor
//  @Route site.com/data-management/addvendor
const addVendor = async (req, res) => {
  try {
    console.log("Vendor Body", req.body);

    // Extract data and userId separately
    const { data, userId } = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        status: "failure",
        message: "No data fields provided for insertion",
        result: null,
      });
    }

    console.log("Processed data:", data);

    // Extract column names and values
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

    // Build the query dynamically
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const queryText = `
        INSERT INTO vendor (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    return res.status(201).json({
      status: "success",
      message: "Vendor added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding vendor:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        status: "failure",
        message: "Vendor with this identifier already exists",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error adding vendor",
      result: error.message || error,
    });
  }
};

const updateVendor = async (req, res) => {
  try {
    console.log("Vendor Body", req.body);

    const { id, data } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "failure",
        message: "Vendor ID is required for update",
        result: null,
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        status: "failure",
        message: "No data fields provided for update",
        result: null,
      });
    }

    console.log("Processed data:", data);

    // Extract column names and values
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

    // Build the query dynamically
    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(", ");
    const queryText = `
        UPDATE vendor 
        SET ${setClause}
        WHERE id = $${columns.length + 1}
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, [...values, id]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Vendor not found",
        result: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Vendor updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);

    return res.status(500).json({
      status: "failure",
      message: "Error updating vendor",
      result: error.message || error,
    });
  }
};

//  @Description get all vendors
//  @Route site.com/data-management/vendors
const getVendors = async (req, res) => {
  try {
    // Build the query to get all vendors
    const queryText = `
      SELECT * FROM vendor
      ORDER BY id DESC
    `;

    // Execute the query
    const result = await sql.unsafe(queryText);

    // Return success response with all vendors
    return res.status(200).json({
      status: "success",
      message: "Vendors retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving vendors:", error);

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving vendors",
      result: error.message || error,
    });
  }
};

module.exports = { addVendor, updateVendor, getVendors };
