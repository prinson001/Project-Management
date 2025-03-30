const sql = require("../database/db");

//  @Description add new Department
//  @Route site.com/data-management/addDepartment
const addDepartment = async (req, res) => {
  // Check if data exists in the request body
  console.log("Department Body", req.body);

  // Handle both formats: direct properties or nested under data
  let departmentData = {};

  if (req.body.data && typeof req.body.data === "object") {
    // Format: { data: { name: "...", arabic_name: "..." } }
    departmentData = req.body.data;
  } else if (req.body.departmentEnglish || req.body.departmentArabic) {
    // Format: { departmentEnglish: "...", departmentArabic: "..." }
    departmentData = {
      name: req.body.departmentEnglish,
      arabic_name: req.body.departmentArabic,
    };
  } else {
    return res.status(400).json({
      status: "failure",
      message: "Data missing or invalid format",
      result: null,
    });
  }

  // Make sure we have at least some data to insert
  if (Object.keys(departmentData).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for insertion",
      result: null,
    });
  }

  try {
    // Extract column names and values from the data object
    const columns = Object.keys(departmentData);
    const values = Object.values(departmentData);

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
        INSERT INTO department (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Return success response with the newly created department
    return res.status(201).json({
      status: "success",
      message: "Department added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding department:", error);

    // Handle unique constraint violations or other specific errors
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Department with this identifier already exists",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error adding department",
      result: error.message || error,
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await sql`SELECT * FROM department;`;
    return res.status(200).json({
      status: "success",
      message: "Departments fetched successfully",
      result: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error fetching departments",
      result: error.message || error,
    });
  }
};

const getRelatedProjects = async (req, res) => {
  try {
    const { departmentId } = req.body;
    if (!departmentId) {
      return res.status(400).json({
        status: "failure",
        message: "Department ID is required",
      });
    }

    const projects = await sql`
      SELECT p.id, p.name, p.arabic_name 
      FROM project_department pd
      JOIN project p ON pd.project_id = p.id
      WHERE pd.department_id = ${departmentId};
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

const updateDepartment = async (req, res) => {
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
        UPDATE department
        SET ${setClause}
        WHERE id = ${idPlaceholder}
        RETURNING *
      `;

    const result = await sql.unsafe(queryText, values);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Department with id ${id} not found`,
        result: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Department updated successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error updating department:", error);

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
        message: "Referenced department manager does not exist",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error updating department",
      result: error.message || error,
    });
  }
};

const deleteDepartment = async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: id is required",
      result: null,
    });
  }

  const { id } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id format: must be a number",
        result: null,
      });
    }

    const queryText = `
        DELETE FROM department
        WHERE id = $1
        RETURNING id
      `;

    const result = await sql.unsafe(queryText, [id]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: `Department with id ${id} not found`,
        result: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Department deleted successfully",
      result: { id: result[0].id },
    });
  } catch (error) {
    console.error("Error deleting department:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        status: "failure",
        message:
          "Cannot delete this department because it's referenced by other records",
        result: error.detail || error,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Error deleting department",
      result: error.message || error,
    });
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getRelatedProjects,
};
