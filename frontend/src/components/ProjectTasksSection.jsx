import React from "react";
import {
  MoreHorizontal,
  Plus,
  ChevronDown,
  CheckCircle2,
  Circle,
  Flag,
} from "lucide-react";

const ProjectTasksSection = () => {
  const projectTasks = {
    lastMeeting: [
      { id: 1, text: "Send invitation to bidders", status: "overdue" },
      {
        id: 2,
        text: "Call for a meeting to discuss the latest deliverable",
        status: "completed",
      },
      {
        id: 3,
        text: "Issue a CR to modify delivery end date to November 15th",
        status: "overdue",
      },
    ],
    completed: [
      {
        id: 4,
        text: "Conducted the review meeting with the client",
        status: "completed",
      },
      {
        id: 5,
        text: "Shared the business requirement document for review to the business team",
        status: "completed",
      },
    ],
    toDo: [
      {
        id: 6,
        text: "Follow up on the training manual documents",
        status: "pending",
      },
      {
        id: 7,
        text: "Arrange for a meeting with external parties",
        status: "pending",
      },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "overdue":
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Project Tasks
      </h3>

      {/* Last Meeting Comments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-700">Last meeting comments</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Mon 21 April 25 (w 2)</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-3">
          {projectTasks.lastMeeting.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <span className="text-sm text-gray-700">{task.text}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="underline">New completed task</span>
          </button>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-700">
            Completed tasks from last week
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Mon 21 April 25 (w 2)</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-3">
          {projectTasks.completed.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <span className="text-sm text-gray-700">{task.text}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="underline">New completed task</span>
          </button>
        </div>
      </div>

      {/* To Do Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-700">
            To do tasks for next week
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Mon 21 April 25 (w 2)</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-3">
          {projectTasks.toDo.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <span className="text-sm text-gray-700">{task.text}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="underline">New to do task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTasksSection;
