import React, { useState, useRef, useEffect } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { constructFromSymbol } from "date-fns/constants";
import { Edit, Trash2, ChevronDown } from "lucide-react";
import UserAccordion from "./UserAccordion";
import axios from "axios";

const TableData = ({
  getData,
  tableData,
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

  // Initialize column widths and track visible columns
  useEffect(() => {
    const initialWidths = {};
    const visible = [];
    let totalWidth = 0;

    columnSetting.forEach((column) => {
      if (column.isVisible) {
        const width = column.width || 150;
        initialWidths[column.dbColumn] = width;
        totalWidth += width;
        visible.push(column.dbColumn);
      }
    });

    setColumnWidths(initialWidths);
    setTotalTableWidth(totalWidth);
    setVisibleColumns(visible);
  }, [columnSetting]);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const getRelativeDate = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffDays = differenceInCalendarDays(today, createdDate);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
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
      const result = await axios.post(
        "http://localhost:4000/admin/updateactivityduration",
        {
          data: changedinput,
        }
      );
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

      // Get the next column to adjust its width
      const currentIndex = visibleColumns.indexOf(resizingColumn);
      const nextColumn =
        currentIndex < visibleColumns.length - 1
          ? visibleColumns[currentIndex + 1]
          : null;

      if (nextColumn) {
        // Calculate how much width we're adding to the current column
        const widthDiff = newWidth - columnWidths[resizingColumn];

        // Make sure the next column doesn't get too small
        const nextColumnNewWidth = Math.max(
          50,
          columnWidths[nextColumn] - widthDiff
        );

        // If the next column would get too small, limit the current column's growth
        if (
          nextColumnNewWidth === 50 &&
          columnWidths[nextColumn] - widthDiff < 50
        ) {
          const maxGrowth = columnWidths[nextColumn] - 50;
          const limitedNewWidth = columnWidths[resizingColumn] + maxGrowth;

          setColumnWidths((prev) => ({
            ...prev,
            [resizingColumn]: limitedNewWidth,
            [nextColumn]: 50,
          }));
        } else {
          // Otherwise adjust both columns
          setColumnWidths((prev) => ({
            ...prev,
            [resizingColumn]: newWidth,
            [nextColumn]: nextColumnNewWidth,
          }));
        }
      } else {
        // If it's the last column, just resize it
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn]: newWidth,
        }));
      }
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
      <div className="relative flex-1 overflow-x-auto rounded-lg shadow-md">
        <div className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white">
          {/* Header */}
          <div className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#090b0d] dark:text-gray-400 px-6 py-3 flex font-bold">
            {columnSetting.map((current, index) => {
              return (
                current.isVisible && (
                  <div
                    key={current.columnName}
                    className="flex items-center justify-between relative px-2 h-full"
                    style={{
                      width: `${columnWidths[current.dbColumn]}px`,
                      minWidth: "50px",
                      overflow: "hidden",
                      borderRight: "1px solid #d1d5db", // Light mode border
                    }}
                  >
                    <div className="truncate pr-4">{current.columnName}</div>
                    <div
                      className={`absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-gray-300 dark:hover:bg-gray-600 ${
                        resizingColumn === current.dbColumn
                          ? "bg-blue-400 opacity-50"
                          : ""
                      }`}
                      onMouseDown={(e) =>
                        handleResizeStart(e, current.dbColumn, index)
                      }
                    >
                      {/* <div className="h-full w-1 bg-gray-400 dark:bg-gray-500 mx-auto"></div> */}
                    </div>
                  </div>
                )
              );
            })}
          </div>

          {/* Accordion Items */}
          {tableData.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex px-6 ">
                {columnSetting.map(
                  (current) =>
                    current.isVisible && (
                      <div
                        className={` truncate px-2 h-full ${
                          changedinput[item.id]?.[current.dbColumn] !==
                            undefined &&
                          changedinput[item.id][current.dbColumn] !==
                            item[current.dbColumn]
                            ? "bg-amber-100 border-2 border-amber-500"
                            : ""
                        }`}
                        key={current.dbColumn}
                        style={{
                          width: `${columnWidths[current.dbColumn]}px`,
                          minWidth: "50px",
                          overflow: "hidden",
                          borderRight: "1px solid #000000", // Black border for data cells
                          height: "5rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {/* Cell content remains the same */}
                        {current.isInput ? (
                          current.dbColumn === "created_at" ? (
                            showDate ? (
                              item[current.dbColumn]
                            ) : (
                              getRelativeDate(item[current.dbColumn])
                            )
                          ) : (
                            <input
                              className="w-full h-full"
                              type={current.type}
                              data-dbcolumn={current.dbColumn}
                              data-rowid={item.id}
                              onChange={handleInputDataChange}
                              value={
                                changedinput[item.id]?.[current.dbColumn] ??
                                item[current.dbColumn]
                              }
                              key={`${item.id}-${current.dbColumn}`}
                            />
                          )
                        ) : current.dbColumn === "created_at" ? (
                          showDate ? (
                            item[current.dbColumn]
                          ) : (
                            getRelativeDate(item[current.dbColumn])
                          )
                        ) : (
                          item[current.dbColumn]
                        )}
                      </div>
                    )
                )}
                <div>
                  <button>
                    <Edit />
                  </button>
                  <button>
                    <Trash2 />
                  </button>
                  <button onClick={() => toggleAccordion(index)}>
                    <ChevronDown />
                  </button>
                </div>
              </div>

              {/* Accordion Content */}
              <div
                className={`transition-all duration-300 ${
                  openAccordion === index ? "block" : "hidden"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                  <div className="text-gray-600 text-center dark:text-gray-300">
                    {/* {TableComponent && (
                        <TableComponent
                          userPersonalData={item}
                          parentId={item.id}
                          getData={getData}
                        />
                      )} */}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {
        <button onClick={(e) => handleBackendSubmit(e)}>
          Submit your data
        </button>
      }
      <style jsx>{`
        .cursor-col-resize {
          cursor: col-resize;
        }

        :global(.resize-active) {
          cursor: col-resize !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .cursor-col-resize:hover .bg-gray-400 {
          width: 2px !important;
        }
      `}</style>
    </>
  );
};

export default TableData;
