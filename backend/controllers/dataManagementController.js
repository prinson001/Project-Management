const sql = require("../database/db");

//  @Description retrieve any table data
//  @Route site.com/data-management//data
const getData = async (req, res) => {
  let { tableName, userId, page = 1, limit = 4 } = req.body;
  if (tableName == "document") {
    tableName = "document_template";
  }
  if (!tableName || !userId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing: tableName, userId",
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

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    let result = null;
    // Get paginated data
    if (tableName === "portfolio") {
      result = await sql`
      SELECT ${sql(tableName)}.*, users.first_name AS portfolio_manager_name
      FROM ${sql(tableName)}
      LEFT JOIN users ON ${sql(tableName)}.portfolio_manager = users.id
      LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (tableName === "program") {
      result = await sql`
      SELECT ${sql(tableName)}.*, users.first_name AS program_manager_name
      FROM ${sql(tableName)}
      LEFT JOIN users ON ${sql(tableName)}.program_manager = users.id
      LIMIT ${limit} OFFSET ${offset}`;
    } else if (tableName === "objective") {
      result = await sql`
      SELECT ${sql(tableName)}.*, project.name AS belongs_to
      FROM ${sql(tableName)}
      LEFT JOIN users ON ${sql(tableName)}.project_id = project.id
      LIMIT ${limit} OFFSET ${offset}`;
    } else {
      result = await sql`
      SELECT * FROM ${sql(tableName)}
      LIMIT ${limit} OFFSET ${offset}
    `;
    }

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) FROM ${sql(tableName)}
    `;

    const totalCount = parseInt(countResult[0].count);

    return res.status(200).json({
      status: "success",
      message: "",
      result,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "failure",
      message: "Error in retrieving table data",
      result: e,
    });
  }
};

//  @Description retrieve filtered Table data(sorting,ordering,filtering table records)
//  @Route site.com/data-management/filtereddata
const getFilteredData = async (req, res) => {
  const {
    tableName,
    filters,
    page = 1,
    limit = 4,
    sort,
    dateFilter,
  } = req.body;

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

    // Handle date filtering
    // Assuming you have a column named "created_at" or similar that stores timestamps
    // You may need to adjust this column name based on your schema
    if (dateFilter) {
      const dateColumn = "created_at"; // Change this to your actual date column name

      let startDate, endDate;
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      switch (dateFilter) {
        case "Today":
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0); // Start of today

          whereConditions.push(
            `"${dateColumn}" >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());

          whereConditions.push(
            `"${dateColumn}" <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "thisWeek": // Changed from "last7days"
          // Get start of current week (Monday)
          startDate = new Date(today);
          const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const diff =
            dayOfWeek <= 1
              ? dayOfWeek + 6 // Handle Sunday/Monday
              : dayOfWeek - 1; // All other days
          startDate.setDate(today.getDate() - diff);
          startDate.setHours(0, 0, 0, 0);

          // Get end of current week (Sunday)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);

          whereConditions.push(
            `"${dateColumn}" >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());

          whereConditions.push(
            `"${dateColumn}" <= $${whereConditions.length + 1}`
          );
          queryParams.push(endDate.toISOString());
          break;
        case "This Month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0); // Start of the current month

          whereConditions.push(
            `"${dateColumn}" >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());

          whereConditions.push(
            `"${dateColumn}" <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;

        case "last2months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          startDate.setHours(0, 0, 0, 0); // Start of previous month

          whereConditions.push(
            `"${dateColumn}" >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());

          whereConditions.push(
            `"${dateColumn}" <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;

        case "Last 3 Months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          startDate.setHours(0, 0, 0, 0); // Start of 2 months ago

          whereConditions.push(
            `"${dateColumn}" >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());

          whereConditions.push(
            `"${dateColumn}" <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;

        // "all" case doesn't need any date filtering
        case "all":
        default:
          // No date filter applied
          break;
      }
    }

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
    console.log(queryText);
    console.log(queryParams);
    // Execute the query
    const result = await sql.unsafe(queryText, queryParams);

    // Get total count for pagination
    // We need to calculate this separately to know the total number of matching records
    let countQueryText = `SELECT COUNT(*) FROM "${tableName}"`;
    if (whereConditions.length > 0) {
      countQueryText += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // We exclude the limit and offset from the count query
    const countQueryParams = queryParams.slice(0, -2);
    const countResult = await sql.unsafe(countQueryText, countQueryParams);
    const totalCount = parseInt(countResult[0].count);

    res.status(200).json({
      status: "success",
      message: "",
      result,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "failure",
      message: "Error in retrieving filtered data",
      result: e,
    });
  }
};

//  @Description retrieve table setting (order,volumn visibility)
//  @Route site.com/data-management/setting
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
const getUsers = async (req, res) => {
  try {
    const result = await sql`
      SELECT id, first_name, family_name, email 
      FROM users 
      ORDER BY first_name, family_name
    `;

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      result,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "failure",
      message: "Error retrieving users",
      error: e.message,
    });
  }
};
module.exports = { getData, getSetting, getFilteredData, getUsers };
