import React from "react";
import { Clock } from "lucide-react";

// Dummy project card for meetings page selection
export default function ProjectSelectCard({ project, onSelect }) {
  // project: { id, title, amount, percent1, percent2, lastUpdated, status }
  // status: 'danger', 'success', 'warning', etc.
  // percent1: left percent (red), percent2: right percent (green)

  // Color logic for border and progress bar
  const borderColor = project.status === 'danger' ? 'border-red-500' : 'border-gray-300';
  const progressBarColor = project.status === 'danger' ? 'bg-red-600' : 'bg-green-300';
  const percent1Color = project.status === 'danger' ? 'text-red-600' : 'text-green-600';
  const percent2Color = project.status === 'danger' ? 'text-gray-600' : 'text-green-600';

  return (
    <button
      className={`w-84 h-full text-left bg-white rounded-lg border ${borderColor} p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
      onClick={() => onSelect(project)}
    >
      <div className="font-medium text-sm mb-1 line-clamp-2">{project.name}</div>
      <div className="text-xl font-bold mb-2">{project.project_budget}</div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={percent1Color}>{project.percent1}%</span>
        <span className={percent2Color}>{project.percent2}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full mb-2">
        <div
          className={`${progressBarColor} h-3 rounded-full`}
          style={{ width: `${Math.max(project.percent1, project.percent2)}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="inline-flex items-center text-xs"><Clock className="w-4 h-4 mr-1 text-yellow-500" /> </span>
        <span className="text-xs text-gray-500 italic">Last updated: {project.lastUpdated}</span>
      </div>
    </button>
  );
}
