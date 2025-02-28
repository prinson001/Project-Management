import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import useAuth from "../hooks/userAuth";
import DataManagementPage from "./DataManagementPage";

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { email, role } = useAuth();
  console.log("email in HomePage", email);
  console.log("roles in HomePage", role);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <TopHeader />
      {/* Add pt-14 to create space for the TopHeader which is approximately 3.75rem tall */}
      <div className="flex flex-1 overflow-hidden relative ">
        <SidebarPage
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-auto p-4">
          <DataManagementPage />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
