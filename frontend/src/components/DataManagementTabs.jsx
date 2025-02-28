import React, { useState } from "react";

const DataManagementTabs = () => {
  const [activeTab, setActiveTab] = useState("initiatives");

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

  const getTabContent = (tabId) => {
    switch (tabId) {
      case "initiatives":
        return <div className="p-4">Initiatives content goes here</div>;
      case "portfolio":
        return <div className="p-4">Portfolio content goes here</div>;
      case "programs":
        return <div className="p-4">Programs content goes here</div>;
      case "projects":
        return <div className="p-4">Projects content goes here</div>;
      case "objectives":
        return <div className="p-4">Objectives content goes here</div>;
      case "departments":
        return <div className="p-4">Departments content goes here</div>;
      case "vendors":
        return <div className="p-4">Vendors content goes here</div>;
      case "team":
        return <div className="p-4">Team content goes here</div>;
      case "documents":
        return <div className="p-4">Documents content goes here</div>;
      default:
        return <div className="p-4">Select a tab to view content</div>;
    }
  };

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
      <div className="mt-4 bg-white rounded-b-lg shadow-sm dark:bg-gray-800">
        {getTabContent(activeTab)}
      </div>
    </div>
  );
};

export default DataManagementTabs;
