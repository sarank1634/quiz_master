import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../lib/apiClient';
import { loginSuccess } from '../../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import useGoogleAuth from '../../hooks/useGoogleAuth';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleLogin = useGoogleAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleUseLastRandom = async () => {
    try {
      const saved = localStorage.getItem('last_random_user');
      if (!saved) {
        setErrors({ general: 'No saved random account found. Use Random Login first.' });
        return;
      }
      const creds = JSON.parse(saved);
      const { email, password } = creds || {};
      if (!email || !password) {
        setErrors({ general: 'Saved credentials are invalid. Generate a new random account.' });
        return;
      }
      setFormData({ email, password });
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      if (token) localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      const role = (user && user.role) || 'user';
      const roleLower = typeof role === 'string' ? role.toLowerCase() : 'user';
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Re-login failed:', error);
      const msg = error?.response?.data?.message || 'Re-login failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Real login via API
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      const { token, user } = res.data;

      // Persist token for apiClient interceptor
      if (token) localStorage.setItem('token', token);

      // Update app state
      dispatch(loginSuccess({ user, token }));
      
      // Redirect to admin dashboard (user dashboard removed)
      const role = (user && user.role) || 'user';
      const roleLower = typeof role === 'string' ? role.toLowerCase() : 'user';
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const msg = error?.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'demo@quizmaster.com', password: 'demo123' });
    setTimeout(() => {
      const token = 'demo-token';
      localStorage.setItem('token', token);
      const demoUser = { name: 'Demo User', email: 'demo@quizmaster.com', role: 'user' };
      dispatch(loginSuccess({ user: demoUser, token }));
      navigate('/admin/dashboard');
    }, 500);
  };

  const handleRandomLogin = async () => {
    // Generate random credentials
    const randomSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const email = `user_${randomSuffix}@auto.local`;
    const password = Math.random().toString(36).slice(2, 10);
    const fullName = `Auto User ${randomSuffix.slice(-4)}`;

    // Prefill form so user can reuse later
    setFormData({ email, password });
    setErrors({});
    setInfo('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password, fullName });
      const { token, user } = res.data;
      if (token) localStorage.setItem('token', token);
      // Save last generated creds for easy re-login after logout (dev convenience)
      localStorage.setItem('last_random_user', JSON.stringify({ email, password }));
      dispatch(loginSuccess({ user, token }));
      const role = (user && user.role) || 'user';
      const roleLower = typeof role === 'string' ? role.toLowerCase() : 'user';
      setInfo(`Random account created. Save these to re-login later: ${email} / ${password}`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Random login failed:', error);
      const msg = error?.response?.data?.message || 'Random login failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-16 w-28 h-28 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-48 right-24 w-20 h-20 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-24 left-1/3 w-16 h-16 bg-white/5 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors duration-200"
        >
          <span>←</span> Back to Home
        </Link>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-white/70">Sign in to continue your quiz journey</p>
          </div>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 mb-6 text-red-200 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                  📧
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                    errors.email 
                      ? 'border-red-400 focus:border-red-300' 
                      : focusedField === 'email' 
                      ? 'border-white/50 focus:border-white/70 bg-white/20' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                />
                {focusedField === 'email' && (
                  <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse pointer-events-none"></div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1 animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                  🔒
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-300' 
                      : focusedField === 'password' 
                      ? 'border-white/50 focus:border-white/70 bg-white/20' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {focusedField === 'password' && (
                  <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse pointer-events-none"></div>
                )}
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-white/70 hover:text-white text-sm transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Info message (e.g., random credentials) */}
          {info && (
            <div className="mb-3 p-3 rounded-lg bg-white/10 text-white text-sm border border-white/20 break-words">
              {info}
            </div>
          )}

          {/* Alternative Login Options */}
          <div className="space-y-3">
            {/* Google Login */}
            <button
              onClick={() => googleLogin()}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🔗</span> Continue with Google
            </button>

            {/* Demo Login */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>⚡</span> Try Demo Login
            </button>

            {/* Random Login (auto-register) */}
            <button
              onClick={handleRandomLogin}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🎲</span> Random Login (Auto Register)
            </button>

            {/* Use Last Random Account */}
            <button
              onClick={handleUseLastRandom}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🔁</span> Use Last Random Account
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-white/70">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-white font-semibold hover:text-white/80 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="text-lg font-bold text-white">10K+</div>
            <p className="text-white/70 text-xs">Users</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="text-lg font-bold text-white">50K+</div>
            <p className="text-white/70 text-xs">Quizzes</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="text-lg font-bold text-white">25+</div>
            <p className="text-white/70 text-xs">Topics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
