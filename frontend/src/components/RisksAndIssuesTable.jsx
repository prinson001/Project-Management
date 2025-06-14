import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { useForm } from "react-hook-form"; // Added for react-hook-form
import { X } from "lucide-react";
import TableData from "../components/TableData"; // Adjust the import path if necessary
import axiosInstance from "../axiosInstance";

const sampleRisks = [
  {
    id: "R-101",
    caseName: "Login Timeout Issue",
    type: "Issue",
    createdBy: "Alex",
    creationDate: "2025-06-01",
    owner: "Taylor",
    severity: "High",
    status: "Open",
  },
  {
    id: "R-102",
    caseName: "Payment Gateway Delay",
    type: "Risk",
    createdBy: "Jordan",
    creationDate: "2025-06-05",
    owner: "Morgan",
    severity: "Medium",
    status: "Closed",
  },
];

const columnSetting = [
  { columnName: "ID", dbColumn: "id", isVisible: true, isInput: false },
  { columnName: "Case Name", dbColumn: "caseName", isVisible: true, isInput: false, type: "text" }, // Changed isInput to false
  { columnName: "Type", dbColumn: "type", isVisible: true, isInput: false },
  { columnName: "Created By", dbColumn: "createdBy", isVisible: true, isInput: false },
  { columnName: "Creation Date", dbColumn: "creationDate", isVisible: true, isInput: false },
  { columnName: "Owner", dbColumn: "owner", isVisible: true, isInput: false },
  { columnName: "Severity", dbColumn: "severity", isVisible: true, isInput: false },
  { columnName: "Status", dbColumn: "status", isVisible: true, isInput: false },
];

const AddRiskModal = ({ onClose, deliverables }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      riskName: "",
      deliverableId: "",
      projectId: "", // Added projectId for the new toggle
      phaseName: "",
      responsePlan: "",
      riskStatus: "Open",
    },
  });
  const [linkToProject, setLinkToProject] = useState(false);
  const [projects, setProjects] = useState([]);

  // Placeholder: Fetch projects. Replace with your actual data fetching logic.
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Example: const response = await axiosInstance.get("/projects");
        // setProjects(response.data.result || []);
        setProjects([
          { id: "proj-1", name: "Project Alpha" },
          { id: "proj-2", name: "Project Beta" },
          { id: "proj-3", name: "Project Gamma" },
        ]);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const onSubmitRisk = (data) => {
    console.log("Form data before processing:", data);
    const submissionData = { ...data };
    if (linkToProject) {
      delete submissionData.deliverableId;
    } else {
      delete submissionData.projectId;
    }
    console.log("Processed form data for submission:", submissionData);
    // onSaveRisk(submissionData); // Call your actual save function
    onClose();
  };

  const handleToggleChange = () => {
    const newLinkToProject = !linkToProject;
    setLinkToProject(newLinkToProject);
    if (newLinkToProject) { // Switched to Project
      setValue("deliverableId", "");
    } else { // Switched to Deliverable
      setValue("projectId", "");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative shadow-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Risk</h2>

        <form onSubmit={handleSubmit(onSubmitRisk)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Risk Name</label>
            <input
              type="text"
              {...register("riskName", { required: "Risk name is required" })}
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              placeholder="Enter risk name"
            />
            {errors.riskName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.riskName.message}
              </p>
            )}
          </div>

          <div className="my-4"> {/* Added margin for spacing */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={linkToProject}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {linkToProject ? "Link to Project" : "Link to Deliverable"}
              </span>
            </label>
          </div>

          {!linkToProject ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Deliverable name
              </label>
              <select
                {...register("deliverableId", {
                  required: !linkToProject ? "Deliverable is required" : false,
                })}
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              >
                <option value="">Select Deliverable</option>
                {deliverables &&
                  deliverables.map((deliverable) => (
                    <option key={deliverable.id} value={deliverable.id}>
                      {deliverable.name}
                    </option>
                  ))}
              </select>
              {errors.deliverableId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.deliverableId.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">
                Project name
              </label>
              <select
                {...register("projectId", {
                  required: linkToProject ? "Project is required" : false,
                })}
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                defaultValue=""
              >
                <option value="" disabled>Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.projectId.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Phase name</label>
            <select
              {...register("phaseName", { required: "Phase name is required" })}
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              defaultValue=""
            >
              <option value="" disabled>Select Phase</option>
              <option>Bidding</option>
              <option>Execution</option>
            </select>
            {errors.phaseName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phaseName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Response Plan
            </label>
            <textarea
              {...register("responsePlan", {
                required: "Response plan is required",
              })}
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              rows={3}
              placeholder="Enter response plan"
            />
            {errors.responsePlan && (
              <p className="text-red-500 text-xs mt-1">
                {errors.responsePlan.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Risk status
            </label>
            <select
              {...register("riskStatus", {
                required: "Risk status is required",
              })}
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              defaultValue="Open"
            >
              <option value="" disabled>Select Status</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
            {errors.riskStatus && (
              <p className="text-red-500 text-xs mt-1">
                {errors.riskStatus.message}
              </p>
            )}
          </div>

          <div className="flex justify-start gap-4 mt-6">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-6 py-2 rounded"
              onClick={onClose} // Assuming this button is for cancel/close
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded"
            >
              Save Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RisksAndIssuesTable = ({ projectId, deliverables }) => {
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState(sampleRisks);

  const fetchRiskAndIssues =async(id)=>{
    const response =await  axiosInstance.get(`/project-card/risk?projectid=${id}`);
    console.log("risks and issues");
    console.log(response);
    setTableData(response.data.result);
  }
  useEffect(()=>{
    fetchRiskAndIssues(projectId);
  },[projectId]);


  const addRisk = async()=>{
    const response = await axiosInstance.post("/project-card/risk",{
      // {caseName , dueDate , comments  , phaseName , linkedToType , linkedToId } variable needs to pass
      
    })
  }
  const sortTableData = (column, order) => {
    const sorted = [...tableData].sort((a, b) =>
      order === "ASC"
        ? a[column]?.localeCompare(b[column])
        : b[column]?.localeCompare(a[column])
    );
    setTableData(sorted);
  };

  const getData = async () => {
    // Simulate data fetch
    return sampleRisks;
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          + Add Risk
        </button>
      </div>

      <TableData
        getData={getData}
        tableData={tableData}
        tableName="risksAndIssues"
        setTableData={setTableData}
        showDate={true}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      />

      {showModal && <AddRiskModal onClose={() => setShowModal(false)} deliverables={deliverables} />}
    </>
  );
};

export default RisksAndIssuesTable;
