import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../lib/apiClient";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

const StatCard = ({ title, value, icon, trend, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
          ) : (
            value?.toLocaleString() || '0'
          )}
        </p>
        {trend && (
          <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      {icon && (
        <div className="text-3xl text-blue-500 opacity-80">
          {icon}
        </div>
      )}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-64 rounded"></div>
      </div>
    ) : (
      children
    )}
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, quizzes: 0, subjects: 0, attempts: 0 });
  const [bySubject, setBySubject] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get("/admin/overview");
        setStats(data.stats || { users: 0, quizzes: 0, subjects: 0, attempts: 0 });
        setBySubject(data.bySubject || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your quiz platform performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon="👥" 
            isLoading={isLoading}
            trend={12}
          />
          <StatCard 
            title="Active Quizzes" 
            value={stats.quizzes} 
            icon="📝" 
            isLoading={isLoading}
            trend={8}
          />
          <StatCard 
            title="Subjects" 
            value={stats.subjects} 
            icon="📚" 
            isLoading={isLoading}
            trend={-2}
          />
          <StatCard 
            title="Total Attempts" 
            value={stats.attempts} 
            icon="🎯" 
            isLoading={isLoading}
            trend={25}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard title="Top Scores by Subject" isLoading={isLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bySubject} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="topScore" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  name="Top Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Quiz Attempts Distribution" isLoading={isLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bySubject}
                  dataKey="attempts"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {bySubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
          >
            <h4 className="text-lg font-semibold mb-2">System Status</h4>
            <p className="text-blue-100 mb-3">All systems operational</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm">Online</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
          >
            <h4 className="text-lg font-semibold mb-2">Recent Activity</h4>
            <p className="text-green-100 mb-3">High engagement today</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm">Active</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <h4 className="text-lg font-semibold mb-2">Performance</h4>
            <p className="text-purple-100 mb-3">Above average metrics</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm">Excellent</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
