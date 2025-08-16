// src/components/QuizRunner.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/apiClient';

export default function QuizRunner({ open, quiz, onClose, onSubmitSuccess }) {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open || !quiz) return;
    let mounted = true;
    (async () => {
      try {
        // fetch questions for quiz from backend
        const res = await api.get(`/quizzes/${quiz.id}/questions`);
        if (!mounted) return;
        setQuestions(res.data.questions || []);
        setTimeLeft((quiz.duration || 10) * 60);
        setIdx(0);
        setAnswers({});
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [open, quiz]);

  useEffect(() => {
    if (!open) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [open]);

  const handleSelect = (qid, optIndex) => {
    setAnswers(prev => ({ ...prev, [qid]: optIndex }));
    // Auto-save answer (best-effort)
    api.post(`/quizzes/${quiz.id}/save-answer`, { questionId: qid, answer: optIndex })
      .catch(()=>{});
  };

  const saveAndNext = () => {
    setIdx(i => Math.min(i + 1, Math.max(0, questions.length - 1)));
  };

  const submit = async () => {
    try {
      const payload = { answers };
      const res = await api.post(`/quizzes/${quiz.id}/submit`, payload);
      // log event
      api.post('/events', { type: 'quiz_submit', quizId: quiz.id, result: res.data }).catch(()=>{});
      onSubmitSuccess && onSubmitSuccess(res.data);
      alert('Submitted — score: ' + (res.data.score || 'N/A'));
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    }
  };

  const handleAutoSubmit = () => {
    submit();
  };

  if (!quiz) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 relative z-10"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{quiz.subject} — {quiz.chapter || quiz.title}</h3>
                <div className="text-sm text-gray-500">{quiz.questions} questions • {quiz.duration} min</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Time left</div>
                <div className="font-mono">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</div>
              </div>
            </div>

            <div>
              {questions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Loading questions...</div>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded mb-3">
                    <div className="mb-2 font-medium">Q{idx+1}. {questions[idx].title || questions[idx].text}</div>
                    <div className="grid grid-cols-1 gap-2">
                      {questions[idx].options.map((opt, i) => {
                        const selected = answers[questions[idx].id] === i;
                        return (
                          <button key={i}
                            onClick={() => handleSelect(questions[idx].id, i)}
                            className={`p-3 rounded border text-left ${selected ? 'bg-indigo-600 text-white' : ''}`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65+i)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Progress: {idx+1} / {questions.length}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setIdx(i => Math.max(0,i-1))} className="px-3 py-1 border rounded">Prev</button>
                      <button onClick={saveAndNext} className="px-3 py-1 border rounded">Save & Next</button>
                      <button onClick={submit} className="px-3 py-1 bg-green-600 text-white rounded">Submit</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
