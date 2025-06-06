import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import ProjectCards from "../components/ProjectCards";
import DashboardPage from "./DashboardPage";
import Accordion from "../components/Accordion";
import ProjectTiles from "../components/ProjectTiles";

const DashboardContainerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("projectCards");
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  const tabs = [
    { id: "projectCards", label: "Project Cards" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarPage
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-auto p-4">
          <Accordion title="Dashboard" defaultOpen={true} className="mb-4">
            {/* Tab Navigation - Consistent with DataManagementTabs */}
            <div className="w-full max-w-8xl mx-auto">
              <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                <ul className="flex items-center -mb-px">
                  {tabs.map((tab) => (
                    <li key={tab.id} className="me-2">
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
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Tab Content */}
            <div>
              {activeTab === "projectCards" ? (
                <>
                  <ProjectTiles />
                  <ProjectCards />
                </>
              ) : (
                <DashboardPage />
              )}
            </div>
          </Accordion>
        </main>
      </div>
    </div>
  );
};

export default DashboardContainerPage;
