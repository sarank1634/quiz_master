// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import Navbar from '../components/Navbar';
import QuizCard from '../components/QuizCard';
import QuizRunner from '../components/QuizRunner';
import ScoreTable from '../components/ScoreTable';
import SummaryCharts from '../components/SummaryCharts';
import { formatISO, parseISO } from 'date-fns';

export default function UserDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // protect route: redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      nav('/login');
      return;
    }

    async function init() {
      try {
        setLoading(true);
        const [profileRes, quizzesRes, scoresRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/quizzes/upcoming'), // backend route
          api.get('/scores/me')
        ]);
        setUser(profileRes.data.user);
        setQuizzes(quizzesRes.data.quizzes || []);
        setScores(scoresRes.data.scores || []);
      } catch (err) {
        console.error(err);
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) nav('/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [nav]);

  function filteredQuizzes() {
    return quizzes.filter(q => {
      const matchesText = `${q.subject} ${q.chapter} ${q.title || ''}`.toLowerCase().includes(filterText.toLowerCase());
      if (!matchesText) return false;
      if (!dateFilter) return true;
      const qDate = q.scheduledAt ? q.scheduledAt.split('T')[0] : q.date; // adapt to backend shape
      return qDate === dateFilter;
    });
  }

  function startQuiz(q) {
    setActiveQuiz(q);
    setQuizOpen(true);
    // log event for analytics
    api.post('/events', { type: 'quiz_start', quizId: q.id, userId: user.id, ts: new Date().toISOString() }).catch(()=>{});
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user?.fullName || user?.name} />
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome, {user?.fullName || user?.name}</h2>
            <p className="text-sm text-gray-500">Pick an upcoming quiz and start practicing.</p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              placeholder="Search by subject / chapter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="p-2 border rounded w-72"
            />
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="p-2 border rounded" />
            <button onClick={() => { setFilterText(''); setDateFilter(''); }} className="text-sm text-gray-600">Clear</button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Upcoming Quizzes</h3>
              <div className="text-sm text-gray-500">{filteredQuizzes().length} found</div>
            </div>

            <div className="space-y-3">
              {filteredQuizzes().map(q => (
                <QuizCard key={q.id} quiz={q} onStart={() => startQuiz(q)} onView={() => nav(`/quiz/${q.id}`)} />
              ))}
              {filteredQuizzes().length === 0 && (
                <div className="p-4 bg-white rounded shadow-sm text-gray-600">No quizzes found for your filters.</div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <h4 className="font-semibold mb-2">Recent Scores</h4>
              <ScoreTable scores={scores.slice(0,6)} quizzes={quizzes} compact />
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <h4 className="font-semibold mb-2">Summary</h4>
              <SummaryCharts quizzes={quizzes} scores={scores} />
            </div>
          </aside>
        </section>
      </main>

      <QuizRunner open={quizOpen} quiz={activeQuiz} onClose={() => setQuizOpen(false)} onSubmitSuccess={(result) => {
        // refresh scores
        api.get('/scores/me').then(r => setScores(r.data.scores)).catch(()=>{});
        setQuizOpen(false);
      }} />
    </div>
  );
}
