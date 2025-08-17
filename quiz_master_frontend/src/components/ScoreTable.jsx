// src/components/ScoreTable.jsx
import React from 'react';
import { format } from 'date-fns';

export default function ScoreTable({ scores = [], quizzes = [], compact = false }) {
  const lookup = id => (quizzes.find(q => q.id === id) || {}).subject || 'Quiz';
  return (
    <div className={`${compact ? '' : ''}`}>
      {scores.length === 0 ? <div className="text-sm text-gray-500">No scores yet.</div> : (
        <div className="space-y-2">
          {scores.map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 border rounded">
              <div className="text-sm">{lookup(s.quizId)}</div>
              <div className="text-sm text-gray-600">{Math.round((s.score||0)*100)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
