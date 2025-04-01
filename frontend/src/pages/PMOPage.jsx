import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import useAuth from "../hooks/userAuth";
import DataManagementPage from "./DataManagementPage";
import Accordion from "../components/Accordion"; // Import the new Accordion component
import { Toaster } from "sonner";

const PMOPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { email, role } = useAuth();
  console.log("email in HomePage", email);
  console.log("roles in HomePage", role);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="text-sm flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <Toaster position="top-center" richColors />
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarPage
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-auto p-4">
          <Accordion
            title="Data Management"
            defaultOpen={true}
            className="mb-4"
          >
            <DataManagementPage />
          </Accordion>

          {/* You can add more accordions with other content */}
          {/* 
          <Accordion title="Another Section" defaultOpen={false} className="mb-4">
            <OtherComponent />
          </Accordion>
          */}
        </main>
      </div>
    </div>
  );
};

export default PMOPage;
