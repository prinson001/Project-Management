import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Plus } from "lucide-react"; // Added Plus icon
import Pagination from "../components/Pagination";

// IMPORTING CHILDREN COMPONENTS

import TableData from "../components/TableData";
import TableConfig from "../components/TableConfig";
import TableConfigFilter from "../components/TableConfigFilter";
import DataManagementTabs from "../components/DataManagementTabs";
import StackTable from "../components/StackTable";
import DynamicForm from "../components/DynamicForm";

let tablefilters = {};
let sortClause = {};
let dateFilter = null;
let page = 1;
const DataManagementPage = () => {
  const [activeTab, setActiveTab] = useState("initiatives");
  const [columnSetting, setColumnSetting] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDate, setShowDate] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  let originalTableData = [];
  // Form field definitions for different tabs
  const formFields = {
    initiative: [
      { name: "initiativeEnglishName", label: "Initiative English Name", type: "text", required: true, columnSpan: 1 },
      { name: "initiativeArabicName", label: "اسم المبادرة بالعربي", type: "text", required: true, columnSpan: 1, className: "text-right" },
      { name: "descriptionEnglish", label: "Description in English", type: "textarea", required: true, columnSpan: 2 },
      { name: "descriptionArabic", label: "الوصف بالعربي", type: "textarea", required: true, columnSpan: 2, className: "text-right" }
    ],
    portfolio: [
      { name: "portfolioEnglishName", label: "Portfolio English Name", type: "text", required: true, columnSpan: 1 },
      { name: "portfolioArabicName", label: "اسم المحفظة بالعربي", type: "text", required: true, columnSpan: 1, className: "text-right" },
      { name: "portfolioManager", label: "Portfolio Manager", type: "select", required: true, columnSpan: 1, options: ["Manager 1", "Manager 2", "Manager 3"] },
      { name: "descriptionEnglish", label: "Description in English", type: "textarea", required: true, columnSpan: 2 },
      { name: "descriptionArabic", label: "الوصف بالعربي", type: "textarea", required: true, columnSpan: 2, className: "text-right" }
    ],
    objective: [
      { name: "objectiveEnglishName", label: "Objective English Name", type: "text", required: true, columnSpan: 1 },
      { name: "objectiveArabicName", label: "اسم الهدف بالعربي", type: "text", required: true, columnSpan: 1 },
      { name: "descriptionEnglish", label: "Description in English", type: "textarea", required: true, columnSpan: 2 },
      { name: "descriptionArabic", label: "الوصف بالعربي", type: "textarea", required: true, columnSpan: 2 }
    ],
    program: [
      { name: "programEnglish", label: "Program English Name", type: "text", required: true, columnSpan: 1 },
      { name: "programArabic", label: "اسم البرنامج بالعربي", type: "text", required: true, columnSpan: 1 },
      { name: "programManager", label: "Program Manager", type: "select", options: ["Manager 1", "Manager 2"], required: true, columnSpan: 1 },
      { name: "descriptionEnglish", label: "Description in English", type: "textarea", required: true, columnSpan: 2 },
      { name: "descriptionArabic", label: "الوصف بالعربي", type: "textarea", required: true, columnSpan: 2 }
    ],
    department: [
      { name: "departmentEnglish", label: "Department English Name", type: "text", required: true, columnSpan: 1 },
      { name: "departmentArabic", label: "اسم الإدارة بالعربي", type: "text", required: true, columnSpan: 1 }
    ],
    vendor: [
      { name: "vendorEnglish", label: "Vendor English Name", type: "text", required: true, columnSpan: 1 },
      { name: "vendorArabic", label: "اسم المورد بالعربي", type: "text", required: true, columnSpan: 1 }
    ],
    member: [
      { name: "firstNameEnglish", label: "First Name in English", type: "text", required: true, columnSpan: 1 },
      { name: "firstNameArabic", label: "الاسم الأول للمستخدم بالعربي", type: "text", required: true, columnSpan: 1, className: "text-right" },
      { name: "familyNameEnglish", label: "Family Name in English", type: "text", required: true, columnSpan: 1 },
      { name: "familyNameArabic", label: "اسم العائلة للمستخدم بالعربي", type: "text", required: true, columnSpan: 1, className: "text-right" },
      { name: "email", label: "Email Address", type: "email", required: true, columnSpan: 1 },
      { name: "password", label: "Password", type: "password", required: true, columnSpan: 1 },
      { name: "rewritePassword", label: "Re-write Password", type: "password", required: true, columnSpan: 1, className: "col-start-2" },
      { name: "department", label: "User Department", type: "select", required: true, columnSpan: 1, options: ["HR", "Engineering", "Marketing"] },
      { name: "role", label: "User Role", type: "select", required: true, columnSpan: 1, options: ["Admin", "Program Manager", "User"] }
    ]
  };
  // Reset state when tab changes
  useEffect(() => {
    tablefilters = {};
    sortClause = {};
    dateFilter = null;
    page = 1;
    setTableData([]);
    setPagination({});
    setColumnSetting([]);
    setShowForm(false);
    // Get data for the selected tab
    getSetting();
    getData();
  }, [activeTab]);
  useEffect(() => {
    console.log("Component Mounted!");
  
    return () => {
      console.log("Component Unmounted!");
    };
  }, []);
  // Function to get singular form of tab name
  const getSingularTabName = () => {
    // Special cases for tabs with irregular singular forms
    if (activeTab === "members") {
      return "member";
    } else if (activeTab === "portfolios") {
      return "portfolio";
    } else if (activeTab === "activities") {
      return "activity";
    } else if (activeTab === "companies") {
      return "company";
    } else if (activeTab === "team") {
      return "member";
    }
    
    // Regular case - remove 's' from the end
    return activeTab.endsWith('s') ? activeTab.slice(0, -1) : activeTab;
  };
  
  // Handle add button click - now opens the form
  const handleAddButtonClick = () => {
    setShowForm(true);
  };
  // Handle form submission
  const handleFormSubmit = async (data) => {
    console.log(`${getSingularTabName()} Data:`, data);
    
    try {
      // You can add API call here to save the data
      const result = await axios.post(
        `http://localhost:4000/data-management/add${getSingularTabName()}`,
        {
          ...data,
          userId: 1,
        }
      );
      
      console.log("Form submission result:", result);
      
      // Refresh data after successful submission
      getData();
      
      // Close the form
      setShowForm(false);
    } catch (e) {
      console.log("Error submitting form:", e);
    }
  };
  async function getSetting() {
    try {
      const result = await axios.post(
        "http://localhost:4000/data-management/setting",
        {
          tableName: getSingularTabName(),
          userId: 1,
        }
      );
      console.log("Table setting");
      console.log(result.data.result[0].setting.setting);
      const data = result.data.result[0].setting.setting;
      setColumnSetting((state) => data);
    } catch (e) {
      console.log(e);
    }
  }
  async function getData() {
    try {
      const result = await axios.post(
        "http://localhost:4000/data-management/data",
        {
          tableName: activeTab.slice(0, -1), // Remove 's' from the end to get singular form
          userId: 1,
        }
      );
      console.log("the data");
      console.log(result);
      originalTableData = result.data.result;
      setTableData((state) => result.data.result);
      setPagination((state) => result.data.pagination);
    } catch (e) {
      console.log(e);
    }
  }
  async function getFilteredData() {
    try {
      const result = await axios.post(
        "http://localhost:4000/data-management/filtereddata",
        {
          tableName: activeTab.slice(0, -1), // Remove 's' from the end to get singular form
          userId: 1,
          filters: tablefilters,
          sort: sortClause,
          dateFilter,
          page,
        }
      );
      console.log(result);
      setTableData((state) => result.data.result);
      setPagination((state) => result.data.pagination);
    } catch (e) {
      console.log("there was an error");
      console.log(e);
    }
  }
  async function filterTable(filters) {
    if (Object.keys(filters) == 0) {
      tablefilters = {};
    } else {
      tablefilters = { ...tablefilters, ...filters };
    }
    await getFilteredData();
  }
  async function filterTableBasedonSearchTerm(searchTerm) {
    console.log(tablefilters);
    tablefilters.searchTerm = searchTerm;
    console.log(tablefilters);
    await getFilteredData();
  }
  async function sortTableData(dbColumn, order) {
    console.log(dbColumn, order);
    console.log(tablefilters);
    sortClause = {};
    sortClause[dbColumn] = order;
    await getFilteredData();
  }
  async function filterBasedOnDays(input) {
    console.log(tablefilters);
    dateFilter = input;
    getFilteredData();
  }
  async function getPageData(NavigatePage) {
    page = NavigatePage;
    await getFilteredData();
  }
  function updateShowDateFunctionality() {
    setShowDate((state) => !state);
  }
  return (
    <>
      <DataManagementTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto relative z-10 p-5 h-full">
        {/* Add button row - removed table settings button */}
        <div className="flex justify-between items-center mb-4">
          <div></div> {/* Empty div for spacing */}
          <div className="flex space-x-2">
            <button
              onClick={handleAddButtonClick}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add new {getSingularTabName()}
            </button>
          </div>
        </div>
        
        {/* Dynamic Form Modal */}
        {showForm && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="max-w-3xl bg-white p-6 rounded-lg shadow-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add {getSingularTabName()}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <DynamicForm 
                title={`Add ${getSingularTabName()}`} 
                fields={formFields[getSingularTabName()] || []} 
                onSubmit={handleFormSubmit} 
                isEmbedded={true}
              />
            </div>
          </div>
        )}
        <TableConfigFilter
          filterTable={filterTable}
          filterBasedOnDays={filterBasedOnDays}
          updateShowDateFunctionality={updateShowDateFunctionality}
          showDate={showDate}
          columnSetting={columnSetting}
          filterTableBasedonSearchTerm={filterTableBasedonSearchTerm}
          setColumnSetting={setColumnSetting}
        ></TableConfigFilter>
        
        {/* Add a container with overflow handling for the resizable table */}
        <div className="overflow-x-auto">
          <TableData
            tableData={tableData}
            showDate={showDate}
            sortTableData={sortTableData}
            columnSetting={columnSetting}
          ></TableData>
        </div>
        {/* <Pagination pagination={pagination} getPageData={getPageData} /> */}
        {/* Add global CSS for resizable columns */}
        <style jsx global>{`
          .resizer {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 5px;
            background: rgba(0, 0, 0, 0.1);
            cursor: col-resize;
            user-select: none;
            touch-action: none;
          }
          
          .resizer.isResizing {
            background: rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </>
  );
};

export default DataManagementPage;
