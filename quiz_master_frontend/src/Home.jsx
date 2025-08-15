import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from './store/authSlice';
import useGoogleAuth from './hooks/useGoogleAuth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const googleLogin = useGoogleAuth();
  const navigate = useNavigate();

  const handleNormalLogin = () => {
    dispatch(loginSuccess({
      user: { name: 'Test User', email: 'test@example.com' },
      token: 'dummy-token'
    }));
  };

  const features = [
    {
      icon: '🧠',
      title: 'Smart Quizzes',
      description: 'AI-powered questions that adapt to your knowledge level'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics'
    },
    {
      icon: '🏆',
      title: 'Achievements',
      description: 'Earn badges and compete with friends on leaderboards'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Take quizzes anywhere with our responsive design'
    }
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Quiz Master</h1>
              <button
                onClick={() => dispatch(logout())}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user.name || user.email}! 👋
            </h2>
            <p className="text-xl text-white/80">
              Ready to challenge your knowledge today?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Quiz</h3>
              <p className="text-white/70">Begin a new quiz challenge</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">My Progress</h3>
              <p className="text-white/70">View your learning stats</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-2">Leaderboard</h3>
              <p className="text-white/70">See how you rank</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in">
              Quiz Master
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
              Challenge your mind, expand your knowledge, and compete with friends in the ultimate quiz experience
            </p>
            
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                🚀 Get Started
              </button>
              
              <button
                onClick={() => navigate('/register')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                📝 Sign Up
              </button>
              
              <button
                onClick={() => googleLogin()}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-xl flex items-center gap-2"
              >
                <span>🔗</span> Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Quiz Master?</h2>
            <p className="text-xl text-white/70">Discover what makes our platform special</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-white/70">Active Users</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-white/70">Quizzes Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">25+</div>
            <div className="text-white/70">Categories</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Test Your Knowledge?</h2>
          <p className="text-xl text-white/70 mb-8">Join thousands of learners and start your quiz journey today!</p>
          <button
            onClick={handleNormalLogin}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            🎯 Start Quiz Now (Demo)
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 Quiz Master. Built with ❤️ for learners everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
