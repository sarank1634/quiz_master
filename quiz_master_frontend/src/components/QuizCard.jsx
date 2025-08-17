// src/components/QuizCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiFileText, FiClock, FiChevronRight } from 'react-icons/fi';

export default function QuizCard({ quiz, onStart, onView }) {
  const dt = quiz.scheduledAt ? new Date(quiz.scheduledAt) : (quiz.date ? new Date(quiz.date) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
    >
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-gray-800">{quiz.subject}</h3>
        <p className="text-md text-gray-600 mb-2">{quiz.chapter || quiz.title}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <FiFileText />
            {quiz.questions} questions
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock />
            {quiz.duration} min
          </span>
        </div>
        {dt && <div className="text-xs text-gray-400">{format(dt, 'PPP p')}</div>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
        <button 
            onClick={onView} 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
            View Details
        </button>
        <button 
            onClick={onStart} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
        >
            Start Quiz <FiChevronRight />
        </button>
      </div>
    </motion.div>
  );
}
