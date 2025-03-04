const sql = require("../database/db");

// const getItemsWithDeliverables2 = async (req, res) => {
//   try {
//     const items = await sql`
//             SELECT
//               i.*,
//               COALESCE(
//                 json_agg(d.* ORDER BY d.created_at) FILTER (WHERE d.id IS NOT NULL),
//                 '[]'
//               ) as deliverables
//             FROM item i
//             LEFT JOIN deliverable d ON d.item_id = i.id
//             WHERE i.project_id = 2
//             GROUP BY i.id
//           `;

//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ error: "Server error", message: error.message });
//   }
// };

// const saveDeliverables2 = async (req, res) => {
//   const { newDeliverables, updatedDeliverables, deletedDeliverables } =
//     req.body;

//   try {
//     await sql.begin(async (trx) => {
//       // Delete first to avoid constraint issues
//       if (deletedDeliverables.length) {
//         await trx`
//             DELETE FROM deliverables
//             WHERE id IN ${sql(deletedDeliverables)}
//           `;
//       }

//       // Update existing
//       if (updatedDeliverables.length) {
//         for (const deliverable of updatedDeliverables) {
//           await trx`
//               UPDATE deliverable SET
//                 name = ${deliverable.name},
//                 description = ${deliverable.description}
//               WHERE id = ${deliverable.id}
//             `;
//         }
//       }

//       // Insert new
//       if (newDeliverables.length) {
//         await trx`
//             INSERT INTO deliverables ${sql(newDeliverables)}
//           `;
//       }
//     });

//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: "Save failed" });
//   }
// };

const getDeliverables = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    res.status(400).json({
      status: "failure",
      message: "Project id is missing",
    });
    return;
  }
  try {
    const result =
      await sql`SELECT * FROM "deliverable" where item_id = ${itemId}`;
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

const saveDeliverables = async (req, res) => {
  try {
    const { newItems, updates, deletions } = req.body;

    await sql.begin(async (trx) => {
      // Insert new records
      if (newItems?.length > 0) {
        await trx`
            INSERT INTO deliverable ${sql(newItems)} 
            RETURNING id
          `;
      }

      // Update existing records
      if (updates?.length > 0) {
        for (const item of updates) {
          const { id, ...fields } = item;
          await trx`
              UPDATE deliverable 
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
              DELETE FROM deliverable 
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

module.exports = {
  saveDeliverables,
  getDeliverables,
};
