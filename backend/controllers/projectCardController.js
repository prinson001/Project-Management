const sql = require("../database/db");

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

const getPreviousMeetingNotes = async(req,res)=>{
  let maxRecords = 5;
  const {max , projectid} = req.query;
  maxRecords = max ?? maxRecords; 

  try{
    const result = await sql  `
        SELECT * FROM (
          SELECT 
            m.id AS meeting_id,
            m.name,
            m.started_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'notes', n.notes
                )
              ) FILTER (WHERE n.id IS NOT NULL),
              '[]'
            ) AS meeting_notes
          FROM meeting m
          LEFT JOIN meeting_notes n ON m.id = n.meeting_id AND n.project_id = ${projectid}
          GROUP BY m.id, m.name, m.started_at
          ORDER BY m.started_at DESC
          LIMIT 5
        ) AS latest_meetings
        ORDER BY started_at DESC;

    `
    res.status(200).json({
      status:"success",
      message:"retreived the latest meeting and meeting notes",
      result,
    })

  }
  catch(e)
  {
    console.log(e);
    res.status(500).json({
      status:"failure",
      message:"failed to get previous meeting notes",
      result:e
    })
  }
}

const getProjectTasksGroupedByWeek = async (req, res) => {
 const {projectid} = req.params;
  try {
    const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

    const result = await sql`
      SELECT * FROM (
        SELECT
          w.id ,
          w.name,
          w.start_date,
          w.end_date,
          COALESCE(
            json_agg(
              json_build_object(
                'id', t.id,
                'name', t.notes,
                'created_date', t.created_date,
                'project_id', t.project_id
              )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) AS project_tasks
        FROM project_task_weeks w
        LEFT JOIN project_tasks t ON w.id = t.project_task_weeks_id AND t.project_id =${projectid}
        WHERE w.start_date <= ${today}
        GROUP BY w.id, w.name, w.start_date, w.end_date
        ORDER BY w.start_date DESC
      ) AS grouped_tasks
      ORDER BY start_date DESC;
    `;

    res.status(200).json({
      status: "success",
      message: "Retrieved project tasks grouped by current and previous weeks",
      result
    });

  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "Failed to fetch project tasks grouped by weeks",
      result: e.message
    });
  }
};

const createNextWeekProjectTask = async(req,res)=>{
    const {notes , projectId , userId} = req.body;
    console.log(notes);
    console.log(projectId);
    console.log(userId);
    const nextWeekStartDate = getWeekStartDate();
    console.log("next week start date is "+nextWeekStartDate);

    try{
        let nextWeekRecord = await sql `
            SELECT
                *
            FROM
                project_task_weeks
            WHERE
                start_date = ${nextWeekStartDate}
            ORDER BY start_date DESC
            LIMIT 1
        `;
        // create new project_task_week for next week
        if(nextWeekRecord.length === 0)
        {
            console.log("inside if condition");
            const weekStart = new Date(nextWeekStartDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const weekName = generateWeekName(weekStart); // e.g. "June 2025 W4 (20–26)"
            const weekNumber = getWeekOfMonth(weekStart); // e.g. 4
            const month = weekStart.getMonth() + 1;
            const year = weekStart.getFullYear();
            console.log("week start :"+weekStart+" week end :"+weekEnd);
            console.log("weekName :"+weekName+"\nweekNumber:"+weekNumber+" month :"+month+" year:"+year);

            try{
                nextWeekRecord = await sql `
                    INSERT INTO project_task_weeks(name, created_date, start_date, end_date, week, month, year)
                    VALUES(${weekName},${new Date().toISOString().split("T")[0]},${weekStart.toISOString().split("T")[0]},${weekEnd.toISOString().split("T")[0]},${weekNumber},${month},${year})
                    RETURNING *
                `;
            }
            catch(e)
            {
                res.status(500).json({
                    status:"failure",
                    message:"Error creating new project_task_weeks record",
                    result:e
                })
            }
        }
        console.log(nextWeekRecord);
        try{
            const result = await sql `
                INSERT INTO project_tasks(notes,created_date,project_id,user_id,project_task_weeks_id)
                VALUES(${notes}, ${new Date().toISOString().split("T")[0]}, ${projectId}, ${userId}, ${nextWeekRecord[0].id})
                RETURNING id , notes as name
            `

            res.status(201).json({
                status:"success",
                message:"Successfully inserted project tasks",
                result
            })
        }
        catch(e)
        {
            console.log(e);
            res.status(500).json({
                status:"failure",
                message:'Failed to create project task',
                result :e
            })
        }
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"Error in creating task",
            result : e
        })
    }

}

const getNextWeekProjectTasks = async(req,res)=>{
    const {projectId} = req.params;
    const today = new Date().toISOString().split('T')[0];
    console.log(today);
    try{
        const result = await sql   `
            SELECT 
                id,
                notes AS name
            FROM
                project_tasks pt
            WHERE 
                pt.project_id = ${projectId} AND
                pt.project_task_weeks_id IN
                (
                    SELECT 
                        id
                    FROM
                        project_task_weeks
                    WHERE 
                        start_date > ${today} 
                )
        `
        res.status(200).json({
            status:"success",
            message:"successfully retrieved next week project tasks",
            result
        })
    }
    catch(e)
    {
        res.status(500).json({
            status:"failure",
            message:"Failed to retrieve next week project tasks",
            result : e
        })
    }
}

const deleteNextWeekProjectTask = async(req,res)=>{
    const {id} = req.params;
    try{
        const result = await sql `
            DELETE FROM 
                project_tasks
            WHERE
                id=${id}
        `
        res.status(200).json({
            status:'success',
            message:"successFully deleted project task",
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

// HELPER FUNCTIONS

const getWeekStartDate = ()=>{
    const weekStartIndex = 1;
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0-sunday 1-monday

    let daysToNextWeekStart = (7-currentDayIndex+weekStartIndex)% 7;
    if(daysToNextWeekStart === 0) daysToNextWeekStart = 7;


    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + daysToNextWeekStart);

    return nextWeekStart.toISOString().split("T")[0];
}
function generateWeekName(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const monthName = startDate.toLocaleString('default', { month: 'long' });
  const year = startDate.getFullYear();
  const weekNumber = getWeekOfMonth(startDate);

  const start = startDate.getDate();
  const end = endDate.getDate();

  return `${monthName} ${year} W${weekNumber} (${start}-${end})`;
}

function getWeekOfMonth(date) {
  const day = date.getDate();
  const startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((day + startDay) / 7);
}




module.exports = {getProjectDetails,getProjectDeliverables , getPreviousMeetingNotes , createNextWeekProjectTask, getProjectTasksGroupedByWeek, getNextWeekProjectTasks, deleteNextWeekProjectTask};





