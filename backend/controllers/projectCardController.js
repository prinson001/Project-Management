const sql = require("../database/db");


const createProjectTasks = async(req , res) =>{
    const {notes , projectId} = req.body;

    try{
        const result = await sql `
            INSERT INTO project_notes(notes,project_id)
            VALUES(${notes},${projectId})
        `
        res.status(201).json({
            status:"success",
            message:"created project tasks successfully",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"failed to create project tasks",
            result:e
        })
    }
}

const getProjectTasks = async(req,res)=>{
    const {projectId ,start_date , end_date} = req.params;

    try{
        const result = await sql `
            SELECT 
                *
            FROM 
                project_notes
            WHERE
                project_Id = ${projectId}
        `
        res.status(200).json({
            status:"success",
            message:"successfully fetched project tasks",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:'failure',
            message:"failed to get project tasks",
            result : e

        })
    }
}

const deleteProjectTasks = async(req,res)=>{
    const {projectTaskId} = req.params;
    try{
        const result = await sql `
            DELETE FROM
                project_notes
            WHERE   
                id = ${projectTaskId}
        `
        res.status(200).json({
            status:"success",
            message:"successfully deleted project tasks",
            result:null
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"failed to delete the project task",
            result:e
        })
    }
}