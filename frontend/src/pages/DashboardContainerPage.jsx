import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import ProjectCards from "../components/ProjectCards";
import DashboardPage from "./DashboardPage";
import Accordion from "../components/Accordion";
import ProjectTiles from "../components/ProjectTiles";
import ProjectSelectCard from "../components/ProjectSelectCard";

const DashboardContainerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("projectCards");
  const [selectedProject, setSelectedProject] = useState(null);
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  // Dummy projects data for selection
  const dummyProjects = [
    {
      id: 1,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "850,000 SAR",
      percent1: 10,
      percent2: 60,
      lastUpdated: "3 days ago",
      status: "danger",
    },
    {
      id: 2,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "1,400,000 SAR",
      percent1: 0,
      percent2: 90,
      lastUpdated: "3 days ago",
      status: "success",
    },
    {
      id: 3,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "120,000 SAR",
      percent1: 50,
      percent2: 20,
      lastUpdated: "3 days ago",
      status: "danger",
    },
  ];

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
            {/* Project Select Cards - global to accordion */}
            {!selectedProject && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {dummyProjects.map((project) => (
                  <ProjectSelectCard
                    key={project.id}
                    project={project}
                    onSelect={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
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
              {selectedProject && (
                <div className="mb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                    <button
                      className="inline-flex items-center border border-indigo-300 px-3 py-1.5 rounded-md text-blue-600 hover:bg-blue-50 mb-4"
                      onClick={() => setSelectedProject(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      <span className="ml-1 font-bold text-lg">Back</span>
                    </button>
                  </div>
                </div>
              )}
              {selectedProject && activeTab === "projectCards" && (
                <>
                  <ProjectTiles project={selectedProject} />
                  <ProjectCards project={selectedProject} />
                </>
              )}
              {selectedProject && activeTab === "dashboard" && (
                <DashboardPage project={selectedProject} />
              )}
              {!selectedProject && (
                <div className="text-center text-gray-400 py-12 text-lg">
                  Select a project to view details.
                </div>
              )}
            </div>
          </Accordion>
        </main>
      </div>
    </div>
  );
};

export default DashboardContainerPage;
