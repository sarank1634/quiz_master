// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiBarChart2, FiFileText, FiUsers, FiBook, FiTarget, FiSettings } from 'react-icons/fi';

export default function Navbar({ userName, userRole = 'user' }) {
  const nav = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!isProfileMenuOpen);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeProfileMenu = () => setProfileMenuOpen(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileMenuOpen(false);
    };
    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  // Dynamic navigation based on user role
  const getNavLinks = () => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
        { name: 'Users', path: '/admin/users', icon: FiUsers },
        { name: 'Quizzes', path: '/admin/quizzes', icon: FiFileText },
        { name: 'Subjects', path: '/admin/subjects', icon: FiBook },
        { name: 'Attempts', path: '/admin/attempts', icon: FiTarget },
        { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
      ];
    }
    return [
      // User dashboard removed: point Dashboard to admin dashboard to avoid broken links
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
      { name: 'Quizzes', path: '/user/quizzes', icon: FiFileText },
      { name: 'Scores', path: '/user/scores', icon: FiBarChart2 },
      { name: 'Profile', path: '/user/profile', icon: FiUser },
    ];
  };

  const navLinks = getNavLinks();
  
  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      x: '-100%',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.4, 
        ease: 'easeOut',
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: '-100%', 
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const profileMenuVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95, 
      transition: { duration: 0.15 }
    },
  };

  const navLinkVariants = {
    idle: { scale: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/60' 
          : 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={(userRole === 'admin' || userRole === 'superadmin') ? '/admin/dashboard' : '/user/dashboard'} 
                className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Quiz Master
              </Link>
            </motion.div>
            
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.path);
                
                return (
                  <motion.div
                    key={link.name}
                    variants={navLinkVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative"
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>{link.name}</span>
                    </Link>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Right side: Profile and Actions */}
          <div className="flex items-center gap-3">
            {/* Settings for admin */}
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/admin/settings"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <FiSettings className="w-5 h-5" />
                </Link>
              </motion.div>
            )}
            
            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProfileMenu();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isProfileMenuOpen 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-24 truncate">{userName || 'User'}</span>
                <motion.div
                  animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400"
                >
                  ▼
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    variants={profileMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Signed in as</p>
                      <p className="font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                      <p className="text-xs text-blue-600 capitalize">{userRole} Account</p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to={userRole === 'admin' ? '/admin/profile' : '/user/profile'}
                        onClick={closeProfileMenu}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        View Profile
                      </Link>
                      
                      {userRole === 'admin' && (
                        <Link
                          to="/admin/settings"
                          onClick={closeProfileMenu}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiSettings className="w-4 h-4" />
                          Settings
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-100">
                      <motion.button
                        onClick={logout}
                        whileHover={{ backgroundColor: '#fef2f2' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button
                onClick={toggleMobileMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isMobileMenuOpen 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50"
          >
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.path);
                
                return (
                  <motion.div
                    key={link.name}
                    variants={mobileMenuItemVariants}
                    className="overflow-hidden"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{link.name}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
              
              {/* Mobile Profile Section */}
              <motion.div
                variants={mobileMenuItemVariants}
                className="pt-4 mt-4 border-t border-gray-200"
              >
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName || 'User'}</p>
                    <p className="text-xs text-blue-600 capitalize">{userRole} Account</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 mt-2 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </motion.button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
