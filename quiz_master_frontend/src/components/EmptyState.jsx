import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Try adjusting your filters or come back later.', actionLabel, onAction }) {
  return (
    <div className="p-6 bg-white rounded shadow-sm text-center text-gray-600">
      <div className="text-lg font-medium mb-1">{title}</div>
      <div className="text-sm mb-3">{subtitle}</div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-3 py-2 text-sm border rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
