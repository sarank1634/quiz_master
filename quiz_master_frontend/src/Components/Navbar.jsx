// src/components/Navbar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar({ userName }) {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    // also clear redux slice if you use it
    nav('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-white/80 backdrop-blur sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-lg">Quiz Master</Link>
          <nav className="hidden sm:flex gap-3 text-sm text-gray-600">
            <Link to="/user/dashboard" className="hover:text-gray-900">Home</Link>
            <Link to="/user/scores" className="hover:text-gray-900">Scores</Link>
            <Link to="/user/summary" className="hover:text-gray-900">Summary</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 hidden sm:block">Hi, {userName || 'User'}</div>
          <button onClick={logout} className="px-3 py-1 rounded bg-red-50 text-red-600 text-sm">Logout</button>
        </div>
      </div>
    </motion.header>
  );
}
