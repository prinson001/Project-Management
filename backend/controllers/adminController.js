const sql = require("../database/db");
const addNewUser = async (req, res) => {
  const { first_name, family_name, arabic_first_name, arabic_family_name, email, password } = req.body;

  // Validate required fields
  if (!first_name || !family_name || !email || !password) {
    return res.status(400).json({
      status: "failure",
      message: "Required fields missing",
      result: null,
    });
  }

  try {
    // Check if the email already exists
    const existingUsers = await sql`SELECT * FROM "users" WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Email already exists",
        result: null,
      });
    }

    // Insert the new user
    const result = await sql`
      INSERT INTO "users" (first_name, family_name, arabic_first_name, arabic_family_name, email, password)
      VALUES (${first_name}, ${family_name}, ${arabic_first_name}, ${arabic_family_name}, ${email}, ${password})
      RETURNING *
    `;

    // Return success response
    return res.status(201).json({
      status: "success",
      message: "User added successfully",
      result: result[0],
    });
  } catch (e) {
    console.error("Error adding user:", e);
    return res.status(500).json({
      status: "failure",
      message: "Error adding user",
      result: e.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await sql`
    SELECT 
      u.*, 
      r.name AS role_name, 
      r.arabic_name AS role_arabic_name,
      d.name AS department_name,
      d.arabic_name AS department_arabic_name
    FROM "users" u
    LEFT JOIN "role" r ON u.role_id = r.id
    LEFT JOIN "department" d ON u.department_id = d.id
  `;

    res.status(200);
    res.json({ result: users });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "failed to get users",
      result: e.message,
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

const updateUser = async (req, res) => {
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
        UPDATE users
        SET ${setClause}
        WHERE id = ${idPlaceholder}
        RETURNING *
      `;
    console.log(queryText);
    console.log(values);
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

const getRoles = async (req, res) => {
  try {
    const roles = await sql`
      SELECT r.id, r.name, r.arabic_name, COUNT(u.id) AS user_count
      FROM "role" r
      LEFT JOIN "users" u ON r.id = u.role_id
      GROUP BY r.id, r.name, r.arabic_name
    `;

    return res.status(200).json({ result: roles });
  } catch (e) {
    return res.status(500).json({
      status: "failure",
      message: "Failed to get roles",
      error: e.message,
    });
  }
};

// const addUser = async (req, res) => {
//   const { first_name, email, password, role_id } = req.body;

//   // Validate required fields
//   if (!first_name || !email || !password || !role_id) {
//     return res.status(400).json({
//       status: "failure",
//       message: "Required fields missing",
//       result: null,
//     });
//   }

//   try {
//     // Check if the email already exists
//     const existingUsers = await sql`SELECT * FROM "users" WHERE email = ${email}`;
//     if (existingUsers.length > 0) {
//       return res.status(400).json({
//         status: "failure",
//         message: "Email already exists",
//         result: null,
//       });
//     }

//     // Insert the new user
//     const result = await sql`
//       INSERT INTO "users" (first_name, email, password, role_id)
//       VALUES (${first_name}, ${email}, ${password}, ${role_id})
//       RETURNING *
//     `;

//     // Return success response
//     return res.status(201).json({
//       status: "success",
//       message: "User added successfully",
//       result: result[0],
//     });
//   } catch (e) {
//     console.error("Error adding user:", e);
//     return res.status(500).json({
//       status: "failure",
//       message: "Error adding user",
//       result: e.message,
//     });
//   }
// };

module.exports = {
  addNewUser,
  getUsers,
  deleteUsers,
  getUser,
  getRoles,
  updateUser,
};
