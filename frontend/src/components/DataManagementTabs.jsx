import React from "react";
import useLanguage from "../hooks/useLanguage";

const DataManagementTabs = ({ activeTab, setActiveTab, renderAddButton }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: "initiatives", label: "initiatives", disabled: false },
    { id: "portfolio", label: "portfolio", disabled: false },
    { id: "programs", label: "programs", disabled: false },
    { id: "projects", label: "projects", disabled: false },
    { id: "objectives", label: "objectives", disabled: false },
    { id: "departments", label: "departments", disabled: false },
    { id: "vendors", label: "vendors", disabled: false },
    { id: "team", label: "team", disabled: false },
    { id: "documents", label: "documents", disabled: false },
  ];

  // Remove the getTabContent function as we'll handle content in the parent component
  return (
    <div className="w-full max-w-8xl mx-auto">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex items-center -mb-px">
          {" "}
          {/* Changed flex-wrap to items-center */}
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2">
              {tab.disabled ? (
                <span className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">
                  {t(tab.label)}
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
                  {t(tab.label)}
                </a>
              )}
            </li>
          ))}
          <li className="ml-auto flex-shrink-0">
            {" "}
            {/* Added flex-shrink-0 */}
            {renderAddButton && renderAddButton()}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataManagementTabs;
