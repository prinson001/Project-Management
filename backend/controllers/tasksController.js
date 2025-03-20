const sql = require("../database/db");

const getTasks = async (req, res) => {
  let { userId, page = 1, limit = 4 } = req.body;
  console.log("the userId", userId);
  if (!userId) {
    res.status(400).json({
      status: "failure",
      message: "Required field missing",
      result: null,
    });
    return;
  }

  try {
    const offset = (page - 1) * limit;

    const result = await sql`
      SELECT tasks.*, 
             project.name AS project_name,
             project.project_budget  AS project_budget,
             project.approved_project_budget AS approved_project_budget,
             users.first_name, 
             users.family_name, 
             users.arabic_first_name, 
             users.arabic_family_name
      FROM tasks 
      LEFT JOIN project ON tasks.related_entity_id = project.id 
      LEFT JOIN users ON tasks.assigned_to = users.id
      WHERE tasks.assigned_to = ${userId} 
      LIMIT ${limit} OFFSET ${offset}`;

    const countResult = await sql`
      SELECT COUNT(*) FROM tasks WHERE assigned_to = ${userId}`;

    const totalCount = parseInt(countResult[0].count);

    res.status(200).json({
      status: "success",
      message: "Tasks retrieved successfully",
      result: result,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      result: e.message,
    });
  }
};

const filterTasks = async (req, res) => {
  const {
    userId,
    filters = {},
    project_name,
    getAllTasks = false,
    taskStatus,
    dateFilter,
    sort: sortClause,
    page = 1,
    limit = 10,
  } = req.body;

  // Validate required parameters
  if (!userId) {
    return res.status(400).json({
      status: "failure",
      message: "userId is required",
      result: null,
    });
  }

  try {
    let whereConditions = [];
    let queryParams = [];

    // Add assigned_to condition if not getting all tasks
    if (!getAllTasks) {
      whereConditions.push(
        `tasks.assigned_to = $${whereConditions.length + 1}`
      );
      queryParams.push(userId);
    }

    // Process filters
    Object.entries(filters).forEach(([column, value]) => {
      if (
        value &&
        typeof value === "string" &&
        value.trim() !== "" &&
        /^[a-zA-Z0-9_]+$/.test(column)
      ) {
        whereConditions.push(
          `tasks.${column} = $${whereConditions.length + 1}`
        );
        queryParams.push(value.trim());
      }
    });

    // Add project name filter
    if (project_name && project_name.trim() !== "") {
      whereConditions.push(`project.name = $${whereConditions.length + 1}`);
      queryParams.push(project_name.trim());
    }

    // Add status filter
    if (taskStatus && taskStatus.trim() !== "" && taskStatus != "Open") {
      whereConditions.push(`tasks.status = $${whereConditions.length + 1}`);
      queryParams.push(taskStatus.trim());
    }

    // Date filtering logic
    const dateColumn = "created_date"; // Change to your date column
    if (dateFilter && dateFilter !== "all") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      let startDate, endDate;

      switch (dateFilter) {
        case "Today":
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `tasks.${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `tasks.${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "thisWeek":
          startDate = new Date(today);
          const dayOfWeek = startDate.getDay();
          const diff = dayOfWeek <= 1 ? dayOfWeek + 6 : dayOfWeek - 1;
          startDate.setDate(today.getDate() - diff);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          whereConditions.push(
            `tasks.${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `tasks.${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(endDate.toISOString());
          break;
        case "This Month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `tasks.${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `tasks.${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "last2months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `tasks.${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `tasks.${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "Last 3 Months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `tasks.${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `tasks.${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
      }
    }

    // Build base query
    let queryText = `
        SELECT tasks.*, 
               project.name AS project_name, 
              project.project_budget  AS project_budget,
              project.approved_project_budget AS approved_project_budget,
               users.first_name, 
               users.family_name, 
               users.arabic_first_name, 
               users.arabic_family_name
        FROM tasks
        LEFT JOIN project ON tasks.related_entity_id = project.id
        LEFT JOIN users ON tasks.assigned_to = users.id
      `;

    // Add WHERE conditions
    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(" AND ")}`;
    }
    // Add sorting
    if (sortClause && typeof sortClause === "object") {
      const validColumns = ["created_date", "due_date", "priority"]; // Add valid sortable columns
      const sortStatements = [];

      Object.entries(sortClause).forEach(([column, direction]) => {
        if (
          validColumns.includes(column) &&
          ["ASC", "DESC"].includes(direction.toUpperCase())
        ) {
          sortStatements.push(`tasks.${column} ${direction.toUpperCase()}`);
        }
      });

      if (sortStatements.length > 0) {
        queryText += ` ORDER BY ${sortStatements.join(", ")}`;
      }
    }
    console.log(whereConditions);
    console.log(queryParams);
    // Add pagination
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    // Execute main query
    const result = await sql.unsafe(queryText, queryParams);

    // Get total count
    let countQuery = `
        SELECT COUNT(*) 
        FROM tasks
        LEFT JOIN project ON tasks.related_entity_id = project.id
        LEFT JOIN users ON tasks.assigned_to = users.id
        ${
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : ""
        }
      `;

    const totalResult = await sql.unsafe(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(totalResult[0].count, 10);

    res.json({
      status: "success",
      result: result,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error filtering tasks:", error);
    res.status(500).json({
      status: "failure",
      message: "Error filtering tasks",
      result: error.message,
    });
  }
};
module.exports = { getTasks, filterTasks };
