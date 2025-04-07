import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import DynamicForm from "./DynamicForm";
import ProjectModal from "./ProjectModal";
import UpdateProjectModal from "./UpdateProjectModal";
import { toast } from "sonner";
import { constructNow } from "date-fns";
import useAuthStore from "../store/authStore";

function ProjectCreationAccordion({ project, closeAccordion }) {
  const [projectData, setProjectData] = useState(null);
  const [projectApproval, setProjectApproval] = useState("null");
  const [isDataReady, setIsDataReady] = useState(false);
  const { users, projectTypes, projectPhases, setDocuments, documents } =
    useAuthStore();

  const fetchFullProjectData = async () => {
    try {
      setIsDataReady(false);

      // Fetch approval status if needed
      if (project.status === "Done") {
        const result = await axiosInstance.post(
          "/deputy/getProjectApprovalStatus",
          { projectId: project.related_entity_id }
        );
        setProjectApproval(result.data.approval_status);
      }

      // Fetch complete project details
      const response = await axiosInstance.post(
        "/tasks/getProjectWithAllRelatedData",
        {
          projectId: project.related_entity_id,
        }
      );

      const fullData = response.data.result;
      const fullProject = fullData.project;

      const modifiedProjectData = {
        id: fullProject.id,
        name: fullProject.name,
        arabic_name: fullProject.arabic_name,
        description: fullProject.description,
        project_type_id: fullProject.project_type_id?.toString() || "",
        current_phase_id: fullProject.current_phase_id?.toString() || "",
        category: fullProject.category,
        project_manager_id: fullProject.project_manager_id?.toString() || "",
        alternative_project_manager_id:
          fullProject.alternative_project_manager_id?.toString() || "",
        execution_start_date: fullProject.execution_start_date,
        execution_duration: fullProject.execution_duration,
        maintenance_duration: fullProject.maintenance_duration,
        project_budget: fullProject.project_budget,
        approved_project_budget: fullProject.approved_project_budget,
        approval_status: projectApproval || fullProject.approval_status,
        program_id: fullProject.program_id?.toString() || "",
        initiative_id: fullProject.initiative_id?.toString() || "",
        portfolio_id: fullProject.portfolio_id?.toString() || "",
        vendor_id: fullProject.vendor_id?.toString() || "",
        beneficiary_departments: fullProject.beneficiary_departments || [],
        objectives: fullProject.objectives || [],
        documents: fullProject.documents || [],

        // Optionally include related program, portfolio, initiative info if needed:
        program: fullData.program || {},
        portfolio: fullData.portfolio || {},
        initiative: fullData.initiative || {},
      };

      setProjectData(modifiedProjectData);
      setIsDataReady(true);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setIsDataReady(false);
    }
  };

  useEffect(() => {
    if (project) {
      fetchFullProjectData();
    }
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
      {isDataReady && projectData && (
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
