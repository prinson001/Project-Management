import React from "react";
import axiosInstance from "../axiosInstance";
import DynamicForm from "./DynamicForm";
import ProjectModal from "./ProjectModal";

function ProjectCreationAccordion({ project }) {
  const updateApprovalStatus = async (status) => {
    if (!project?.id) {
      console.error("Project ID is missing");
      return;
    }

    try {
      const response = await axiosInstance.put(
        "http://localhost:4000/deputy/updateApprovalStatus",
        {
          id: project.id,
          approval: status,
        }
      );

      if (response.data.status === "success") {
        console.log(`Project status updated to: ${status}`);
        alert(`Project status updated to: ${status}`);
      } else {
        console.error(response.data.message);
        alert(`Failed to update status: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      alert("Error updating project status");
    }
  };

  const handleApproveBtnClick = () => {
    updateApprovalStatus("Approved");
  };

  const handleRejectBtnClick = () => {
    updateApprovalStatus("Rejected");
  };

  return (
    <>
      <ProjectModal
        showButtons={false}
        title="Project details"
        readOnly={true}
      />
      <div className="py-10 flex justify-center gap-6">
        <button
          onClick={handleRejectBtnClick}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
        >
          Reject
        </button>
        <button
          onClick={handleApproveBtnClick}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-sm shadow-md transition duration-200"
        >
          Approve
        </button>
      </div>
    </>
  );
}

export default ProjectCreationAccordion;
