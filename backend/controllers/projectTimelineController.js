const sql = require("../database/db");

// const getPhaseDurations = async (req, res) => {
//   try {
//     const result = await sql`
//       SELECT
//         p.id AS phase_id,
//         p.phase_name,
//         p.phase_order,
//         COALESCE(
//           JSON_OBJECT_AGG(
//             br.id,
//             JSON_BUILD_OBJECT(
//               'name', COALESCE(br.label, 'Default Range'),
//               'min', COALESCE(br.min_budget, 0),
//               'max', COALESCE(br.max_budget, NULL),
//               'duration_weeks', COALESCE(pd.duration_weeks, 0)
//             )
//           ) FILTER (WHERE br.id IS NOT NULL),
//           '{}'::json
//         ) AS budget_durations
//       FROM phase p
//       LEFT JOIN phase_duration pd ON p.id = pd.phase_id
//       LEFT JOIN budget_range br ON pd.range_id = br.id
//       GROUP BY p.id, p.phase_name, p.phase_order
//       ORDER BY p.phase_order;
//     `;

//     res.status(200).json({
//       status: "success",
//       message: "Phase durations retrieved successfully",
//       data: result,
//     });
//   } catch (e) {
//     res.status(500).json({
//       status: "failure",
//       message: `Failed to fetch phase durations: ${e.message}`,
//     });
//   }
// };
const getBudgetRanges = async (req, res) => {
  try {
    const result = await sql`
        SELECT 
          id,
          label as name,
          min_budget AS min,
          max_budget AS max
        FROM budget_range
        ORDER BY budget_order;
      `;

    res.status(200).json({
      status: "success",
      message: "Budget ranges retrieved successfully",
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch budget ranges: ${e.message}`,
    });
  }
};

const updatePhaseDurations = async (req, res) => {
  try {
    // Validate request body structure
    if (!Array.isArray(req.body?.updates)) {
      return res.status(400).json({
        status: "failure",
        message: "Required field missing: updates array is required",
      });
    }

    const { updates } = req.body;
    const validationErrors = [];

    // Phase 1: Pre-transaction validation
    updates.forEach((change, index) => {
      const errorPrefix = `Change ${index + 1}:`;

      if (!Number.isInteger(change.phase_id)) {
        validationErrors.push(`${errorPrefix} Invalid or missing phase_id`);
      }
      if (!Number.isInteger(change.range_id)) {
        validationErrors.push(`${errorPrefix} Invalid or missing range_id`);
      }
      if (!Number.isInteger(change.duration_weeks)) {
        validationErrors.push(`${errorPrefix} Invalid duration_weeks format`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Validation errors detected",
        errors: validationErrors,
      });
    }

    // Phase 2: Transaction processing
    const result = await sql.begin(async (transaction) => {
      const processedChanges = [];

      for (const change of updates) {
        const upsertResult = await transaction`
            INSERT INTO phase_duration (
              phase_id,
              range_id,
              duration_weeks
            ) VALUES (
              ${change.phase_id},
              ${change.range_id},
              ${change.duration_weeks}
            )
            ON CONFLICT (phase_id, range_id) DO UPDATE
            SET
              duration_weeks = EXCLUDED.duration_weeks
            RETURNING *
          `;

        if (upsertResult.length === 0) {
          throw new Error(
            `Failed to upsert phase ${change.phase_id}, range ${change.range_id}`
          );
        }

        processedChanges.push(upsertResult[0]);
      }

      return processedChanges;
    });

    return res.status(200).json({
      status: "success",
      message: "All changes completed atomically",
      updated: result,
    });
  } catch (error) {
    console.error("Atomic update error:", error);

    // Handle unique constraint violation specifically
    if (error.message.includes("unique constraint")) {
      return res.status(409).json({
        status: "failure",
        message: "Conflict detected - please verify phase/range combinations",
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Atomic update failed - all changes rolled back",
      error: error.message,
    });
  }
};

const updateBudgetRanges = async (req, res) => {
  try {
    // Validate request body structure
    if (!Array.isArray(req.body?.updates)) {
      return res.status(400).json({
        status: "failure",
        message: "Required field missing: updates array is required",
      });
    }

    const { updates } = req.body;
    const validationErrors = [];

    // Phase 1: Pre-transaction validation
    updates.forEach((change, index) => {
      const errorPrefix = `Change ${index + 1}:`;

      if (!Number.isInteger(change.id)) {
        validationErrors.push(`${errorPrefix} Invalid or missing id`);
      }
      if (typeof change.name !== "string" || change.name.trim() === "") {
        validationErrors.push(`${errorPrefix} Invalid or missing name`);
      }
      //   if (change.min !== null && !Number.isInteger(change.min)) {
      //     validationErrors.push(`${errorPrefix} Invalid min value`);
      //   }
      //   if (change.max !== null && !Number.isInteger(change.max)) {
      //     validationErrors.push(`${errorPrefix} Invalid max value`);
      //   }
      if (
        change.min !== null &&
        change.max !== null &&
        change.min >= change.max
      ) {
        validationErrors.push(
          `${errorPrefix} Min value must be less than Max value`
        );
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Validation errors detected",
        errors: validationErrors,
      });
    }

    // Phase 2: Transaction processing (only updates, no insertions)
    const result = await sql.begin(async (transaction) => {
      const processedChanges = [];

      for (const change of updates) {
        console.log(change.name + " " + change.min + " " + change.max);
        const updateResult = await transaction`
            UPDATE budget_range
            SET label = ${change.name},
                min_budget = ${change.min},
                max_budget = ${change.max}
            WHERE id = ${change.id}
            RETURNING *
          `;

        if (updateResult.length === 0) {
          throw new Error(`Failed to update budget range with id ${change.id}`);
        }

        processedChanges.push(updateResult[0]);
      }

      return processedChanges;
    });

    return res.status(200).json({
      status: "success",
      message: "All budget ranges updated successfully",
      updated: result,
    });
  } catch (error) {
    console.error("Update error:", error);

    return res.status(500).json({
      status: "failure",
      message: "Update operation failed - all changes rolled back",
      error: error.message,
    });
  }
};

module.exports = {
  updatePhaseDurations,
  getBudgetRanges,
  // getPhaseDurations,
  updateBudgetRanges,
};
