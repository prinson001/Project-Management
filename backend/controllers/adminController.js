const sql = require("../database/db");
const addNewUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Required field missing");
  }
  const users = await sql`select * from "User" where email = ${email}`;
  if (users.length != 0) {
    res.status(400);
    throw new Error("Email already exists");
  }
  try {
    const result =
      await sql`insert into "User" (email , password) values(${email} , ${password})`;
  } catch (e) {
    res.status(400);
    throw new Error("there was an error in inserting table ", e);
  }
};

const getUsers = async (req, res) => {
  try {
    const users =
      await sql`select id , email,first_name , family_name , arabic_first_name , arabic_family_name , role_id  from "users"`;
    res.status(200);
    res.json({ result: users });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "failed to get users",
      result: e,
    });
  }
};
const getUser = async (req, res) => {
  if (!req.body.userId) {
    return res
      .status(400)
      .json({ status: "failure", message: "required field missing" });
  }

  try {
    const users = await sql`
      SELECT id, email, first_name, family_name, arabic_first_name, arabic_family_name, role_id 
      FROM users 
      WHERE id = ${req.body.userId}
    `;

    return res.status(200).json({ result: users });
  } catch (e) {
    return res.status(500).json({
      status: "failure",
      message: "failed to get users",
      error: e.message, // Send only the error message instead of the full object for security
    });
  }
};

const deleteUsers = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await sql`DELETE FROM "users" WHERE id = ${id} RETURNING *`;
    res.status(200);
    console.log(result);
    res.json({ status: "success", message: result });
  } catch (e) {
    res.status(500);
    throw new Error("there was an error", e);
  }
};

const updateUsers = async (req, res) => {
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

module.exports = { addNewUser, getUsers, deleteUsers, getUser };
