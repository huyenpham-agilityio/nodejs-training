"use client";

import { memo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  totalItems?: number;
  itemsPerPage?: number;
}

function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg'>
      {/* Info */}
      <div className='text-sm text-gray-400'>
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <>
            Showing{" "}
            <span className='font-medium text-white'>
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            </span>{" "}
            to{" "}
            <span className='font-medium text-white'>
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className='font-medium text-white'>{totalItems}</span>{" "}
            results
          </>
        ) : (
          <>
            Page <span className='font-medium text-white'>{currentPage}</span>{" "}
            of <span className='font-medium text-white'>{totalPages}</span>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center gap-2'>
        {/* Previous Button */}
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            hasPreviousPage
              ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              : "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className='hidden sm:flex items-center gap-1'>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className='px-3 py-2 text-gray-500'
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isCurrentPage
                    ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Mobile: Current Page Indicator */}
        <div className='sm:hidden px-3 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg'>
          {currentPage}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            hasNextPage
              ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              : "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default memo(Pagination);
