import React from "react";
import useLanguage from "../hooks/useLanguage";

const defaultTabs = [
  { id: "kpis", label: "KPIs", disabled: false },
  { id: "deliverables", label: "Deliverables", disabled: false },
  { id: "financial", label: "Financial", disabled: false },
  { id: "projectManagers", label: "Project Managers", disabled: false },
  { id: "projection", label: "Projection", disabled: false },
  { id: "projectCards", label: "Project Cards", disabled: false },
];

const DashboardTabs = ({ activeTab, setActiveTab, renderAddButton, tabs }) => {
  const { t } = useLanguage();

  const tabList = tabs
    ? tabs.map((tab) => ({
        id: tab.value || tab.id,
        label: tab.label,
        disabled: tab.disabled || false,
      }))
    : defaultTabs;

  return (
    <div className="w-full max-w-8xl mx-auto">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex items-center -mb-px">
          {tabList.map((tab) => (
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
            {renderAddButton && renderAddButton()}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardTabs;
