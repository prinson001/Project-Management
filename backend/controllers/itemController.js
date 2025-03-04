const { response } = require("express");
const sql = require("../database/db");
const getItems = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({
      status: "failure",
      message: "Project id is missing",
    });
    return;
  }
  try {
    const result =
      await sql`SELECT * FROM "item" where project_id = ${projectId}`;
    res.status(200).json({
      status: "success",
      message: "tasks records fetched successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "failed to fetch tasks record",
      result: e.message,
    });
  }
};

const saveItems = async (req, res) => {
  try {
    const { newItems, updates, deletions } = req.body;

    await sql.begin(async (trx) => {
      // Insert new records
      if (newItems?.length > 0) {
        await trx`
            INSERT INTO item ${sql(newItems)} 
            RETURNING id
          `;
      }

      // Update existing records
      if (updates?.length > 0) {
        for (const item of updates) {
          const { id, ...fields } = item;
          await trx`
              UPDATE item 
              SET ${sql(fields)} 
              WHERE id = ${id}
            `;
        }
      }

      // Delete records - CORRECTED SECTION
      if (deletions?.length > 0) {
        const validDeletions = deletions.map(Number).filter((id) => !isNaN(id));

        if (validDeletions.length > 0) {
          await trx`
              DELETE FROM item 
              WHERE id IN ${sql(validDeletions)}
            `;
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Operations completed successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { getItems, saveItems };
