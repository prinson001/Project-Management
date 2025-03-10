import { constructNow } from "date-fns";
import React, { useState, useEffect, useRef } from "react";

let dateToggler = false;

const TableConfigFilter = ({
  filterTable,
  updateShowDateFunctionality,
  filterTableBasedonSearchTerm,
  showDate,
  columnSetting,
  setColumnSetting,
  filterBasedOnDays,
}) => {
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedOption2, setSelectedOption2] = useState("Select Filter");
  const [settingOptionDropDown, setSettingOptionDropDown] = useState(false);
  const [inputs, setInputs] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isCustomSettingOpen, setIsCustomSettingOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  const customSettingRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
    if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
      setIsOpen2(false);
    }
    if (
      customSettingRef.current &&
      !customSettingRef.current.contains(event.target)
    ) {
      setIsCustomSettingOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown2 = () => {
    setIsOpen2(!isOpen2);
  };

  const toggleCustomSettingDropdown = () => {
    setIsCustomSettingOpen((state) => !state);
  };

  const DaysFilterOptionClickHandler = (option) => {
    // updateFilters(option, "daysFilter");
    console.log(option);
    filterBasedOnDays(option);
    setSelectedOption(option);
    setIsOpen(false); // Close dropdown after selection
  };

  const tableColumnFilterHandler = (e) => {
    console.log(e.target.name);
    console.log(e.target.value);
    console.log(e.target.dataset.dbname);
    const dbName = e.target.dataset.dbname;
    const { name, value } = e.target;
    setInputs((state) => {
      return {
        ...state,
        [name]: value,
      };
    });
  };

  const handleApply = () => {
    console.log("Applied filters:", inputs);
    //updateFilters(inputs, "tableFilters");
    filterTable(inputs);
    setIsOpen(false); // Close dropdown after applying
  };

  const handleReset = () => {
    setInputs({});
    filterTable({});
    let newFilters = {};
    Object.keys(inputs).forEach((e) => {
      newFilters[e] = "";
    });
    setInputs((state) => newFilters);
    setIsOpen(false); // Close dropdown after resetting
  };

  let debounceTimer; // Declare a global debounce timer

  function searchHandler(e) {
    const value = e.target.value;

    // Clear previous timer
    clearTimeout(debounceTimer);

    // Set new timer to delay execution
    debounceTimer = setTimeout(() => {
      filterTableBasedonSearchTerm(value);
    }, 500); // Adjust delay time as needed
  }

  function SettingButtonClickHandler() {
    setSettingOptionDropDown((state) => !state);
  }

  function showDateToggleHandler(e) {
    console.log(e);
    dateToggler = e.target.checked;
  }

  const toggleColumnVisibility = (columnName) => {
    setColumnSetting((prevSettings) =>
      prevSettings.map((column) =>
        column.columnName === columnName
          ? { ...column, isVisible: !column.isVisible }
          : column
      )
    );
  };

  let draggedindex = null;

  function dragStartHandler(event) {
    draggedindex = event.target.dataset.index;
    console.log(draggedindex);
  }

  function dragOverHandler(event) {
    event.preventDefault();
  }

  function dropHandler(event) {
    let dropIndex = event.currentTarget.dataset.index;
    console.log("the dropped index", dropIndex);
    console.log("the dragged index", draggedindex);
    let data = [...columnSetting];
    let draggedItem = data.find((item) => item.columnOrder == draggedindex);
    console.log(draggedItem);

    // Remove the dragged item from the array
    data = data.filter((item) => item.columnOrder != draggedindex);

    // Insert the dragged item at the dropIndex position
    data.splice(dropIndex, 0, draggedItem);

    data.forEach((item, index) => {
      item.columnOrder = index; // Ensure that columnOrder reflects the new index
    });

    console.log(data);
    setColumnSetting((state) => data);
  }

  return (
    <>
      <div className="items-center mb-5 mt-5 justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
        <div className="flex items-center mb-4 sm:mb-0">
          <form className="sm:pr-3" action="#" method="GET">
            <label htmlFor="products-search" className="sr-only">
              Search
            </label>
            <div className="relative w-50 mt-1 sm:w-64 xl:w-96">
              <input
                type="text"
                name="email"
                id="products-search"
                className=" border border-blue-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search for products"
                onChange={(e) => searchHandler(e)}
              ></input>
            </div>
          </form>
          {/* <div className="relative" ref={dropdownRef}>
            
            <button
              onClick={toggleDropdown}
              className="text-white bg-[#546dc4] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-[#4C556C] dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Filters
              <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

           
            {isOpen && (
              <div className="absolute left-0 mt-2 w-[800px] h-[420px] bg-white divide-y divide-gray-200 rounded-2xl shadow-2xl z-20 p-6 dark:bg-gray-700 dark:text-white">
                <div className="grid grid-cols-3 gap-8">
                 
                  {columnSetting.map((current) => {
                    return (
                      <input
                        type="text"
                        key={current.columnName}
                        name={current.dbColumn}
                        value={inputs[current.dbColumn] || ""}
                        onChange={tableColumnFilterHandler}
                        data-dbname={current.dbColumn}
                        className="border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        placeholder={current.columnName}
                      />
                    );
                  })}
                </div>

               
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl shadow-md transition"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="bg-[#546dc4] hover:bg-blue-600 text-white py-3 px-6 rounded-xl shadow-md transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div> */}
          <div className="relative" ref={dropdownRef2}>
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown2}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm ml-4 px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {selectedOption}
              <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen2 && (
              <div className="absolute left-0 mt-2 w-96 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 z-10">
                <ul className="grid grid-cols-2 gap-2 p-2">
                  {[
                    { label: "Today", value: "Today" },
                    { label: "This Week", value: "This Week" },
                    { label: "This Month", value: "This Month" },
                    { label: "Last 3 Months", value: "Last 3 Months" },
                    { label: "All", value: "all" },
                  ].map((option) => (
                    <li
                      key={option.value}
                      onClick={() => DaysFilterOptionClickHandler(option.value)}
                      className={`
              p-3 text-sm rounded-md cursor-pointer transition-all
              flex items-center justify-center
              border-2
              ${
                selectedOption === option.label
                  ? "border-blue-500 bg-blue-50 dark:bg-gray-600"
                  : "border-transparent hover:border-gray-200"
              }
              hover:bg-gray-100 dark:hover:bg-gray-600
              dark:text-gray-200 dark:hover:text-white
            `}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/*  ICONS SETTINGS INFO ETC ETCC */}
        <div className="flex pl-2 space-x-1">
          <div className="flex items-center w-full sm:justify-end">
            <div className="flex pl-2 space-x-1">
              <div className="relative" ref={customSettingRef}>
                {/* Dropdown Button */}
                <button
                  onClick={toggleCustomSettingDropdown}
                  className="text-white bg-[#546dc4] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-[#4C556C] dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Column Setting
                  <svg
                    className="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isCustomSettingOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 z-10">
                    <ul
                      className="p-3 space-y-3 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="dropdownCheckboxButton"
                    >
                      {columnSetting.map((column) => (
                        <li
                          key={column.columnName}
                          data-index={column.columnOrder}
                          draggable="true"
                          onDragStart={dragStartHandler}
                          onDragOver={dragOverHandler}
                          onDrop={dropHandler}
                          className="flex items-center justify-between cursor-pointer p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <div className="flex items-center">
                            <input
                              id={`checkbox-${column.columnName}`}
                              type="checkbox"
                              checked={column.isVisible}
                              onChange={() =>
                                toggleColumnVisibility(column.columnName)
                              }
                              className="w-4 h-7 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor={`checkbox-${column.columnName}`}
                              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              {column.columnName}
                            </label>
                          </div>
                          <svg
                            className="shrink-0 size-4 ms-auto text-gray-500 dark:text-neutral-500"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="9" cy="12" r="1"></circle>
                            <circle cx="9" cy="5" r="1"></circle>
                            <circle cx="9" cy="19" r="1"></circle>
                            <circle cx="15" cy="12" r="1"></circle>
                            <circle cx="15" cy="5" r="1"></circle>
                            <circle cx="15" cy="19" r="1"></circle>
                          </svg>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  id="dropdownToggleButton"
                  data-dropdown-toggle="dropdownToggle"
                  className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  type="button"
                  onClick={SettingButtonClickHandler}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                {settingOptionDropDown && (
                  <div
                    id="dropdownToggle"
                    className="z-10 absolute right-0 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-72 dark:bg-gray-700 dark:divide-gray-600"
                    onMouseLeave={SettingButtonClickHandler}
                  >
                    <ul
                      className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="dropdownToggleButton"
                    >
                      <li>
                        <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                          <label className="inline-flex items-center w-full cursor-pointer">
                            <input
                              type="checkbox"
                              value={showDate}
                              className="sr-only peer"
                              onClick={(e) => updateShowDateFunctionality()}
                            />
                            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              Show dates
                            </span>
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-6 p-2.5">
        {/* <div className="flex flex-col space-y-6"> */}
        {columnSetting.map((current) => {
          return (
            <input
              type="text"
              key={current.columnName}
              name={current.dbColumn}
              value={inputs[current.dbColumn] || ""}
              onChange={tableColumnFilterHandler}
              data-dbname={current.dbColumn}
              className="border-b-1 border-b-gray-300 outline-none p-4  focus:border-b-4"
              placeholder={current.columnName}
            />
          );
        })}
        <div className="flex justify-between mt-8">
          <p
            onClick={handleReset}
            className="text-white bg-[#e4757b] hover:bg-[#d45c58] cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-[#4C556C] dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Clear
          </p>
          <button
            onClick={handleApply}
            className="text-white bg-[#546dc4] hover:bg-blue-800 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-[#4C556C] dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default TableConfigFilter;
