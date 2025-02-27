import React, { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";

const TableData = ({ tableData, showDate, sortTableData, columnSetting }) => {
  const [openAccordion, setOpenAccordion] = useState(null);

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

  return (
    <>
      <div className="relative flex-1 overflow-x-auto rounded-lg shadow-md">
        <div className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          {/* Header */}
          <div className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 px-6 py-3 grid grid-cols-7 gap-4 font-bold">
            {columnSetting.map((current) => {
              return (
                current.isVisible && (
                  <div
                    key={current.columnName}
                    className="cursor-pointer flex items-center justify-between"
                    data-sort="ASC"
                    data-name={current.dbColumn}
                    onClick={(e) => sortDataHandler(e)}
                  >
                    {current.columnName}
                    <svg
                      className="w-3 h-3 ms-1.5 inline cursor-pointer"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                    <svg
                      width="5"
                      height="30"
                      viewBox="0 0 5 30"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-col-resize"
                    >
                      <line
                        x1="2.5"
                        y1="0"
                        x2="2.5"
                        y2="30"
                        stroke="black"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
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
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="grid grid-cols-7 gap-4 px-6 py-4">
                  {/* {columnSetting.map(
                    (current) =>
                      current.isVisible && (
                        <div
                          key={current.columnName}
                          className={`${
                            current.columnName === "status" ||
                            current.columnName === "projectName"
                              ? "font-bold"
                              : ""
                          } ${
                            current.columnName === "status"
                              ? item.status === "Done"
                                ? "text-green-500"
                                : item.status === "Open"
                                ? "text-yellow-500"
                                : "text-red-500"
                              : ""
                          }`}
                        >
                          {current.columnName === "createdDate"
                            ? showDate
                              ? item[current.columnName]
                              : getRelativeDate(item[current.columnName])
                            : item[current.columnName]}
                        </div>
                      )
                  )} */}
                  {columnSetting.map(
                    (current) =>
                      current.isVisible && (
                        <div
                          key={current.dbColumn}
                          className={`${
                            current.dbColumn === "status" ||
                            current.dbColumn === "projectName"
                              ? "font-bold"
                              : ""
                          } ${
                            current.dbColumn === "status"
                              ? item.status === "Done"
                                ? "text-green-500"
                                : item.status === "Open"
                                ? "text-yellow-500"
                                : "text-red-500"
                              : ""
                          }`}
                        >
                          {current.dbColumn === "created_at"
                            ? showDate
                              ? item[current.dbColumn]
                              : getRelativeDate(item[current.dbColumn])
                            : item[current.dbColumn]}
                        </div>
                      )
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              <div
                className={`transition-all duration-300 ${
                  openAccordion === index ? "block" : "hidden"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                  <div className="text-gray-600 text-center dark:text-gray-300">
                    {item.details}
                  </div>
                  {/* Add any additional content you want to show in the expanded section */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TableData;
