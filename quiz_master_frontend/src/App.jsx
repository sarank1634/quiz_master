import { useState } from 'react'
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
import UserDashboard from './pages/user/UserDashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {/* Interactive User Dashboard */}
      <Route path='/user/dashboard' element={<UserDashboard />} />
      {/* Optional convenience redirect */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="subjects" element={<ManageSubjects />} />
          {/* Additional admin routes can be added when pages are created */}
        </Route>
      </Route>

      <Route path='/dashboard' element={<Navigate to='/user/dashboard' replace />} />
      {/* Fallback: redirect unknown routes to home or login as preferred */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
