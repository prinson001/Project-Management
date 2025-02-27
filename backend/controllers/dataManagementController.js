const sql = require("../database/db");
const getData = async (req, res) => {
  if (!req.body.tableName || !req.body.userId) {
    res.status(400);
    res.json({
      status: "failure",
      message: "Required field missing:tableName, userId",
      result: null,
    });
    return;
  }
  try {
    const result = await sql`SELECT * FROM  ${sql(req.body.tableName)};`;
    res.status(200);
    res.json({ status: "success", message: "", result });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "Error in retrieving table data",
      result: e,
    });
  }
};

const getFilteredData = async (req, res) => {
  const { tableName, filters, page = 1, limit = 10, sort } = req.body;

  if (!tableName || !filters || typeof filters !== "object") {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: tableName, filters must be an object",
      result: null,
    });
  }

  try {
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid table name",
        result: null,
      });
    }

    // Build where conditions
    let whereConditions = [];
    let queryParams = [];

    // Handle search term separately
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      whereConditions.push(`"name" ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${filters.searchTerm}%`);
    }

    // Handle other filters
    Object.entries(filters).forEach(([column, value]) => {
      if (
        column !== "searchTerm" &&
        value &&
        typeof value === "string" &&
        value.trim() !== "" &&
        /^[a-zA-Z0-9_]+$/.test(column) // Validate column name
      ) {
        whereConditions.push(`"${column}" = $${whereConditions.length + 1}`);
        queryParams.push(value);
      }
    });

    // Pagination
    const offset = (page - 1) * limit;

    // Sorting - safe way to handle ORDER BY
    let orderByClause = "";
    if (sort && typeof sort === "object" && Object.keys(sort).length > 0) {
      const validDirections = ["ASC", "DESC", "asc", "desc"];
      const sortParts = [];

      Object.entries(sort).forEach(([column, direction]) => {
        if (
          /^[a-zA-Z0-9_]+$/.test(column) &&
          validDirections.includes(String(direction).toUpperCase())
        ) {
          sortParts.push(`"${column}" ${String(direction).toUpperCase()}`);
        }
      });

      if (sortParts.length > 0) {
        orderByClause = `ORDER BY ${sortParts.join(", ")}`;
      }
    }

    // Build the base query
    let queryText = `SELECT * FROM "${tableName}"`;

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add ORDER BY
    if (orderByClause) {
      queryText += ` ${orderByClause}`;
    }

    // Add LIMIT and OFFSET
    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    // Execute the query
    const result = await sql.unsafe(queryText, queryParams);

    res.status(200).json({ status: "success", message: "", result });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "failure",
      message: "Error in retrieving filtered data",
      result: e,
    });
  }
};
const getSetting = async (req, res) => {
  if (!req.body.tableName || !req.body.userId) {
    res.status(400);
    res.json({
      status: "failure",
      message: "Required field missing:tableName, userId",
      result: null,
    });
    return;
  }
  try {
    const result = await sql`SELECT * FROM "user_table_settings" 
          WHERE (("user_id" =${req.body.userId}) OR ("user_id" IS NULL AND "is_default" = TRUE))   AND table_name = ${req.body.tableName};
        `;
    res.status(200);
    res.json({ status: "success", message: "", result });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "Error in retrieving table setting",
      result: e,
    });
  }
};

module.exports = { getData, getSetting, getFilteredData };
