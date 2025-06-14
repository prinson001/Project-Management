const sql = require("../database/db");



const getRisks = async (req, res) => {
  const { sortType, sortOrder, projectid } = req.query;
  console.log("the projectId "+projectid );
  try {
    // Base query
    let baseQuery = sql`
      SELECT r.*
      FROM risks r
      WHERE r.linked_project_id = ${projectid}
      OR r.linked_deliverable_id IN (
        SELECT id
        FROM deliverable
        WHERE item_id IN (
          SELECT id
          FROM item
          WHERE project_id = ${projectid}
        )
      )
    `;

    // Append ORDER BY
    if (sortType) {
      // Ensure sortType and sortOrder are safe (to avoid SQL injection)
      const allowedSortColumns = ['name', 'created_date', 'priority']; // example
      const allowedSortOrders = ['ASC', 'DESC'];

      if (!allowedSortColumns.includes(sortType) || !allowedSortOrders.includes(sortOrder?.toUpperCase())) {
        return res.status(400).json({ status: "Failure", message: "Invalid sortType or sortOrder" });
      }

      baseQuery = sql`${baseQuery} ORDER BY ${sql(sortType)} ${sql([sortOrder.toUpperCase()])}`;
    } else {
      baseQuery = sql`${baseQuery} ORDER BY created_date DESC`;
    }

    const result = await sql`${baseQuery}`;
    res.status(200).json({
      status: "success",
      message: "Fetched risks successfully",
      result,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "Failure",
      message: "Error in fetching risks",
      result: e.message,
    });
  }
};


const insertRisk = async (req,res)=>{
    const {caseName , dueDate , comments  , phaseName , linkedToType , linkedToId } = req.body;

    const linkedProjectId = linkedToType === 'project' ? linkedToId : null;
    const linkedDeliverableId = linkedToType === 'deliverable' ? linkedToId : null; 
    const today = new Date().toISOString().split('T')[0];

    try{
        const result = await sql `
            INSERT INTO RISK(name , status , type , due_date , phasename , created_date , linkedProjectId , linkedDeliverableId, comments )
            VALUES (${caseName},'open','risk',${dueDate},${phaseName},${today},${linkedProjectId},${linkedDeliverableId}, ${comments})
        `
        return res.status(201).json({
            status: "success",
            message: "Risk inserted successfully",
        });
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"Failed to insert risk",
            result : e.message
        })
    }
}


module.exports = {getRisks,insertRisk};

