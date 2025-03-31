import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import DynamicForm from "./DynamicForm";
import ProjectModal from "./ProjectModal";
import UpdateProjectModal from "./UpdateProjectModal";
import { toast } from "sonner";
import { constructNow } from "date-fns";

function ProjectCreationAccordion({ project, closeAccordion }) {
  const [projectData, setProjectData] = useState(null);
  const [projectApproval, setProjectApproval] = useState("null");
  const fetchProjectApprovalStatus = async () => {
    try {
      if (project.status === "Done") {
        const result = await axiosInstance.post(
          "/deputy/getProjectApprovalStatus",
          {
            projectId: project.related_entity_id,
          }
        );
        console.log(result.data.approval_status);
        setProjectApproval(result.data.approval_status);
        project = { ...project, approval_status: result.data.approval_status };
      }
      if (project) {
        console.log("the project details in if block");
        console.log(structuredClone(project));
        const modifiedProjectData = {
          id: project.related_entity_id, // Use related_entity_id as id
          name: project.project_name, // Map project_name to name
          arabic_name: project.arabic_first_name, // Map arabic_first_name to arabic_name
          description: project.description,
          project_type_id: project?.project_type_id,
          current_phase_id: project?.current_phase_id,
          category: project?.category,
          project_manager_id: project?.assigned_to, // Assuming assigned_to is the project manager
          alternative_project_manager_id:
            project?.alternative_project_manager_id,
          execution_start_date: project?.execution_start_date,
          execution_duration: project?.execution_duration,
          maintenance_duration: project?.maintenance_duration,
          project_budget: project?.project_budget,
          approved_project_budget: project?.approved_project_budget,
          created_date: project?.created_date,
          updated_at: project?.updated_at,
          program_id: project?.program_id,
          initiative_id: project?.initiative_id,
          portfolio_id: project?.portfolio_id,
          vendor_id: project?.vendor_id,
        };

        setProjectData(modifiedProjectData);
        console.log("modifiedProjectData", modifiedProjectData);
      } else {
        console.log("error");
      }
    } catch (e) {
      console.log("there was an errror fetching project approval status");
      console.log(e);
      console.log(e.message);
    }
  };
  useEffect(() => {
    console.log("the project details");
    console.log(structuredClone(project));
    fetchProjectApprovalStatus();
  }, [project]);

  const updateApprovalStatus = async ({ status, projectData }) => {
    console.log("the project status passed is " + status);
    console.log("updating approval status:", projectData);
    if (!projectData?.id) {
      console.error("Project ID is missing");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/deputy/updateApprovalStatus`,
        {
          id: projectData.id,
          approval: status,
        }
      );

      if (response.data.status === "success") {
        closeAccordion("Success ", "success");
        const response = await axiosInstance.post(
          `/deputy/updateTaskStatusToDone`,
          {
            taskId: project.id,
          }
        );

        console.log(`Project status updated to: ${status}`);

        toast.success("Project status updated successfully");
      } else {
        console.error(response.data.message);
        toast.error("Error updating project status");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      alert("Error updating project status");
    }
  };

  const handleApproveBtnClick = () => {
    updateApprovalStatus({ status: "Approved", projectData });
  };

  const handleRejectBtnClick = () => {
    console.log("reject button was clicked");
    updateApprovalStatus({ status: "Rejected", projectData });
  };

  return (
    <>
      {projectData && (
        <UpdateProjectModal
          showButtons={false}
          title="Project details"
          readOnly={true}
          projectData={projectData}
        />
      )}
      {project.status != "Done" && (
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
      )}
      {project.status == "Done" && (
        <div className="flex align-center justify-center p-4">
          <p>
            Project was{" "}
            <span
              className={
                projectApproval == "Rejected"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {projectApproval}
            </span>
          </p>
        </div>
      )}
    </>
  );
}

export default ProjectCreationAccordion;
