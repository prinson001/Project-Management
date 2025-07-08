const sql = require("../database/db");

const getBudgetRanges = async (req, res) => {
  try {
    const ranges = await sql`
      SELECT id, label, min_budget, max_budget, budget_order 
      FROM public.budget_range 
      ORDER BY budget_order, min_budget
    `;
    // Data is already stored as full numbers, so direct return is fine.
    res.status(200).json({
      status: "success",
      message: "Budget ranges retrieved successfully.",
      data: ranges,
    });
  } catch (e) {
    console.error("Error fetching budget ranges:", e);
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch budget ranges: ${e.message}`,
    });
  }
};

const updateBudgetRanges = async (req, res) => {
  const { ranges } = req.body; // Expecting an array of range objects
  // ranges = [{id?, label, min_budget, max_budget, budget_order}]
  // min_budget and max_budget should be full numeric values from frontend

  if (!Array.isArray(ranges)) {
    return res.status(400).json({
      status: "failure",
      message: "Invalid input: ranges must be an array.",
    });
  }

  try {
    await sql.begin(async (sql) => {
      for (const range of ranges) {
        if (range.isNew || !range.id || typeof range.id === 'string') {
          // New range (including those with temporary string IDs)
          await sql`
            INSERT INTO public.budget_range (label, min_budget, max_budget, budget_order)
            VALUES (${range.label}, ${parseFloat(range.min_budget) || 0}, ${
              range.max_budget === null || range.max_budget === '' ? null : parseFloat(range.max_budget)
            }, ${range.budget_order || 0})
          `;
        } else if (range.id && range.toDelete) {
          // Mark for deletion
          await sql`DELETE FROM public.phase_duration WHERE range_id = ${range.id}`; // Cascade or handle related phase_duration
          await sql`DELETE FROM public.budget_range WHERE id = ${range.id}`;
        } else if (range.id && typeof range.id === 'number') {
          // Existing range to update
          await sql`
            UPDATE public.budget_range
            SET label = ${range.label}, 
                min_budget = ${parseFloat(range.min_budget) || 0}, 
                max_budget = ${range.max_budget === null || range.max_budget === '' ? null : parseFloat(range.max_budget)},
                budget_order = ${range.budget_order || 0}
            WHERE id = ${range.id}
          `;
        }
      }
    });
    res.status(200).json({
      status: "success",
      message: "Budget ranges updated successfully.",
    });
  } catch (e) {
    console.error("Error updating budget ranges:", e);
    res.status(500).json({
      status: "failure",
      message: `Failed to update budget ranges: ${e.message}`,
    });
  }
};

// Ensure getPhaseDurations (if you re-enable/use it) and any function that
// saves phase durations (e.g., updatePhaseDurations) correctly handles numeric budget values
// if it ever directly interacts with budget amounts instead of just range_id.
// The existing commented-out getPhaseDurations seems to aggregate correctly,
// assuming budget_range stores full numbers.

// Make sure to export any new functions:
module.exports = {
  getBudgetRanges,
  updateBudgetRanges,
};
