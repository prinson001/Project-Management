import React, { useState , useEffect } from "react";
import { Plus, ChevronRight } from "lucide-react";
import axiosInstance from "../axiosInstance";

const initialTasks = {
  completed: [
    { id: "1", title: "Conducted the review meeting with the client", completed: true },
    { id: "2", title: "Shared the business requirement document for review to the business team", completed: true },
    { id: "3", title: "Shared the quality check document with contract department", completed: true },
  ],
  planned: [
    { id: "4", title: "Conducted the review meeting with the client" },
    { id: "5", title: "Shared the business requirement document for review to the business team" },
    { id: "6", title: "Shared the quality check document with contract department" },
  ],
  previous: [
    { id: "7", title: "Conducted the review meeting with the client" },
    { id: "8", title: "Shared the business requirement document for review to the business team" },
  ],
};

export default function ProjectTasks({projectId}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [previousMeetings , setPreviousMeetings] = useState([]);
  const [selectedMeeting , setSelectedMeeting] = useState("");
  const [selectedMeetingNotes , setSelectedMeetingNotes] = useState([]);

  const fetchPreviousMeetingNotes = async()=>{
    const response = await axiosInstance.get(`/project-card/meeting-notes?projectid=${projectId}`);
    console.log("meeting notes in project task");
    console.log(response.data.result);
    setPreviousMeetings(response.data.result);
  }
  const fetchPreviousTasks = async()=>{
    const currentWeek = getWeekOfMonth(new Date());
    console.log("the current week is "+currentWeek)
  }
  function formatDateWithWeek(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const yearShort = date.getFullYear().toString().slice(-2);
  const week = getWeekOfMonth(date);

  return `${dayName} ${day} ${monthName} ${yearShort} (W${week})`;
}

  // Helper: calculate which week of the month
  function getWeekOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedDate = date.getDate() + dayOfWeek;
    return Math.ceil(adjustedDate / 7);
  }

  useEffect(()=>{
    fetchPreviousMeetingNotes();
    fetchPreviousTasks();
  },[projectId]);

  const handlePreviousMeetingChange = (meetingName)=>
  {
    setSelectedMeeting(meetingName);
    const meeting = previousMeetings.find(meeting=> meeting.name == meetingName);
    setSelectedMeetingNotes(meeting.meeting_notes);
  }
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        title: newTask.trim(),
      };
      setTasks((prev) => ({
        ...prev,
        planned: [...prev.planned, task],
      }));
      setNewTask("");
      setShowAddTask(false);
    }
  };

  const TaskList = ({ records, title , showFilter = false , filterOptions , selectedFilterOption , onChangeHandler}) => (
    <div className="mb-6">
      {showFilter && 
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-gray-900 mb-3">{title}</h3>
            <select
              className="text-sm border rounded px-2 py-1 text-gray-700 bg-white shadow-sm"
              value={selectedFilterOption}
              onChange={(e) => onChangeHandler(e.target.value)}
            >
              {filterOptions.map((option , i) => (
                <option key={i} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
        </div>
      }
      <div className="space-y-2">
        {records && records.map((task) => (
          <div key={task.id} className="flex items-start gap-2 text-sm text-gray-700">
            <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span >{records.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {showAddTask && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button
              onClick={addTask}
              className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTask("");
              }}
              className="text-sm px-3 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <TaskList 
        tasks={tasks.completed} 
        title="Previous Meeting Notes" 
        showFilter={true} 
        onChangeHandler={handlePreviousMeetingChange}
        selectedFilterOption={selectedMeeting}
        filterOptions={previousMeetings}
        records={selectedMeetingNotes} />
      <TaskList 
        tasks={tasks.previous} 
        title="Previous tasks"  
        showFilter={false}
        records={[]} />
      <TaskList 
        tasks={tasks.planned} 
        title="Planned tasks for next week" />
    </div>
  );
}
