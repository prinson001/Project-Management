const sql = require("../database/db");
const getActivityDurations = async (req, res) => {
  try {
    const activityDurations =
      await sql`select id , activity_name , from_role , to_role , duration , last_modified  from "activity_duration"`;
    res.status(200);
    res.json({ result: activityDurations });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "failed to get activity duration records",
      result: e.message,
    });
  }
};

// const updateActivityDurations = async (req, res) => {
//   const { data } = req.body;

//   if (!data || data.length === 0) {
//     return res.status(400).json({
//       status: "failure",
//       message: "Data not present",
//       result: null,
//     });
//   }

//   try {
//     // Validate each object in the array has the required fields
//     for (const item of data) {
//       if (!item.id || item.duration === undefined) {
//         return res.status(400).json({
//           status: "failure",
//           message: "Each item must have 'id' and 'duration' fields",
//           result: null,
//         });
//       }

//       // Validate id is numeric
//       if (isNaN(parseInt(item.id))) {
//         return res.status(400).json({
//           status: "failure",
//           message: `Invalid id format for item: ${JSON.stringify(item)}`,
//           result: null,
//         });
//       }
//     }

//     // Use a transaction to ensure all updates succeed or fail together
//     const result = await sql.begin(async (transaction) => {
//       const updatedRecords = [];

//       //Process each update one by one
//       // for (const item of data) {
//       //   const updateResult = await transaction`
//       //       UPDATE activity_duration
//       //       SET duration = ${item.duration}
//       //       WHERE id = ${item.id}
//       //       RETURNING *
//       //     `;

//       //   if (updateResult && updateResult.length > 0) {
//       //     updatedRecords.push(updateResult[0]);
//       //   }
//       // }

//       // Object.keys(data).forEach((e) => {
//       //   const updateResult = await transaction`
//       //       UPDATE activity_duration
//       //       SET duration = ${item.duration}
//       //       WHERE id = ${item.id}
//       //       RETURNING *
//       //     `;

//       //   if (updateResult && updateResult.length > 0) {
//       //     updatedRecords.push(updateResult[0]);
//       //   }
//       // });

//       return updatedRecords;
//     });

//     // Check if any records were updated
//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         status: "warning",
//         message: "No records were updated",
//         result: null,
//       });
//     }

//     return res.status(200).json({
//       status: "success",
//       message: `Successfully updated ${result.length} activity duration records`,
//       result: result,
//     });
//   } catch (error) {
//     console.error("Error updating activity durations:", error);
//     return res.status(500).json({
//       status: "failure",
//       message: "Error updating activity durations",
//       result: error.message || error,
//     });
//   }
// };
// const updateActivityDurations = async (req, res) => {
//   try {
//     // Validate request body structure
//     if (!req.body?.data || typeof req.body.data !== "object") {
//       return res.status(400).json({
//         status: "failure",
//         message: "Required field missing: data object is required",
//       });
//     }

//     const { data } = req.body;
//     const validationErrors = [];

//     // Phase 1: Pre-transaction validation
//     for (const [rowId, data] of Object.entries(data)) {
//       // Validate row ID
//       if (isNaN(rowId)) {
//         validationErrors.push(`Invalid row ID format: ${rowId}`);
//       }

//       // Validate data structure
//       if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
//         validationErrors.push(`Row ${rowId}: No update data provided`);
//       }

//       // Validate column names
//       for (const column of Object.keys(data)) {
//         if (!/^[a-zA-Z0-9_]+$/.test(column)) {
//           validationErrors.push(
//             `Row ${rowId}: Invalid column name '${column}'`
//           );
//         }
//       }
//     }

//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         status: "failure",
//         message: "Validation errors detected",
//         errors: validationErrors,
//       });
//     }

//     // Phase 2: Transaction processing
//     const result = await sql.begin(async (transaction) => {
//       const updatedRecords = [];

//       for (const [rowId, data] of Object.entries(data)) {
//         const numericId = Number(rowId);

//         const updateResult = await transaction`
//           UPDATE initiative
//           SET ${sql(data)}
//           WHERE id = ${numericId}
//           RETURNING *
//         `;

//         if (updateResult.length === 0) {
//           throw new Error(`Row ${rowId} not found - transaction rolled back`);
//         }

//         updatedRecords.push(updateResult[0]);
//       }

//       return updatedRecords;
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "All updates completed atomically",
//       updated: result,
//     });
//   } catch (error) {
//     console.error("Atomic update error:", error);

//     // Handle not found errors specifically
//     if (error.message.includes("not found")) {
//       return res.status(404).json({
//         status: "failure",
//         message: error.message,
//       });
//     }

//     return res.status(500).json({
//       status: "failure",
//       message: "Atomic update failed - all changes rolled back",
//       error: error.message,
//     });
//   }
// };

const updateActivityDurations = async (req, res) => {
  try {
    // Validate request body structure
    if (!req.body?.data || typeof req.body.data !== "object") {
      return res.status(400).json({
        status: "failure",
        message: "Required field missing: data object is required",
      });
    }

    const { data } = req.body;
    console.log(data);
    const validationErrors = [];

    // Phase 1: Pre-transaction validation
    for (const [rowId, rowData] of Object.entries(data)) {
      // Validate row ID is numeric
      if (isNaN(rowId)) {
        validationErrors.push(`Invalid row ID format: ${rowId}`);
      }

      // Validate data structure
      if (
        !rowData ||
        typeof rowData !== "object" ||
        Object.keys(rowData).length === 0
      ) {
        validationErrors.push(`Row ${rowId}: No update data provided`);
      }

      // Validate column names
      for (const column of Object.keys(rowData)) {
        if (!/^[a-zA-Z0-9_]+$/.test(column)) {
          validationErrors.push(
            `Row ${rowId}: Invalid column name '${column}'`
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Validation errors detected",
        errors: validationErrors,
      });
    }

    // Phase 2: Transaction processing
    const result = await sql.begin(async (transaction) => {
      const updatedRecords = [];

      for (const [rowId, rowData] of Object.entries(data)) {
        const numericId = Number(rowId);
        console.log(numericId);
        console.log(rowData);
        const updateResult = await transaction`
          UPDATE activity_duration
          SET ${sql(rowData)}
          WHERE id = ${numericId}
          RETURNING *
        `;

        if (updateResult.length === 0) {
          throw new Error(`Row ${rowId} not found - transaction rolled back`);
        }

        updatedRecords.push(updateResult[0]);
      }

      return updatedRecords;
    });

    return res.status(200).json({
      status: "success",
      message: "All updates completed atomically",
      updated: result,
    });
  } catch (error) {
    console.error("Atomic update error:", error);

    // Handle not found errors specifically
    if (error.message.includes("not found")) {
      return res.status(404).json({
        status: "failure",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Atomic update failed - all changes rolled back",
      error: error.message,
    });
  }
};

module.exports = { getActivityDurations, updateActivityDurations };
