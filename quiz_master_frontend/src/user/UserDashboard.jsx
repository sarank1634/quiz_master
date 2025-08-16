// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/apiClient';
import Navbar from '../Components/Navbar';
import QuizRunner from '../pages/QuizRunner';
import ScoreTable from '../Components/ScoreTable';
import SummaryCharts from '../Components/SummaryCharts';
import Loading from '../Components/Loading';
import FilterBar from '../Components/FilterBar';
import EmptyState from '../Components/EmptyState';
import QuizList from '../Components/QuizList';
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
  const [refreshing, setRefreshing] = useState(false);

  // protect route: redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      nav('/login');
      return;
    }

    async function init() { await refreshData(true); }
    init();
  }, [nav]);

  async function refreshData(initial = false) {
    try {
      if (initial) setLoading(true); else setRefreshing(true);
      const [profileRes, quizzesRes, scoresRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/quizzes/upcoming'),
        api.get('/scores/me')
      ]);
      setUser(profileRes.data.user);
      setQuizzes(quizzesRes.data.quizzes || []);
      setScores(scoresRes.data.scores || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) nav('/login');
    } finally {
      if (initial) setLoading(false); else setRefreshing(false);
    }
  }

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

  if (loading) return <Loading label="Preparing your dashboard..." className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user?.fullName || user?.name} />
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome, {user?.fullName || user?.name}</h2>
            <p className="text-sm text-gray-500">Pick an upcoming quiz and start practicing.</p>
          </div>

          <FilterBar
            filterText={filterText}
            setFilterText={setFilterText}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onClear={() => { setFilterText(''); setDateFilter(''); }}
            onRefresh={() => refreshData(false)}
          />
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Upcoming Quizzes</h3>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {refreshing && <span className="animate-pulse">Refreshing…</span>}
                <span>{filteredQuizzes().length} found</span>
              </div>
            </div>

            {filteredQuizzes().length > 0 ? (
              <QuizList
                quizzes={filteredQuizzes()}
                onStart={(q) => startQuiz(q)}
                onView={(q) => nav(`/quiz/${q.id}`)}
              />
            ) : (
              <EmptyState
                title="No quizzes match your filters"
                subtitle="Try clearing filters or refresh to check new quizzes."
                actionLabel="Refresh"
                onAction={() => refreshData(false)}
              />
            )}
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
