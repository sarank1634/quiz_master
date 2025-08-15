// src/components/QuizCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function QuizCard({ quiz, onStart, onView }) {
  const dt = quiz.scheduledAt ? new Date(quiz.scheduledAt) : (quiz.date ? new Date(quiz.date) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white p-4 rounded shadow-sm flex items-center justify-between"
    >
      <div>
        <div className="font-medium">{quiz.subject} — {quiz.chapter || quiz.title}</div>
        <div className="text-sm text-gray-500">{quiz.questions} questions • {quiz.duration} min</div>
        {dt && <div className="text-xs text-gray-400">{format(dt, 'PPP p')}</div>}
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={onView} className="px-3 py-1 border rounded text-sm">View</button>
        <button onClick={onStart} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Start</button>
      </div>
    </motion.div>
  );
}
