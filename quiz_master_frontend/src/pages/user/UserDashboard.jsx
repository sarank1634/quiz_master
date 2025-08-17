// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/apiClient';
import Navbar from '../../components/Navbar';
import QuizRunner from '../QuizRunner';
import ScoreTable from '../../components/ScoreTable';
import SummaryCharts from '../../components/SummaryCharts';
import Loading from '../../components/Loading';
import FilterBar from '../../components/FilterBar';
import EmptyState from '../../components/EmptyState';
import QuizList from './QuizList';
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
      const qDate = q.scheduledAt ? q.scheduledAt.split('T')[0] : q.date;
      return qDate === dateFilter;
    });
  }

  function startQuiz(q) {
    setActiveQuiz(q);
    setQuizOpen(true);
    api.post('/events', { type: 'quiz_start', quizId: q.id, userId: user.id, ts: new Date().toISOString() }).catch(()=>{});
  }

  if (loading) return <Loading label="Preparing your dashboard..." className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user?.fullName || user?.name} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName || user?.name}</h1>
            <p className="text-md text-gray-600">Pick an upcoming quiz and start practicing.</p>
          </div>
          <FilterBar
            filterText={filterText}
            setFilterText={setFilterText}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onClear={() => { setFilterText(''); setDateFilter(''); }}
            onRefresh={() => refreshData(false)}
            refreshing={refreshing}
          />
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Upcoming Quizzes</h2>
              <span className="text-md text-gray-500">{filteredQuizzes().length} found</span>
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
                subtitle="Try clearing filters or refresh to check for new quizzes."
                actionLabel="Refresh"
                onAction={() => refreshData(false)}
              />
            )}
          </div>

          <aside className="lg:w-1/3 space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-3 text-gray-800">Recent Scores</h3>
              <ScoreTable scores={scores.slice(0, 6)} quizzes={quizzes} compact />
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-xl mb-3 text-gray-800">Summary</h3>
              <SummaryCharts quizzes={quizzes} scores={scores} />
            </div>
          </aside>
        </div>
      </main>

      <QuizRunner 
        open={quizOpen} 
        quiz={activeQuiz} 
        onClose={() => setQuizOpen(false)} 
        onSubmitSuccess={(result) => {
          api.get('/scores/me').then(r => setScores(r.data.scores)).catch(()=>{});
          setQuizOpen(false);
        }} 
      />
    </div>
  );
}
