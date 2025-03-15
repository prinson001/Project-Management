import React, { useState } from "react";
import {
  getCoreRowModel,
  flexRender,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
const PORT = import.meta.env.VITE_PORT;

const columnHelper = createColumnHelper();

const StackTable = ({ tableData, showDate, sortTableData, columnSetting }) => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [changedinput, setChangedinput] = useState({});

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

  const handleInputDataChange = (e) => {
    const { dbcolumn } = e.target.dataset;
    const rowId = e.target.dataset.rowid;
    const value = e.target.value;

    setChangedinput((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [dbcolumn]: value,
      },
    }));
  };

  const handleBackendSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `http://localhost:${PORT}/admin/updateactivityduration`,
        {
          data: changedinput,
        }
      );
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  // Define columns using columnHelper
  const columns = columnSetting.map((current) => {
    return columnHelper.accessor(current.dbColumn, {
      id: current.dbColumn, // Explicitly set the id
      header: () => current.columnName, // Header text
      cell: (info) => {
        const row = info.row.original;
        if (current.isInput) {
          return (
            <input
              className="w-full h-full"
              type={current.type}
              data-dbcolumn={current.dbColumn}
              data-rowid={row.id}
              onChange={handleInputDataChange}
              value={
                changedinput[row.id]?.[current.dbColumn] ??
                row[current.dbColumn]
              }
              key={`${row.id}-${current.dbColumn}`}
            />
          );
        } else if (current.dbColumn === "created_at") {
          return showDate
            ? row[current.dbColumn]
            : getRelativeDate(row[current.dbColumn]);
        } else {
          return row[current.dbColumn];
        }
      },
    });
  });

  // Initialize the table
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="relative flex-1 overflow-x-auto rounded-lg shadow-md">
        <div className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white">
          {/* Table Headers */}
          <div className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#090b0d] dark:text-gray-400 px-6 py-3 grid grid-cols-7 gap-4 font-bold">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </div>

          {/* Table Rows */}
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-7 gap-4 px-6 py-4">
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={
                      changedinput[row.original.id]?.[cell.column.id] !==
                        undefined &&
                      changedinput[row.original.id][cell.column.id] !==
                        row.original[cell.column.id]
                        ? "bg-amber-100 border-2 border-amber-500"
                        : ""
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
                <div>
                  <button>Edit</button>
                  <button>Delete</button>
                  <button onClick={() => toggleAccordion(row.index)}>
                    Expand
                  </button>
                </div>
              </div>

              {/* Accordion Content */}
              <div
                className={`transition-all duration-300 ${
                  openAccordion === row.index ? "block" : "hidden"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                  <div className="text-gray-600 text-center dark:text-gray-300">
                    {row.original.details}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleBackendSubmit}>Submit your data</button>
    </>
  );
};

export default StackTable;
