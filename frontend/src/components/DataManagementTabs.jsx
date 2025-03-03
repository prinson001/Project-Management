import React, { useState } from "react";

const DataManagementTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "initiatives", label: "Initiatives", disabled: false },
    { id: "portfolio", label: "Portfolio", disabled: false },
    { id: "programs", label: "Programs", disabled: false },
    { id: "projects", label: "Projects", disabled: false },
    { id: "objectives", label: "Objectives", disabled: false },
    { id: "departments", label: "Departments", disabled: false },
    { id: "vendors", label: "Vendors", disabled: false },
    { id: "team", label: "Team", disabled: false },
    { id: "documents", label: "Documents", disabled: false },
  ];

  // Remove the getTabContent function as we'll handle content in the parent component
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2">
              {tab.disabled ? (
                <span className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">
                  {tab.label}
                </span>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab.id);
                  }}
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  {tab.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataManagementTabs;
