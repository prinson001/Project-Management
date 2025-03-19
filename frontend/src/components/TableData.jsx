import React, { useState, useRef, useEffect } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import {
  Edit,
  Trash2,
  ChevronDown,
  Stethoscope,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import UserAccordion from "./UserAccordion";
import BoqTaskAccordion from "../components/BoqTaskAccordion";
import ProjectCreationAccordion from "../components/ProjectCreationAccordion";
import DeliverableAccordion2 from "../components/DeliverableAccordion2";
import DeliverableAccordion from "../components/DeliverableAccordion";
import UpdateDynamicForm from "./UpdateDynamicForm";
import InitiativeAccordion from "./initiativeAccordion";
import PortfolioAccordion from "./portfolioAccordion";
import ProgramAccordion from "./programAccordion";
import TeamAccordion from "./TeamAccordion";
import axiosInstance from "../axiosInstance";
import Loader from "./Loader";
const PORT = import.meta.env.VITE_PORT;

const TableData = ({
  getData,
  tableData,
  tableName,
  setTableData,
  showDate,
  sortTableData,
  columnSetting,
  accordionComponentName,
}) => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [changedinput, setChangedinput] = useState({});
  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);
  const [totalTableWidth, setTotalTableWidth] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize column widths and track visible columns
  useEffect(() => {
    const initialWidths = {};
    const visible = [];
    let totalWidth = 0;

    columnSetting.forEach((column) => {
      if (column.isVisible) {
        const width = column.width || 150; // Default width of 150px instead of "auto"
        initialWidths[column.dbColumn] = width;
        totalWidth += typeof width === "number" ? width : 150;
        visible.push(column.dbColumn);
      }
    });

    setColumnWidths(initialWidths);
    setTotalTableWidth(totalWidth);
    setVisibleColumns(visible);
  }, [columnSetting]);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setLoading(false); // Data is ready, stop loading
    } else {
      setLoading(true); // Data is not ready, start loading
    }
  }, [tableData]);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleFormData = async (formData) => {
    console.log("Form data update called");

    const { id, ...updatedData } = formData;
    toggleForm(-1);
    try {
      const result = await axiosInstance.post(
        `/data-management/update${tableName}`,
        {
          id,
          data: updatedData,
        }
      );

      if (result.status === 200) {
        // Update the tableData with the new data
        setTableData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...updatedData } : item
          )
        );

        console.log("Record updated successfully");
      }
    } catch (e) {
      console.log("There was an error updating the record", e);
    }
  };

  const handleDeleteClick = async (id) => {
    console.log("the delete clicked id", id);
    try {
      const result = await axiosInstance.post(
        `/data-management/delete${tableName}`,
        { id }
      );
      console.log(result);

      // Update state correctly
      setTableData((prevData) => prevData.filter((e) => e.id !== id));
    } catch (e) {
      console.log("there was an error", e);
    }
  };

  const toggleForm = (index) => {
    console.log("toggleForm", index);
    if (index === Number(-1)) {
      setShowForm(null);
      return;
    }
    setShowForm(showForm === index ? null : index);
    console.log(tableData[index]);
  };

  const getRelativeDate = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffDays = differenceInCalendarDays(today, createdDate);
    if (diffDays === -1) return "Tommorow";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    console.log("the diff days is " + diffDays);
    if (diffDays < 0) {
      return `After ${Math.abs(diffDays)} days`;
    }
    return `${diffDays} days ago`;
  };

  function sortDataHandler(event) {
    console.log(event);
    let name = event.target.dataset.name;
    let order = event.target.dataset.sort;
    if (event.target.dataset.sort === "ASC") {
      event.target.dataset.sort = "DESC";
    } else {
      event.target.dataset.sort = "ASC";
    }
    sortTableData(name, order);
    console.log(name, order);
  }

  function handleInputDataChange(e) {
    const { dbcolumn } = e.target.dataset;
    const rowId = e.target.dataset.rowid;
    const value = e.target.value;

    setChangedinput((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId], // Preserve existing changes for this row
        [dbcolumn]: value,
      },
    }));
    console.log(changedinput);
  }

  async function handleBackendSubmit(e) {
    e.preventDefault();
    console.log(changedinput);
    try {
      const result = await axiosInstance.post(`/admin/updateactivityduration`, {
        data: changedinput,
      });
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  // Column resize handlers
  const handleResizeStart = (e, columnId, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnId] || 150);

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);

    document.body.classList.add("resize-active");
  };

  const handleResizeMove = (e) => {
    if (resizingColumn && startX !== null) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);

      // Update the column width
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    }
  };

  const handleResizeEnd = () => {
    setResizingColumn(null);
    setStartX(null);
    setStartWidth(null);

    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);

    document.body.classList.remove("resize-active");
  };

  const closeAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizingColumn]);

  return (
    <>
      <div className="relative overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white table-fixed">
          {/* Table Header */}
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#090b0d] dark:text-gray-400">
            <tr>
              {columnSetting.map(
                (column) =>
                  column.isVisible && (
                    <th
                      key={column.columnName}
                      className="px-2 py-3 relative border-r border-gray-200 dark:border-gray-700"
                      style={{ width: `${columnWidths[column.dbColumn]}px` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-1">
                          {column.columnName}
                        </span>
                        <ChevronsUpDown
                          className="mr-4 cursor-pointer"
                          data-name={column.dbColumn}
                          data-sort="ASC"
                          onClick={sortDataHandler}
                        />
                        <div
                          className={`absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-gray-300 dark:hover:bg-gray-600 ${
                            resizingColumn === column.dbColumn
                              ? "bg-blue-400 opacity-50"
                              : ""
                          }`}
                          onMouseDown={(e) =>
                            handleResizeStart(
                              e,
                              column.dbColumn,
                              column.dbColumn
                            )
                          }
                        />
                      </div>
                    </th>
                  )
              )}
              <th className="px-6 py-3 w-24 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-4"
                >
                  <Loader />
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="bg-white border-b dark:bg-[#1D1D1D] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    {columnSetting.map(
                      (column) =>
                        column.isVisible && (
                          <td
                            key={`${index}-${column.dbColumn}`}
                            className={`px-2 h-16 border-r border-gray-200 overflow-hidden dark:border-gray-700 ${
                              changedinput[item.id]?.[column.dbColumn] !==
                                undefined &&
                              changedinput[item.id][column.dbColumn] !==
                                item[column.dbColumn]
                                ? "bg-amber-100 border-2 border-amber-500"
                                : ""
                            }`}
                            style={{
                              width: `${columnWidths[column.dbColumn]}px`,
                            }}
                          >
                            {tableName === "document" &&
                            column.dbColumn === "document_url" ? (
                              <a
                                href={item.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline cursor-pointer"
                              >
                                <ExternalLink />
                              </a>
                            ) : column.isInput ? (
                              column.dbColumn === "created_date" ||
                              column.dbColumn === "created_at" ||
                              column.dbColumn === "due_date" ? (
                                showDate ? (
                                  item[column.dbColumn].split("T")[0]
                                ) : (
                                  getRelativeDate(item[column.dbColumn])
                                )
                              ) : (
                                <input
                                  className="w-full h-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  type={column.type}
                                  data-dbcolumn={column.dbColumn}
                                  data-rowid={item.id}
                                  onChange={handleInputDataChange}
                                  value={
                                    changedinput[item.id]?.[column.dbColumn] ??
                                    item[column.dbColumn]
                                  }
                                />
                              )
                            ) : column.dbColumn === "created_date" ||
                              column.dbColumn === "created_at" ||
                              column.dbColumn === "due_date" ? (
                              showDate ? (
                                item[column.dbColumn].split("T")[0]
                              ) : (
                                getRelativeDate(item[column.dbColumn])
                              )
                            ) : (
                              <span className="truncate block">
                                {item[column.dbColumn]}
                              </span>
                            )}
                          </td>
                        )
                    )}
                    <td className="px-2 h-16 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {tableName === "document" && (
                          <a
                            href={item.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            <ExternalLink className="w-6 h-5" />
                          </a>
                        )}
                        {tableName !== "tasks" && (
                          <button
                            onClick={() => toggleForm(index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {tableName !== "tasks" && (
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleAccordion(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${
                              openAccordion === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {tableName === "tasks" && openAccordion === index && (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 dark:text-white">
                          {/* {accordionComponentName === "userAccordion" && (
                            <UserAccordion
                              userPersonalData={item}
                              parentId={item.id}
                              getData={getData}
                              closeAccordion={closeAccordion}
                              index={index}
                            />
                          )} */}
                          {item.title === "Approve Project Creation" && (
                            <ProjectCreationAccordion />
                          )}
                          {item.title === "Upload BOQ" && (
                            <BoqTaskAccordion
                              parentId={item.id}
                              projectBudget={item.approved_project_budget}
                            />
                          )}
                          {item.title === "Upload Schedule Plan" && (
                            <DeliverableAccordion2
                              parentId={item.id}
                              projectBudget={item.approved_project_budget}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  {tableName === "initiative" && openAccordion === index && (
                    <tr>
                      {" "}
                      {/* Add table row wrapper */}
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        {" "}
                        {/* Add table cell */}
                        <InitiativeAccordion
                          tableName="initiative"
                          data={item}
                          title="Initiative details"
                        />
                      </td>
                    </tr>
                  )}
                  {tableName === "portfolio" && openAccordion === index && (
                    <tr>
                      {" "}
                      {/* Add table row wrapper */}
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        {" "}
                        {/* Add table cell */}
                        <PortfolioAccordion
                          tableName="portfolio"
                          data={item}
                          title="Portfolio details"
                        />
                      </td>
                    </tr>
                  )}
                  {tableName === "program" && openAccordion === index && (
                    <tr>
                      {" "}
                      {/* Add table row wrapper */}
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        {" "}
                        {/* Add table cell */}
                        <ProgramAccordion
                          tableName="program"
                          data={item}
                          title="Portfolio details"
                        />
                      </td>
                    </tr>
                  )}
                  {tableName === "users" && openAccordion === index && (
                    <tr>
                      {" "}
                      {/* Add table row wrapper */}
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        {" "}
                        {/* Add table cell */}
                        <TeamAccordion datas={item} />
                      </td>
                    </tr>
                  )}
                  {/* {openAccordion === index && (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="p-0">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 dark:text-white">
                          {accordionComponentName === "userAccordion" && (
                            <UserAccordion
                              userPersonalData={item}
                              parentId={item.id}
                              getData={getData}
                              closeAccordion={closeAccordion}
                              index={index}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )} */}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Changes Button */}
      {Object.keys(changedinput).length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleBackendSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Changes
          </button>
        </div>
      )}

      {/* Edit Form Modal */}
      {showForm != null && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="max-w-3xl bg-white p-6 rounded-lg shadow-lg w-full mx-4 dark:bg-gray-800 dark:text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit {tableName}</h2>
              <button
                onClick={() => toggleForm(-1)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
            <UpdateDynamicForm
              tableName={tableName}
              title={`Edit ${tableName}`}
              onSubmit={handleFormData}
              isEmbedded={true}
              data={tableData[showForm]}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .cursor-col-resize {
          cursor: col-resize;
        }

        :global(.resize-active) {
          cursor: col-resize !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>
    </>
  );
};

export default TableData;
