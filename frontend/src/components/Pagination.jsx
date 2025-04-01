import React from "react";

function Pagination({ pagination, getPageData }) {
  const currentPage = Number(pagination.page);
  const totalPages = Number(pagination.totalPages);

  function handlePaginationClick(e) {
    const target = e.currentTarget; // Use currentTarget instead of target
    const fetchPage = target.dataset.page;

    let newPage = currentPage;

    if (fetchPage === "next") {
      newPage = Math.min(currentPage + 1, totalPages);
    } else if (fetchPage === "previous") {
      newPage = Math.max(currentPage - 1, 1);
    } else {
      newPage = Number(fetchPage);
    }

    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      getPageData(newPage);
    }
  }

  return (
    <nav aria-label="Page navigation example">
      <ul className="flex items-center justify-end mt-2 -space-x-px h-15 text-xs">
        {/* Previous Button */}
        <li>
          <div
            data-page="previous"
            onClick={handlePaginationClick}
            className={`flex items-center justify-center px-4 h-12 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed bg-white"
                : "text-gray-500 bg-white hover:text-gray-700 cursor-pointer"
            }`}
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

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <div
                data-page={pageNumber}
                onClick={handlePaginationClick}
                className={`flex items-center justify-center px-4 h-12 leading-tight border border-gray-300 cursor-pointer ${
                  isActive
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                    : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {pageNumber}
              </div>
            </li>
          );
        })}

        {/* Next Button */}
        <li>
          <div
            data-page="next"
            onClick={handlePaginationClick}
            className={`flex items-center justify-center px-4 h-12 leading-tight border border-gray-300 rounded-e-lg hover:bg-gray-100 ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed bg-white"
                : "text-gray-500 bg-white hover:text-gray-700 cursor-pointer"
            }`}
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
