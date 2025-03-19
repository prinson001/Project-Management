import React, { useState, useEffect } from "react";
import axiosInstanceInstance from "../axiosInstance";
import { AlignVerticalJustifyEnd, Users } from "lucide-react";
import Pagination from "../components/Pagination";

// IMPORTING CHILDREN COMPONENTS

import TableData from "../components/TableData";
import TableConfig from "../components/TableConfig";
import TableConfigFilter from "../components/TableConfigFilter";
const PORT = import.meta.env.VITE_PORT;

let tablefilters = {};
let sortClause = {};
let dateFilter = null;
let getAllTasks = null;
let taskStatus = null;

let page = 1;
const TasksPage = ({
  tableName,
  showTableData = true,
  showTableConfig = false,
  showTableConfigFilter = true,
  showTablePagination = true,
  accordionComponentName = null,
}) => {
  const [columnSetting, setColumnSetting] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDate, setShowDate] = useState(false);
  const [pagination, setPagination] = useState({});
  let originalTableData = [];
  async function getData() {
    try {
      console.log("the dableName in getData function", tableName);
      let result = [];
      if (tableName == "tasks") {
        result = await axiosInstanceInstance.post(`/tasks/getTasks`, {
          tableName,
          userId: 5,
          limit: 7,
        });
      } else {
        result = await axiosInstanceInstance.post(`/data-management/data`, {
          tableName,
          userId: 7,
          limit: 7,
        });
      }

      console.log("the data");
      console.log(result);
      originalTableData = result.data.result;
      setTableData((state) => result.data.result);
      setPagination((state) => result.data.pagination);
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    console.log("Component Mounted!");
    async function getSetting() {
      try {
        const result = await axiosInstanceInstance.post(
          `/data-management/setting`,
          {
            tableName,
            userId: 7,
          }
        );
        console.log(result.data.result[0].setting.setting);
        const data = result.data.result[0].setting.setting;
        setColumnSetting((state) => data);
      } catch (e) {
        console.log(e);
      }
    }
    getSetting();
    getData();

    return () => {
      console.log("Component Unmounted!");
      console.log("the tableName is" + tableName);
    };
  }, []);

  async function getFilteredData() {
    if (tableName === "tasks") {
      const { project_name, filters } = tablefilters;
      try {
        const result = await axiosInstanceInstance.post(`/tasks/filtertasks`, {
          userId: 5,
          limit: 7,
          filters: filters,
          project_name,
          getAllTasks,
          taskStatus,
          dateFilter,
          sort: sortClause,
        });
        console.log(result);
        setTableData((state) => result.data.result);
        setPagination((state) => result.data.pagination);
      } catch (e) {
        console.log("errror");
        console.log(e);
      }
    } else {
      try {
        const result = await axiosInstanceInstance.post(
          `/data-management/filtereddata`,
          {
            tableName,
            limit: 7,
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

  // SPECIFIC TO TASKS OBJECT ONLY
  async function updateALLorMyTaskRetreival(value) {
    console.log(value);
    if (value === "Me") {
      getAllTasks = false;
    } else {
      getAllTasks = true;
    }
    await getFilteredData();
  }
  async function updateOpenorClosedTaskRetreival(value) {
    console.log(value);
    taskStatus = value;
    await getFilteredData();
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 p-5 h-full">
      {showTableConfig && (
        <TableConfig
          updateALLorMyTaskRetreival={updateALLorMyTaskRetreival}
          updateOpenorClosedTaskRetreival={updateOpenorClosedTaskRetreival}
        ></TableConfig>
      )}

      {showTableConfigFilter && (
        <TableConfigFilter
          filterTable={filterTable}
          filterBasedOnDays={filterBasedOnDays}
          updateShowDateFunctionality={updateShowDateFunctionality}
          showDate={showDate}
          columnSetting={columnSetting}
          filterTableBasedonSearchTerm={filterTableBasedonSearchTerm}
          setColumnSetting={setColumnSetting}
          tableName={tableName}
        ></TableConfigFilter>
      )}
      {showTableData && (
        <TableData
          tableName={tableName}
          tableData={tableData}
          setTableData={setTableData}
          getData={getData}
          showDate={showDate}
          sortTableData={sortTableData}
          columnSetting={columnSetting}
          accordionComponentName={accordionComponentName}
        ></TableData>
      )}
      {showTablePagination && (
        <Pagination pagination={pagination} getPageData={getPageData} />
      )}
    </div>
  );
};

export default TasksPage;
