import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users } from "lucide-react";
import Pagination from "../components/Pagination";

// IMPORTING CHILDREN COMPONENTS

import TableData from "../components/TableData";
import TableConfig from "../components/TableConfig";
import TableConfigFilter from "../components/TableConfigFilter";

let tablefilters = {};
let sortClause = {};
let dateFilter = null;
let page = 1;
const TasksPage = () => {
  const [columnSetting, setColumnSetting] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDate, setShowDate] = useState(false);
  const [pagination, setPagination] = useState({});
  let originalTableData = [];
  useEffect(() => {
    console.log("Component Mounted!");
    async function getSetting() {
      try {
        const result = await axios.post(
          "http://localhost:4000/data-management/setting",
          {
            tableName: "initiative",
            userId: 1,
          }
        );
        console.log(result.data.result[0].setting.setting);
        const data = result.data.result[0].setting.setting;
        setColumnSetting((state) => data);
      } catch (e) {
        console.log(e);
      }
    }
    async function getData(page) {
      try {
        const result = await axios.post(
          "http://localhost:4000/data-management/data",
          {
            tableName: "initiative",
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
    getSetting();
    getData();

    return () => {
      console.log("Component Unmounted!");
    };
  }, []);

  async function getFilteredData() {
    try {
      const result = await axios.post(
        "http://localhost:4000/data-management/filtereddata",
        {
          tableName: "initiative",
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
    <div className="flex-1 overflow-auto relative z-10 p-5 h-full">
      {/* <TableConfig
        updateFilters={updateFilters}
        filterTableData={filterTableData}
      > */}
      <TableConfigFilter
        filterTable={filterTable}
        filterBasedOnDays={filterBasedOnDays}
        updateShowDateFunctionality={updateShowDateFunctionality}
        showDate={showDate}
        columnSetting={columnSetting}
        filterTableBasedonSearchTerm={filterTableBasedonSearchTerm}
        setColumnSetting={setColumnSetting}
      ></TableConfigFilter>
      {/* </TableConfig> */}
      <TableData
        tableData={tableData}
        showDate={showDate}
        sortTableData={sortTableData}
        columnSetting={columnSetting}
      ></TableData>
      <Pagination pagination={pagination} getPageData={getPageData} />
    </div>
  );
};

export default TasksPage;
