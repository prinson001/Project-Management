import React, { useState } from "react";
import { BarChart3, Menu } from "lucide-react";

export default function ProjectMeetingHeader({
  toggleSidebar,
  subFilters ,
  activeSubFilter,
  handleSubOptionClick
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center gap-4 px-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <span className="font-medium">Dashboard</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Close meeting
          </button>
        </div>
      </div>

      {/* Horizontal tabs for selected category options */}
      {subFilters && (
        <div className="border-t border-gray-200">
          <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto">
            {subFilters.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  handleSubOptionClick(option.name);
                }} // Pass category id and option
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium relative transition-colors ${
                  activeSubFilter === option.name
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
