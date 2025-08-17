import React from 'react';
import QuizCard from '../../components/QuizCard';

export default function QuizList({ quizzes = [], onStart, onView }) {
  return (
    <div className="space-y-3">
      {quizzes.map((q) => (
        <QuizCard key={q.id} quiz={q} onStart={() => onStart(q)} onView={() => onView(q)} />
      ))}
    </div>
  );
}
