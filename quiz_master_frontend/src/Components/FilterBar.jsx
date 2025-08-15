import React from 'react';

export default function FilterBar({
  filterText,
  setFilterText,
  dateFilter,
  setDateFilter,
  onClear,
  onRefresh,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3">
        <input
          placeholder="Search by subject / chapter"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="p-2 border rounded w-72"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Clear
        </button>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm border rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
