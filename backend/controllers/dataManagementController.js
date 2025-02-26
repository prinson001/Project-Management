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

module.exports = { getData, getSetting };
