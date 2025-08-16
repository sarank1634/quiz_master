import { useState } from 'react'
import api from './lib/apiClient'
import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './Home'
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./Components/AdminRoute";
import AdminLayout from "./Components/layouts.jsx/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Subjects from "./pages/admin/Subjects";
import UserDashboard from './user/UserDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      {/* Interactive User Dashboard */}
      <Route path='/user/dashboard' element={<UserDashboard />} />
      {/* Optional convenience redirect */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="subjects" element={<Subjects />} />
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
