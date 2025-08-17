import React from 'react';
import { CgSpinner } from 'react-icons/cg';

export default function FilterBar({
  filterText,
  setFilterText,
  dateFilter,
  setDateFilter,
  onClear,
  onRefresh,
  refreshing,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <input
        placeholder="Search by subject or chapter..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="p-2 border rounded-md w-full sm:w-64 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
      />
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="p-2 border rounded-md w-full sm:w-auto bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
      />
      <button
        onClick={onClear}
        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 transition w-full sm:w-auto"
      >
        Clear
      </button>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-medium border rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {refreshing ? <CgSpinner className="animate-spin text-lg"/> : 'Refresh'}
        </button>
      )}
    </div>
  );
}
