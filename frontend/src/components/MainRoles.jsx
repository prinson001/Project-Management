import React from "react";
import DataSection from "../pages/DataSection";

const MainRoles = ({ onAddUser }) => {
  return (
    <div>
      <h2>Main Roles</h2>
      <div className="flex justify-end mb-4"> {/* Add flex container */}
        <button
          onClick={onAddUser}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add User
        </button>
      </div>
      <DataSection tableName="users" accordionComponentName="userAccordion" />
    </div>
  );
};

export default MainRoles;
