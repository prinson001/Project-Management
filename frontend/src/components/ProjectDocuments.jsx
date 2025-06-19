import React, { useState  , useEffect, use} from "react";
import { StatusCard } from "../components/StatusCard";
import { SearchBar } from "../components/SearchBar";
import TableData from "../components/TableData";
import axiosInstance from "../axiosInstance";
import { constructNow } from "date-fns";

const defaultStatusData = [
  { title: "Initiation & Planning", count: 5, status: "completed" },
  { title: "Bidding", count: 7, status: "completed" },
  { title: "Pre- executing", count: 3, status: "completed" },
  { title: "Executing", count: 8, status: "warning" },
  { title: "Operation", count: 0, status: "default" },
  { title: "Total Documents", count: 21, status: "default" },
  { title: "Pending Approval", count: 2, status: "default" },
  { title: "Total Missing", count: 3, status: "default" },
];

const defaultDocumentsData = [
  {
    phaseName: "Initiation",
    documentName: "Signed Contract",
    fileName: "Project Contract.pdf",
    creationDate: "18-Jan-25",
    approvalStatus: "Approved",
    approvalDate: "19-Jan-25",
    approvedBy: "PMO- Ahmad Omar",
  },
  // ... Add more rows as needed
];

const columnSetting = [
  { columnName: "Phase", dbColumn: "phase", isVisible: true, isInput: false },
  { columnName: "Document Name", dbColumn: "document_name", isVisible: true, isInput: false },
  // { columnName: "Created Date", dbColumn: "created_at", isVisible: true, isInput: false },
  { columnName: "Document Template", dbColumn: "template_name", isVisible: true, isInput: false }
];

export default function ProjectDocuments({ className = "" , projectId , phaseName }) {
  const [tableData, setTableData] = useState(defaultDocumentsData);
  const [projectoverviewData, setProjectoverviewData ] = useState([]);
  const [projectDocumentsData ,setProjectDocumentsData ] = useState([]);
  const phasesMap = {
    'Planning phase': 1, 
    'Bidding phase' : 2, 
    'Pre-execution phase' : 3, 
    'Execution phase' : 4,
    'Maintenance and operation phase' : 5,
    'Closed phase' : 6

  }
  const sortTableData = (column, order) => {
    const sorted = [...tableData].sort((a, b) => {
      if (order === "ASC") return a[column] > b[column] ? 1 : -1;
      else return a[column] < b[column] ? 1 : -1;
    });
    setTableData(sorted);
  };

  const getData = async () => {
    // Normally you'd fetch data here; for now use defaults
    setTableData(defaultDocumentsData);
  };

  const fetchProjectDocumentOverview = async()=>{
    const result = await axiosInstance.get(`/project-card/project-documents-overview/${projectId}`)
    console.log(result);
    const projectOverView = result.data.result.map((e)=>{
      return {...e , order : phasesMap[e.project_phase]}
    })
    console.log("*******************************************");
    console.log(projectOverView)
    setProjectoverviewData(projectOverView);
  }
  const fetchProjectDocuments = async()=>{
    const result = await axiosInstance.get(`/project-card/project-documents/${projectId}`)
    console.log("the result of project documents");
    setProjectDocumentsData(result.data.result);
    setTableData(result.data.result.all);
  }
  useEffect(()=>{
    fetchProjectDocumentOverview();
    fetchProjectDocuments();
  },[projectId])
  
  return (
    <div className={`p-6 bg-white ${className}`}>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {projectoverviewData.map((item, index) => (
          <StatusCard
            key={index}
            title={item.project_phase}
            count={item.submitted_documents}
            status={item.missing_documents != "0" ? 'warning':'completed' }
          />
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search files"
          onSearch={(query) => {
            const filtered = projectDocumentsData.all.filter((row) =>
              Object.values(row).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
              )
            );
            setTableData(filtered);
          }}
          className="max-w-md ml-auto"
        />
      </div>

      {/* Reusable Table */}
      <TableData
        getData={getData}
        tableData={tableData}
        tableName="ProjectDocuments"
        setTableData={setTableData}
        showDate={true}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      />
    </div>
  );
}
