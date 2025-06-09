const sql = require("../database/db");

//  project tasks
//  project_id , notes , create_date , week , month 
//  1 , "Complete dashboord ui design" , 09-06-2025 , w3 , June
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

const getProjectDetails = async(req,res)=>{
    const {projectid} = req.params;
    try{
        const result = await sql `
            SELECT 
                *
            FROM
                project
            WHERE  
                id = ${projectid}
        `
        res.status(200).json({
            status:"success",
            message:"successfully retreived project details",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"Failed to get Project Details",
            result:e
        })
    }
}

const getProjectDeliverables = async(req,res)=>{
    const {projectid} = req.params;
    try{
        const result = await sql `
            SELECT 
                *
            FROM
                deliverable d
            WHERE
                d.item_id IN ( SELECT id FROM item WHERE project_id = ${projectid})
        `
        res.status(200).json({
            status:"success",
            message:"Successfully retrieved project deliverables",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"failed to get project deliverables",
            result:e
        })
    }
}


module.exports = {createProjectTasks,getProjectTasks,deleteProjectTasks,getProjectDetails,getProjectDeliverables};





