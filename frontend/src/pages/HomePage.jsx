import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import SidebarPage from "./SidebarPage";
import useAuth from "../hooks/userAuth";
const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { email, roles } = useAuth();
  console.log("email in HomePage", email);
  console.log("roles in HomePage", roles);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarPage
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main
          className={`flex-1 overflow-auto p-4 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          {/* Add your main content here */}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
