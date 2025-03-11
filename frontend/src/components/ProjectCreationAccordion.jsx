import React from "react";
import DynamicForm from "./DynamicForm";
import ProjectModal from "./ProjectModal";
function ProjectCreationAccordion({ project }) {
  return (
    <>
      <ProjectModal
        showButtons={false}
        title="Project details"
        readOnly={true}
      />
      ;
    </>
  );
}

export default ProjectCreationAccordion;
