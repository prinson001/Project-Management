import React, { useEffect, useState } from "react";
import BoqTaskAccordion from "./BoqTaskAccordion";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
function BoqTaskApprovalAccordion({
  project,
  parentId,
  projectBudget,
  closeAccordion,
}) {
  const [boq_status, setBoq_status] = useState("Not Initiatied");

  const fetchProjectApprovalStatus = async () => {
    try {
      console.log("the related entity id");
      console.log(project.related_entity_id);
      const result = await axiosInstance.post(
        "/data-management/getProjectBoqApprovalStatus",
        {
          projectId: project.related_entity_id,
        }
      );
      console.log("the result of boq approval status");
      console.log(result);
      setBoq_status(result.data.approval_status);
    } catch (e) {
      console.log("errror in retreiving boq approval status");
    }
  };
  useEffect(() => {
    if (project.status == "Done") {
      fetchProjectApprovalStatus();
    }
  }, [project]);
  const updateApprovalStatus = async ({ status }) => {
    console.log("the project status passed is " + status);
    if (!project?.id) {
      console.error("Project ID is missing");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/data-management/updateBOQApprovalbyPMO`,
        {
          id: project.related_entity_id,
          approval: status,
        }
      );

      if (response.data.status === "success") {
        const response = await axiosInstance.post(
          `/data-management/updateTaskStatusToDone`,
          {
            taskId: project.id,
          }
        );

        toast.success(`Project status updated to: ${status}`);
        closeAccordion();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Error updating project status");
    }
  };

  const handleApproveBtnClick = () => {
    updateApprovalStatus({ status: "Approved" });
  };

  const handleRejectBtnClick = () => {
    console.log("reject button was clicked");
    updateApprovalStatus({ status: "Rejected" });
  };
  return (
    <div>
      <h1>BOQ details</h1>
      <BoqTaskAccordion
        isReadable={true}
        project={project}
        parentId={parentId}
        projectBudget={projectBudget}
      />
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
                project.approval_status == "Rejected"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {boq_status}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default BoqTaskApprovalAccordion;
