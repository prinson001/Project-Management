const sql = require("../database/db");



const getRisks = async (req, res) => {
  const { sortType, sortOrder, projectid, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  console.log("the projectId " + projectid);
  console.log(sortType+"-"+sortOrder);

  // Safe allowed values
  const allowedSortColumns = ["due_date", "created_date", "name", "status", "type","comments"];
  const allowedSortOrder = ["ASC", "DESC"];
  const sortBy = allowedSortColumns.includes(sortType) ? sortType : "due_date";
  const sortDir = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC";
  console.log(sortBy+"-"+sortOrder);
  try {
    

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
      ORDER BY
      ${sql([sortBy])} ${sql.unsafe(sortDir)}
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
    console.log(result);
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

const updateRisk = async (req, res) => {
  const { id, updatedData } = req.body;
  console.log(updatedData);
  const keyMap = {
    caseName: 'name',
    phaseName: 'phase_id',
    status: 'status',
    responsePlan: 'comments',
  };

  const dataToUpdate = {};

  for (const key in updatedData) {
    if (keyMap[key]) {
      dataToUpdate[keyMap[key]] = updatedData[key];
    }
  }

  console.log("Data to update:", dataToUpdate);
  if(Object.keys(dataToUpdate).length === 0)
  {
    res.status(200).json({
      status:"success",
      message:"nothing to updated",
      result : null
    })
    return;
  }
  try {
    const result = await sql`
      UPDATE risks
      SET ${sql(dataToUpdate)}
      WHERE id = ${id}
    `;

    res.status(200).json({
      status: "success",
      message: "Successfully updated the risk data",
      result,
    });
  } catch (e) {
    console.error("Error updating risk:", e);
    res.status(500).json({
      status: "failure",
      message: "Failed to update risk",
      result: e,
    });
  }
};







module.exports = {getRisks,insertRisk, deleteRisk, updateRisk};

