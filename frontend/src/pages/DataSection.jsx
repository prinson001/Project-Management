import React, { useState, useEffect, Suspense } from "react";
import axiosInstanceInstance from "../axiosInstance";
import { AlignVerticalJustifyEnd, Users } from "lucide-react";
import Pagination from "../components/Pagination";

// IMPORTING CHILDREN COMPONENTS

const TableData = React.lazy(() => import("../components/TableData"));
import TableConfig from "../components/TableConfig";
import TableConfigFilter from "../components/TableConfigFilter";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";
const PORT = import.meta.env.VITE_PORT;

let tablefilters = {};
let sortClause = {};
let dateFilter = null;
let getAllTasks = null;
let taskStatus = null;
let openTaskCount = null;
let closedTaskCount = null;
let customDateRange = null;

let page = 1;

const removeDuplicates = (array, key = "id") => {
  const seen = new Set();
  return array.filter((item) => {
    const itemKey = item[key];
    const isDuplicate = seen.has(itemKey);
    seen.add(itemKey);
    return !isDuplicate;
  });
};

const DataSection = ({
  tableName,
  showTableData = true,
  showTableConfig = false,
  showTableConfigFilter = true,
  showTablePagination = true,
  accordionComponentName = null,
  refreshTrigger,
}) => {
  const [columnSetting, setColumnSetting] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDate, setShowDate] = useState(false);
  const [pagination, setPagination] = useState({});
  const [openTaskCount, setOpenTaskCount] = useState(0);
  const [delayedTaskCount, setDelayedTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  let originalTableData = [];
  const { userId, role } = useAuthStore();

  async function getData() {
    console.log("user id ", userId);
    console.log("role ", role);
    setIsLoading(true);
    try {
      console.log("the dableName in getData function", tableName);
      let result = [];
      if (tableName == "tasks") {
        result = await axiosInstanceInstance.post(`/tasks/getTasks`, {
          tableName,
          userId: userId,
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
      const uniqueData = removeDuplicates(result.data.result);
      if (tableName == "tasks") {
        console.log("the unique data is");
        console.log(uniqueData);
        setOpenTaskCount(result.data.openTasksCount);
        setDelayedTaskCount(result.data.closedTasksCount);
      }
      console.log("Original data count:", result.data.result.length);
      console.log("Unique data count:", uniqueData.length);

      originalTableData = uniqueData;
      setTableData(uniqueData);
      setPagination(result.data.pagination);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

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

  useEffect(() => {
    console.log("Component Mounted!");
    async function fetchData() {
      try {
        await getSetting(); // Ensure getSetting is completed first
        await getData(); // Then fetch getData
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    }
    fetchData();
    tablefilters = {};
    sortClause = { created_date: "DESC" }; // Set default sort to newest first
    dateFilter = null;
    getAllTasks = null;
    taskStatus = null;
    customDateRange = null;
    return () => {
      console.log("Component Unmounted!");
      console.log("the tableName is " + tableName);
    };
  }, [tableName, refreshTrigger]); // Add tableName as a dependency

  async function getFilteredData() {
    console.log("the filters applied are");
    console.log(structuredClone(tablefilters));
    setIsLoading(true);
    if (tableName === "tasks") {
      const { project_name, filters } = tablefilters;
      try {
        const result = await axiosInstanceInstance.post(`/tasks/filtertasks`, {
          userId: userId,
          limit: 7,
          page,
          filters: filters,
          project_name,
          getAllTasks,
          taskStatus,
          dateFilter,
          customDateRangeOption: customDateRange,
          sort: sortClause,
        });
        console.log(result);

        setOpenTaskCount(result.data.openTasksCount);
        setDelayedTaskCount(result.data.closedTasksCount);
        setTableData((state) => result.data.result);
        setPagination((state) => result.data.pagination);
      } catch (e) {
        console.log("errror");
        console.log(e);
      } finally {
        setIsLoading(false);
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
            customDateRangeOption: customDateRange,
            page,
          }
        );
        console.log(result);
        setTableData((state) => result.data.result);
        setPagination((state) => result.data.pagination);
      } catch (e) {
        console.log("there was an error");
        console.log(e);
      } finally {
        setIsLoading(false);
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
    if (typeof input === "object") {
      console.log("object is passed");
      customDateRange = input;
      dateFilter = "custom";
    } else {
      dateFilter = input;
    }
    console.log(tablefilters);
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
    <div className="flex-1 overflow-auto relative z-10 p-0 h-full">
      {showTableConfig && (
        <TableConfig
          updateALLorMyTaskRetreival={updateALLorMyTaskRetreival}
          openTaskCount={openTaskCount}
          delayedTaskCount={delayedTaskCount}
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
        <Suspense fallback={<Loader />}>
          <TableData
            tableName={tableName}
            tableData={tableData}
            setTableData={setTableData}
            getData={getData}
            showDate={showDate}
            sortTableData={sortTableData}
            columnSetting={columnSetting}
            accordionComponentName={accordionComponentName}
            isLoading={isLoading}
          ></TableData>
        </Suspense>
      )}
      {showTablePagination && (
        <Pagination pagination={pagination} getPageData={getPageData} />
      )}
    </div>
  );
};

export default DataSection;
