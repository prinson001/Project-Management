import React from "react";

export default function ProjectMeetingMainSection({
  currentCategory,
  activeOption,
  mainContent,
}) {
  return (
    <main className="flex-1 p-6 w-full">
      <div className="grid grid-cols-10 gap-1 mb-6">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`text-sm font-medium rounded-md transition-colors w-8 h-8 flex items-center justify-center ${
              num === 2
                ? "bg-green-500 text-white hover:bg-green-600"
                : "border border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400">Project Card</h2>
          <p className="text-sm text-gray-400 mt-2">
            Filtered by: {currentCategory?.title} → {activeOption}
          </p>
        </div>
      </div>
      {mainContent}
    </main>
  );
}
