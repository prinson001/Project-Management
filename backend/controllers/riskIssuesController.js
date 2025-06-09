const sql = require("../database/db");



const getRisks = async (req,res) =>{
    const {sortType , sortOrder , projectid} = req.query;
    try{
        let query = `
            SELECT
                r.*
            FROM
                risks r
            WHERE
                r.linked_project_id = ${projectid} OR
                r.linked_deliverable_id IN (
                    SELECT 
                        id
                    FROM
                        deliverable
                    WHERE
                        item_id IN (
                            SELECT 
                                id
                            FROM
                                item
                            WHERE
                                project_id =${projectid}
                        )
                )
            ${sortType ? sql `ORDER BY ${sortType} ${sortOrder.toUpperCase()}`
                       : sql `ORDER BY created_date DESC`}
        `;
        let result = await sql `${query}`;
        res.status(200).json({
            status:"success",
            message:"Fetched risks successfully",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"Failure",
            message:"Error in fetching risks",
            result : e.message
        })
    }
}

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

