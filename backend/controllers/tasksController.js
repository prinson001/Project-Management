const sql = require("../database/db");

const getTasks = async (req, res) => {
  console.log("get tasks is called");
  let { userId, page = 1, limit = 4 } = req.body;
  console.log("the userId", userId);
  if (!userId) {
    return res.status(400).json({
      status: "failure",
      message: "Required field missing",
      result: null,
    });
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
      ORDER BY tasks.created_date DESC
      LIMIT ${limit} OFFSET ${offset}`;

    // Debug logging
    console.log(`getTasks: Retrieved ${result.length} tasks for user ${userId}`);
    if (result.length > 0) {
      console.log('First task:', result[0].id, result[0].created_date, result[0].task_type);
      if (result.length > 1) {
        console.log('Second task:', result[1].id, result[1].created_date, result[1].task_type);
      }
    }

    const countResult = await sql`
      SELECT COUNT(*) AS totalCount,
             COUNT(CASE WHEN status = 'Open' THEN 1 END) AS openTasksCount,
             COUNT(CASE WHEN status = 'Delayed' THEN 1 END) AS closedTasksCount
      FROM tasks 
      WHERE assigned_to = ${userId}`;
    console.log("count result is");
    console.log(countResult);
    res.status(200).json({
      status: "success",
      message: "Tasks retrieved successfully",
      result: result,
      openTasksCount: parseInt(countResult[0].opentaskscount, 10),
      closedTasksCount: parseInt(countResult[0].closedtaskscount, 10),
      pagination: {
        total: parseInt(countResult[0].totalcount, 10),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(countResult[0].totalcount, 10) / limit),
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
    customDateRangeOption,
    sort: sortClause,
    page = 1,
    limit = 10,
  } = req.body;

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

    if (!getAllTasks) {
      whereConditions.push(
        `tasks.assigned_to = $${whereConditions.length + 1}`
      );
      queryParams.push(userId);
    }

    Object.entries(filters).forEach(([column, value]) => {
      if (value && typeof value === "string" && value.trim() !== "") {
        whereConditions.push(
          `tasks.${column} = $${whereConditions.length + 1}`
        );
        queryParams.push(value.trim());
      }
    });

    if (project_name && project_name.trim() !== "") {
      whereConditions.push(`project.name = $${whereConditions.length + 1}`);
      queryParams.push(project_name.trim());
    }

    if (taskStatus && taskStatus.trim() !== "" && taskStatus != "Open") {
      whereConditions.push(`tasks.status = $${whereConditions.length + 1}`);
      queryParams.push(taskStatus.trim());
    }

    // Date Filter Implementation
    if (dateFilter && dateFilter !== "all") {
      const dateColumn = "tasks.created_date"; // Using due_date for tasks
      let startDate, endDate;
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      switch (dateFilter) {
        case "Today":
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          console.log("the start date set for today is" + startDate);
          whereConditions.push(
            `DATE(${dateColumn}) >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `DATE(${dateColumn}) <= $${whereConditions.length + 1}`
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
            `${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(endDate.toISOString());
          break;
        case "This Month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "last2months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "Last 3 Months":
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          startDate.setHours(0, 0, 0, 0);
          whereConditions.push(
            `${dateColumn} >= $${whereConditions.length + 1}`
          );
          queryParams.push(startDate.toISOString());
          whereConditions.push(
            `${dateColumn} <= $${whereConditions.length + 1}`
          );
          queryParams.push(today.toISOString());
          break;
        case "custom":
          console.log("the custom range is set");
          if (
            !customDateRangeOption ||
            !customDateRangeOption.start ||
            !customDateRangeOption.end
          ) {
            return res.status(400).json({
              status: "failure",
              message: "Missing custom date range parameters",
              result: null,
            });
          }
          startDate = new Date(customDateRangeOption.start);
          endDate = new Date(customDateRangeOption.end);

          if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({
              status: "failure",
              message: "Invalid date format for custom range",
              result: null,
            });
          }

          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          whereConditions.push(
            `${dateColumn} >= $${
              whereConditions.length + 1
            } AND ${dateColumn} <= $${whereConditions.length + 2}`
          );
          queryParams.push(startDate.toISOString(), endDate.toISOString());
      }
    }

    let queryText = `
      SELECT tasks.*, 
             project.name AS project_name, 
             project.project_budget,
             project.approved_project_budget,
             users.first_name, 
             users.family_name, 
             users.arabic_first_name, 
             users.arabic_family_name
      FROM tasks
      LEFT JOIN project ON tasks.related_entity_id = project.id
      LEFT JOIN users ON tasks.assigned_to = users.id
    `;

    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    if (sortClause && typeof sortClause === "object") {
      const validColumns = ["created_date", "due_date", "priority"];
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
      } else {
        // Default sort by created_date DESC if no sort is specified
        queryText += ` ORDER BY tasks.created_date DESC`;
      }
    } else {
      // Default sort by created_date DESC if no sort clause is provided
      queryText += ` ORDER BY tasks.created_date DESC`;
    }

    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    const result = await sql.unsafe(queryText, queryParams);

    // Debug logging for filterTasks
    console.log(`filterTasks: Retrieved ${result.length} tasks`);
    console.log('Query used:', queryText);
    if (result.length > 0) {
      console.log('First task:', result[0].id, result[0].created_date, result[0].task_type);
      if (result.length > 1) {
        console.log('Second task:', result[1].id, result[1].created_date, result[1].task_type);
      }
    }

    let countQuery = `
      SELECT COUNT(*) AS totalCount,
             COUNT(CASE WHEN status = 'Open' THEN 1 END) AS openTasksCount,
             COUNT(CASE WHEN status = 'Delayed' THEN 1 END) AS closedTasksCount
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

    res.json({
      status: "success",
      result: result,
      openTasksCount: parseInt(totalResult[0].opentaskscount, 10),
      closedTasksCount: parseInt(totalResult[0].closedtaskscount, 10),
      pagination: {
        total: parseInt(totalResult[0].totalcount, 10),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(totalResult[0].totalcount, 10) / limit),
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

const updateTaskStatusToDone = async (req, res) => {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({
      status: "failure",
      message: "taskId is required",
      result: null,
    });
  }

  try {
    // Update the status of the specified task to "Done"
    const updateQuery = `
      UPDATE tasks 
      SET status = 'Done'
      WHERE id = $1
      RETURNING *;
    `;

    const result = await sql.unsafe(updateQuery, [taskId]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "Task not found",
        result: null,
      });
    }

    res.json({
      status: "success",
      message: "Task status updated to Done",
      result: result[0],
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({
      status: "failure",
      message: "Error updating task status",
      result: error.message,
    });
  }
};

module.exports = { getTasks, filterTasks, updateTaskStatusToDone };
