import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import useAuth from "../hooks/userAuth";
import Accordion from "../components/Accordion";
import DataSection from "./DataSection";
import { Toaster } from "sonner";

const DeputyPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { email, role } = useAuth();
  console.log("email in DeputyPage", email);
  console.log("roles in DeputyPage", role);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <Toaster position="top-center" richColors />
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarPage
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-auto p-4">
          <Accordion title="Tasks" defaultOpen={true} className="mb-4">
            <DataSection tableName="tasks" showTableConfig={true} />
          </Accordion>

          {/* You can add more accordions with other deputy-specific content */}
          {/* 
          <Accordion title="Project Approvals" defaultOpen={false} className="mb-4">
            <OtherComponent />
          </Accordion>
          */}
        </main>
      </div>
    </div>
  );
};

export default DeputyPage;
