import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import useGoogleAuth from '../hooks/useGoogleAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    qualification: '',
    dob: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, auto-login after registration
      dispatch(loginSuccess({ 
        user: { 
          name: formData.fullName, 
          email: formData.email,
          qualification: formData.qualification 
        }, 
        token: 'demo-token' 
      }));
      
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { name: 'fullName', type: 'text', placeholder: 'Full Name', icon: '👤' },
    { name: 'email', type: 'email', placeholder: 'Email Address', icon: '📧' },
    { name: 'password', type: 'password', placeholder: 'Password', icon: '🔒' },
    { name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password', icon: '🔐' },
    { name: 'qualification', type: 'text', placeholder: 'Qualification', icon: '🎓' },
    { name: 'dob', type: 'date', placeholder: 'Date of Birth', icon: '📅' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-white/5 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-white/5 rounded-full animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors duration-200"
        >
          <span>←</span> Back to Home
        </Link>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join Quiz Master and start your learning journey</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {inputFields.map((field) => (
              <div key={field.name} className="relative">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
                      errors[field.name] 
                        ? 'border-red-400 focus:border-red-300' 
                        : focusedField === field.name 
                        ? 'border-white/50 focus:border-white/70 bg-white/20' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  />
                  {focusedField === field.name && (
                    <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse pointer-events-none"></div>
                  )}
                </div>
                {errors[field.name] && (
                  <p className="text-red-300 text-sm mt-1 animate-fade-in">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={() => googleLogin()}
            className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <span>🔗</span> Sign up with Google
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-white font-semibold hover:text-white/80 transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl mb-2">🧠</div>
            <p className="text-white/80 text-sm">Smart Quizzes</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-white/80 text-sm">Progress Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
