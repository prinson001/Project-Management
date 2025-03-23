import React, { useState } from "react";
import AdminTabs from "../components/AdminTabs";
import MainRoles from "../components/MainRoles";
import ProjectTimelineSettings from "./ProjectTimelineSettings";
import Expected from "../pages/Expected";
import Loader from "../components/Loader";
import AddUserModal from "../components/AddUserModal"; // Import AddUserModal

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); // State for modal

  const getTabContent = () => {
    switch (activeTab) {
      case "roles":
        return <MainRoles onAddUser={() => setIsAddUserModalOpen(true)} />; // Pass handler to MainRoles
      case "schedule":
        return <ProjectTimelineSettings />;
      case "activities":
        return <Expected />;
      default:
        return null;
    }
  };

  return (
    <>
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-4">{getTabContent()}</div>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        refreshUsers={() => console.log("Refresh users")} // Placeholder for refresh logic
      />
    </>
  );
};

export default SystemSettingsPage;
