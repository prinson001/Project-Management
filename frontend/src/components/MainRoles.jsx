import React from "react";
import TasksPage from "../pages/TasksPage";
const MainRoles = () => {
  return (
    <div>
      <TasksPage tableName="users" accordionComponentName="userAccordion" />
    </div>
  );
};

export default MainRoles;
