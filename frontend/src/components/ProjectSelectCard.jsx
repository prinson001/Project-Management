import React from "react";
import { Clock } from "lucide-react";

// Project card for dashboard page selection
export default function ProjectSelectCard({ project, onSelect }) {
  // project: real project data from API with fields like id, name, project_budget, etc.
  
  // For now, using placeholder values for progress percentages since these might need calculation
  const percent1 = 10; // Placeholder - could be calculated from deliverables
  const percent2 = 60; // Placeholder - could be calculated from deliverables
  
  // Simple status logic based on project data (you can customize this)
  const status = 'success'; // Default status - you can add logic to determine this
  
  // Color logic for border and progress bar
  const borderColor = status === 'danger' ? 'border-red-500' : 'border-gray-300';
  const progressBarColor = status === 'danger' ? 'bg-red-600' : 'bg-green-300';
  const percent1Color = status === 'danger' ? 'text-red-600' : 'text-green-600';
  const percent2Color = status === 'danger' ? 'text-gray-600' : 'text-green-600';

  // Format budget if it exists
  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    return `${Number(budget).toLocaleString()} SAR`;
  };

  // Calculate last updated (placeholder for now)
  const getLastUpdated = () => {
    if (project.updated_at) {
      const updatedDate = new Date(project.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now - updatedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
    return "Recently";
  };

  return (
    <button
      className={`w-84 h-full text-left bg-white rounded-lg border ${borderColor} p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
      onClick={() => onSelect(project)}
    >
      <div className="font-medium text-sm mb-1 line-clamp-2">{project.name || project.title || "Unnamed Project"}</div>
      <div className="text-xl font-bold mb-2">{formatBudget(project.project_budget || project.budget)}</div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={percent1Color}>{percent1}%</span>
        <span className={percent2Color}>{percent2}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full mb-2">
        <div
          className={`${progressBarColor} h-3 rounded-full`}
          style={{ width: `${Math.max(percent1, percent2)}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="inline-flex items-center text-xs"><Clock className="w-4 h-4 mr-1 text-yellow-500" /> </span>
        <span className="text-xs text-gray-500 italic">Last updated: {getLastUpdated()}</span>
      </div>
    </button>
  );
}
