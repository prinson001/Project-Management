import React, { useEffect } from "react";
import UpdateDynamicForm from "./UpdateDynamicForm";

function InitiativeAccordion({ tableName, data, title }) {
  useEffect(() => {
    console.log("the initiative component got mounted");
  }, []);

  function handleSubmit() {
    console.log("submit button clicked");
  }

  return (
    <div className="w-full">
      <UpdateDynamicForm
        isEmbedded={true}
        title="Initiative Details"
        onSubmit={handleSubmit}
        tableName="initiative"
        data={data}
        viewData={true}
        className="w-full" // Add this prop
      />
    </div>
  );
}

export default InitiativeAccordion;
