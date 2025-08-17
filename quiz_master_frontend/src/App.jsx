import { useEffect, useState } from 'react'
import api from './lib/apiClient'
import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './Home';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSubjects from './pages/admin/ManageSubjects';
import adminApi from './lib/adminApi';

function RoleDashboardRedirect() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTarget('/login');
      return;
    }
    // User dashboard removed; any authenticated user goes to admin dashboard
    setTarget('/admin/dashboard');
  }, []);
  if (!target) return <div className="p-6">Redirecting...</div>;
  return <Navigate to={target} replace />;
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {/* User dashboard removed as requested */}
      {/* Optional convenience redirect */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="subjects" element={<ManageSubjects />} />
          {/* Additional admin routes can be added when pages are created */}
        </Route>
      </Route>

      <Route path='/dashboard' element={<RoleDashboardRedirect />} />
      {/* Fallback: redirect unknown routes to home or login as preferred */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
