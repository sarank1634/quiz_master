import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import api from "../../lib/apiClient";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import { Link, useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiCalendar, FiUsers, FiFileText, FiBarChart2, FiTarget, FiBook, FiArrowRight, FiFilter, FiMaximize2, FiMinimize2, FiBell, FiTrendingUp, FiActivity, FiZap } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

const ProgressBar = ({ value, max, color = "bg-blue-500", label }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const ExpandableStatCard = ({ title, value, icon, isLoading, to, details, trend }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <Link to={to} className="block group">
        <motion.div
          className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    <AnimatedNumber value={value || 0} />
                  )}
                </p>
                {trend && (
                  <div className={`flex items-center text-sm ${
                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <FiTrendingUp className={`w-4 h-4 mr-1 ${
                      trend < 0 ? 'rotate-180' : ''
                    }`} />
                    {Math.abs(trend)}%
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {icon && (
                <div className="text-3xl text-blue-500 opacity-80 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                {details.map((detail, index) => (
                  <ProgressBar
                    key={index}
                    value={detail.value}
                    max={detail.max}
                    color={detail.color}
                    label={detail.label}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1 group-hover:text-blue-600">
            <span>View all</span>
            <FiArrowRight className="transform transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, isLoading, to }) => (
  <Link to={to} className="block group">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : (
              <AnimatedNumber value={value || 0} />
            )}
          </p>
        </div>
        {icon && (
          <div className="text-3xl text-blue-500 opacity-80 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>
       <div className="text-xs text-gray-500 mt-2 flex items-center gap-1 group-hover:text-blue-600">
          <span>View all</span>
          <FiArrowRight className="transform transition-transform group-hover:translate-x-1" />
        </div>
    </motion.div>
  </Link>
);

const ChartCard = ({ title, children, isLoading, onExpand }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.05)' }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {onExpand && (
        <button
          onClick={onExpand}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Expand chart"
        >
          <FiMaximize2 />
        </button>
      )}
    </div>
    <div className="h-[300px]">
      {isLoading ? (
        <div className="animate-pulse h-full flex items-center justify-center">
          <div className="bg-gray-200 h-full w-full rounded"></div>
        </div>
      ) : (
        children
      )}
    </div>
  </motion.div>
);

const ChartModal = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative z-10 w-[95vw] max-w-6xl max-h-[85vh] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="h-[65vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.fill || pld.stroke }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const NoData = ({ message = "No data to display." }) => (
    <div className="flex items-center justify-center h-full text-gray-500">
        <p>{message}</p>
    </div>
);

const LiveNotification = ({ notification, onDismiss }) => (
  <motion.div
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50"
  >
    <div className="flex items-start gap-3">
      <div className="text-blue-500">
        <FiBell className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  </motion.div>
);

const FilterPanel = ({ filters, onFilterChange, isOpen, onToggle }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-6 overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => onFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
            <select
              value={filters.scoreRange}
              onChange={(e) => onFilterChange('scoreRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Scores</option>
              <option value="high">80-100%</option>
              <option value="medium">60-79%</option>
              <option value="low">0-59%</option>
            </select>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const RecentActivity = ({ isLoading, activities }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return <NoData message="No recent activity to show."/>
    }

    return (
        <ul className="space-y-4">
            {activities.map(activity => (
                <li key={activity.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {activity.user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            <span className="font-bold">{activity.user.name}</span> {activity.action} {activity.details && <span className="font-semibold text-blue-600">{activity.details}</span>}
                        </p>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const QuickAction = ({ to, icon, label, colorClass }) => (
  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
    <Link to={to} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg ${colorClass} transition-colors duration-200`}>
    {icon}
      <span className="font-medium">{label}</span>
    </Link>
  </motion.div>
);

const QuickActionsCard = () => (
    <div className="space-y-3">
        <QuickAction to="/admin/quizzes/new" icon={<FiFileText />} label="Create New Quiz" colorClass="bg-blue-50 hover:bg-blue-100 text-blue-700" />
        <QuickAction to="/admin/users" icon={<FiUsers />} label="Add New User" colorClass="bg-green-50 hover:bg-green-100 text-green-700" />
        <QuickAction to="/admin/subjects" icon={<FiBook />} label="Manage Subjects" colorClass="bg-purple-50 hover:bg-purple-100 text-purple-700" />
    </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, quizzes: 0, subjects: 0, attempts: 0 });
  const [bySubject, setBySubject] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all_time');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [filters, setFilters] = useState({ subject: 'all', status: 'all', scoreRange: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const [expandedChart, setExpandedChart] = useState(null); // 'bar' | 'pie' | null
  const recentActivityRef = useRef([]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        period: dateRange,
        subject: filters.subject,
        status: filters.status,
        scoreRange: filters.scoreRange
      });
      
      const overviewPromise = api.get(`/admin/overview?${queryParams}`);
      const activityPromise = api.get('/admin/recent-activity?limit=5');
      
      const [overviewRes, activityRes] = await Promise.all([overviewPromise, activityPromise]);

      const newStats = overviewRes.data.stats || { users: 0, quizzes: 0, subjects: 0, attempts: 0 };
      const newBySubject = overviewRes.data.bySubject || [];
      const newActivity = activityRes.data.activities || [];
      
      // Check for new activity and show notifications using ref to avoid re-render dependency loops
      if (silent && recentActivityRef.current.length > 0 && newActivity.length > 0) {
        const latestActivity = newActivity[0];
        const wasNew = !recentActivityRef.current.find(activity => activity.id === latestActivity.id);
        
        if (wasNew) {
          const notification = {
            id: Date.now(),
            title: 'New Activity',
            message: `${latestActivity.user.name} ${latestActivity.action}`
          };
          setNotifications(prev => [...prev, notification]);
          
          // Auto-dismiss notification after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 5000);
        }
      }

      setStats(newStats);
      setBySubject(newBySubject);
      setRecentActivity(newActivity);
      recentActivityRef.current = newActivity;
      setLastUpdate(new Date());

    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [dateRange, filters]);
  
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchData(true); // Silent refresh
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  const handleBarClick = (data) => {
    if (data && data.activePayload) {
      const subjectName = data.activePayload[0].payload.subject;
      navigate(`/admin/subjects/${subjectName}`);
    }
  };

  const handlePieClick = (data) => {
    if (data && data.name) {
      navigate(`/admin/subjects/${data.name}/attempts`);
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur rounded-xl px-3 py-3 flex flex-wrap justify-between items-center gap-4 border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Live overview of your quiz platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter />
            <span>Filters</span>
          </button>
          
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all_time">All Time</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="today">Today</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <FiActivity className={autoRefresh ? 'animate-pulse' : ''} />
              <span className="text-sm">{autoRefresh ? 'Live' : 'Manual'}</span>
            </button>
            
            <button 
              onClick={() => fetchData()} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <FiZap className="w-3 h-3" />
            <span>Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <FilterPanel 
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExpandableStatCard 
          title="Total Users" 
          value={stats.users} 
          icon={<FiUsers />} 
          isLoading={isLoading} 
          to="/admin/users"
          trend={5.2}
          details={[
            { label: 'Active Users', value: Math.floor(stats.users * 0.8), max: stats.users, color: 'bg-green-500' },
            { label: 'New This Week', value: Math.floor(stats.users * 0.1), max: stats.users, color: 'bg-blue-500' }
          ]}
        />
        <ExpandableStatCard 
          title="Active Quizzes" 
          value={stats.quizzes} 
          icon={<FiFileText />} 
          isLoading={isLoading} 
          to="/admin/quizzes"
          trend={2.8}
          details={[
            { label: 'Published', value: Math.floor(stats.quizzes * 0.9), max: stats.quizzes, color: 'bg-green-500' },
            { label: 'Draft', value: Math.floor(stats.quizzes * 0.1), max: stats.quizzes, color: 'bg-yellow-500' }
          ]}
        />
        <ExpandableStatCard 
          title="Subjects" 
          value={stats.subjects} 
          icon={<FiBook />} 
          isLoading={isLoading} 
          to="/admin/subjects"
          trend={0}
          details={[
            { label: 'With Quizzes', value: Math.floor(stats.subjects * 0.85), max: stats.subjects, color: 'bg-purple-500' },
            { label: 'Empty', value: Math.floor(stats.subjects * 0.15), max: stats.subjects, color: 'bg-gray-400' }
          ]}
        />
        <ExpandableStatCard 
          title="Total Attempts" 
          value={stats.attempts} 
          icon={<FiTarget />} 
          isLoading={isLoading} 
          to="/admin/attempts"
          trend={12.5}
          details={[
            { label: 'Completed', value: Math.floor(stats.attempts * 0.75), max: stats.attempts, color: 'bg-green-500' },
            { label: 'In Progress', value: Math.floor(stats.attempts * 0.25), max: stats.attempts, color: 'bg-orange-500' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-2 gap-8">
        <div className="lg:col-span-3 xl:col-span-1">
          <ChartCard title="Top Scores by Subject" isLoading={isLoading} onExpand={() => setExpandedChart('bar')}>
          {bySubject.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                <Bar dataKey="topScore" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Top Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
          </ChartCard>
        </div>

        <div className="lg:col-span-2 xl:col-span-1">
          <ChartCard title="Quiz Attempts Distribution" isLoading={isLoading} onExpand={() => setExpandedChart('pie')}>
          {bySubject.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bySubject}
                  dataKey="attempts"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={'80%'}
                  innerRadius={'50%'}
                  paddingAngle={2}
                  labelLine={false}
                  onClick={handlePieClick}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return percent > 0.05 ? (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {bySubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
          <RecentActivity isLoading={isLoading} activities={recentActivity} />
        </motion.div>
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
          <QuickActionsCard />
        </motion.div>
      </div>
      
      {/* Live Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <LiveNotification
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </AnimatePresence>

      {/* Expanded Chart Modal */}
      <ChartModal
        open={!!expandedChart}
        title={expandedChart === 'bar' ? 'Top Scores by Subject' : expandedChart === 'pie' ? 'Quiz Attempts Distribution' : ''}
        onClose={() => setExpandedChart(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          {expandedChart === 'bar' ? (
            <BarChart data={bySubject} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="topScore" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Top Score" />
            </BarChart>
          ) : expandedChart === 'pie' ? (
            <PieChart>
              <Pie
                data={bySubject}
                dataKey="attempts"
                nameKey="subject"
                cx="50%"
                cy="50%"
                outerRadius={'85%'}
                innerRadius={'45%'}
                paddingAngle={2}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return percent > 0.03 ? (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  ) : null;
                }}
              >
                {bySubject.map((entry, index) => (
                  <Cell key={`cell-large-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '12px' }} iconType="circle" />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </ChartModal>
    </div>
  );
}
