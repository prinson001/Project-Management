import React, { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";

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

export default function ProjectTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

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

  const TaskList = ({ tasks, title }) => (
    <div className="mb-6">
      <h3 className="font-medium text-sm text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 text-sm text-gray-700">
            <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</span>
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

      <TaskList tasks={tasks.completed} title="Previous Meeting Notes" />
      <TaskList tasks={tasks.previous} title="Previous tasks" />
      <TaskList tasks={tasks.planned} title="Planned tasks for next week" />
    </div>
  );
}
