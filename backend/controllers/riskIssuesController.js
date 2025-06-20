const sql = require("../database/db");



const getRisks = async (req, res) => {
  const { sortType, sortOrder, projectid, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  console.log("the projectId " + projectid);

  try {
    const allowedSortColumns = ['name', 'created_date', 'priority']; // example
    const allowedSortOrders = ['ASC', 'DESC'];

    let orderByClause = sql`ORDER BY created_date DESC`;
    if (sortType && allowedSortColumns.includes(sortType) && allowedSortOrders.includes(sortOrder?.toUpperCase())) {
      orderByClause = sql`ORDER BY ${sql(sortType)} ${sql.raw(sortOrder.toUpperCase())}`;
    } else if (sortType) {
      return res.status(400).json({ status: "Failure", message: "Invalid sortType or sortOrder" });
    }

    const result = await sql`
      SELECT
        r.*,
        p.name as phase_name
      FROM
        risks r
      JOIN
        project_phase p ON r.phase_id = p.id
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
      ${orderByClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) FROM risks
      WHERE linked_project_id = ${projectid}
      OR linked_deliverable_id IN (
        SELECT id
        FROM deliverable
        WHERE item_id IN (
          SELECT id
          FROM item
          WHERE project_id = ${projectid}
        )
      )
    `;

    const totalCount = parseInt(countResult[0].count);
    res.status(200).json({
      status: "success",
      message: "Fetched risks successfully",
      result,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      }
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
    console.log(req.body);
    const {riskName , comments  , phaseId , linkedToType , linkedToId } = req.body;

    const linkedProjectId = linkedToType === 'project' ? linkedToId : null;
    const linkedDeliverableId = linkedToType === 'deliverable' ? linkedToId : null; 
    const today = new Date().toISOString().split('T')[0];
    let dueDate = "";
    if(linkedToType == 'project')
    {
      try{
        const response = await sql `
          SELECT 
            maintenance_duration
          FROM 
            project
          WHERE   
            id=${linkedProjectId}
        `
        dueDate = response[0].maintenance_duration;
      }
      catch(e)
      {
        return res.status(500).json({
          status:"failure",
          message:"Failed to get due date of project",
          result : e
        })
      }
    }
    else
    {
      try{
        const response = await sql  `
          SELECT 
            end_date
          FROM
            deliverable
          WHERE
            id=${linkedDeliverableId}
        `
        dueDate=response[0].end_date;
      }
      catch(e)
      {
        return res.status(500).json({
          status:"failure",
          message:"Failed to get due date of deliverable",
          result : e
        })
      }
    }
    console.log("due date:"+dueDate);
    try{
        const result = await sql `
            INSERT INTO risks(name , status , type , due_date , phase_id , created_date , linked_project_id , linked_deliverable_id, comments )
            VALUES (${riskName},'open','risk',${dueDate},${phaseId},${today},${linkedProjectId},${linkedDeliverableId}, ${comments})
            RETURNING *
        `
        return res.status(201).json({
            status: "success",
            message: "Risk inserted successfully",
            result
        });
    }
    catch(e)
    {
      return res.status(500).json({
            status:"failure",
            message:"Failed to insert risk",
            result : e.message
        })
    }
}

const deleteRisk = async (req,res)=>{
  const {riskId}  = req.params;
  try{
    const result = await sql  `
      DELETE FROM risks
      WHERE
        id=${riskId}
    `;
    res.status(200).json({
      status:"success",
      message:"successfully deleted the risk",
      result:null
    })
  }
  catch(e)
  {
    res.status(500).json({
      status:"failure",
      message:"failed to delete the risk",
      result:e
    })
  }
}




module.exports = {getRisks,insertRisk, deleteRisk};

