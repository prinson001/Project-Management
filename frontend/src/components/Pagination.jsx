import React, { useState, useEffect } from "react";

function Pagination({ pagination, getPageData }) {
  function handlePaginationclick(e) {
    const fetchPage = e.target.dataset.page;
    let redirect = null;
    if (fetchPage === "next") {
      redirect =
        Number(pagination.page) <= Number(pagination.totalPages)
          ? Number(pagination.page) + 1
          : redirect;
    } else if (fetchPage === "previous") {
      redirect =
        Number(pagination.page) > 1 ? Number(pagination.page) - 1 : redirect;
      return;
    } else {
      redirect = fetchPage;
    }
    console.log(redirect);
    if (redirect >= 1 && redirect <= Number(pagination.totalPages)) {
      getPageData(redirect);
    }
  }
  return (
    <nav aria-label="Page navigation example">
      <ul className="flex items-center justify-end mt-2 -space-x-px h-15 text-base">
        <li
          data-page="previous"
          onClick={(e) => {
            handlePaginationclick(e);
          }}
        >
          <div
            data-page="previous"
            className="flex items-center justify-center px-4 h-12 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-3 h-3 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
          </div>
        </li>
        {Array.from({ length: pagination.totalPages }).map((_, index) => (
          <li
            key={index}
            onClick={(e) => {
              handlePaginationclick(e);
            }}
            data-page={index + 1}
          >
            <div
              data-page={index + 1}
              className="flex  items-center justify-center px-4 h-12 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {index + 1}
            </div>
          </li>
        ))}

        <li
          data-page="next"
          onClick={(e) => {
            handlePaginationclick(e);
          }}
        >
          <div
            data-page="next"
            className="flex items-center justify-center px-4 h-12 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-3 h-3 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
