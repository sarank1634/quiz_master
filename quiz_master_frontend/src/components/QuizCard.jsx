// Enhanced QuizCard Component with Robust UI System Integration
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiClock, FiChevronRight, FiEye, FiPlay, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Card, Button, Badge, FadeIn } from './ui';
import { cn, formatDate, calculatePercentage } from '../lib/utils';

export default function QuizCard({ 
  quiz, 
  onStart, 
  onView, 
  userRole = 'user',
  showStats = false,
  compact = false,
  className = '',
  ...props 
}) {
  const navigate = useNavigate();
  const dt = quiz.scheduledAt ? new Date(quiz.scheduledAt) : (quiz.date ? new Date(quiz.date) : null);
  
  // Enhanced navigation handlers with error handling
  const handleStartQuiz = async () => {
    try {
      if (onStart) {
        await onStart(quiz);
      } else {
        const basePath = userRole === 'admin' ? '/admin' : '/user';
        navigate(`${basePath}/quiz/${quiz.id}/start`);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };
  
  const handleViewDetails = async () => {
    try {
      if (onView) {
        await onView(quiz);
      } else {
        const basePath = userRole === 'admin' ? '/admin' : '/user';
        navigate(`${basePath}/quiz/${quiz.id}/details`);
      }
    } catch (error) {
      console.error('Error viewing quiz details:', error);
    }
  };
  
  // Enhanced quiz status logic
  const getQuizStatus = () => {
    if (quiz.status) return quiz.status;
    if (quiz.completed) return 'completed';
    if (quiz.inProgress) return 'in-progress';
    if (dt && dt > new Date()) return 'scheduled';
    return 'available';
  };
  
  const status = getQuizStatus();
  
  // Status-based styling and content
  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        badge: { variant: 'success', text: 'Completed' },
        button: { variant: 'success', text: 'Review Quiz', icon: FiEye }
      },
      'in-progress': {
        badge: { variant: 'warning', text: 'In Progress' },
        button: { variant: 'warning', text: 'Continue Quiz', icon: FiPlay }
      },
      scheduled: {
        badge: { variant: 'info', text: 'Scheduled' },
        button: { variant: 'secondary', text: 'View Details', icon: FiCalendar }
      },
      available: {
        badge: { variant: 'primary', text: 'Available' },
        button: { variant: 'default', text: 'Start Quiz', icon: FiPlay }
      }
    };
    return configs[status] || configs.available;
  };
  
  const statusConfig = getStatusConfig(status);
  
  // Calculate completion percentage if available
  const completionPercentage = quiz.score && quiz.totalQuestions 
    ? calculatePercentage(quiz.score, quiz.totalQuestions) 
    : null;

  if (compact) {
    return (
      <FadeIn className={cn('mb-3', className)}>
        <Card 
          variant="default" 
          hover={true} 
          clickable={true}
          onClick={handleViewDetails}
          className="p-4"
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {quiz.subject || quiz.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiFileText className="w-3 h-3" />
                  {quiz.questions || quiz.questionCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {quiz.duration || quiz.timeLimit || 0}m
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge {...statusConfig.badge}>
                {statusConfig.badge.text}
              </Badge>
              <Button
                size="sm"
                variant={statusConfig.button.variant}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartQuiz();
                }}
                icon={<statusConfig.button.icon className="w-3 h-3" />}
              >
                {statusConfig.button.text}
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn className={cn('mb-6', className)}>
      <Card 
        variant="elevated" 
        hover={true}
        className="overflow-hidden"
        {...props}
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <motion.h3 
                className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2" 
                onClick={handleViewDetails}
                whileHover={{ scale: 1.02 }}
              >
                {quiz.subject || quiz.title}
              </motion.h3>
              <Badge {...statusConfig.badge} size="lg">
                {statusConfig.badge.text}
              </Badge>
            </div>
            
            {quiz.chapter && (
              <p className="text-lg text-gray-700 mb-2 font-medium">{quiz.chapter}</p>
            )}
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {quiz.description || 'Test your knowledge with this comprehensive quiz.'}
            </p>
            
            {/* Quiz Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{quiz.questions || quiz.questionCount || 0}</span>
                <span>questions</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiClock className="w-4 h-4 text-green-500" />
                <span className="font-medium">{quiz.duration || quiz.timeLimit || 0}</span>
                <span>minutes</span>
              </div>
              
              {quiz.difficulty && (
                <Badge 
                  variant={
                    quiz.difficulty === 'easy' ? 'success' :
                    quiz.difficulty === 'medium' ? 'warning' :
                    quiz.difficulty === 'hard' ? 'danger' : 'default'
                  }
                  size="sm"
                >
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </Badge>
              )}
              
              {completionPercentage !== null && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{completionPercentage}%</span>
                  <span>score</span>
                </div>
              )}
            </div>
            
            {/* Schedule Information */}
            {dt && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(dt, 'long')} at {formatDate(dt, 'time')}</span>
              </div>
            )}
            
            {/* Progress Bar for In-Progress Quizzes */}
            {status === 'in-progress' && quiz.progress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{quiz.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-yellow-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${quiz.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Stats Panel (if enabled) */}
          {showStats && quiz.stats && (
            <div className="lg:w-64 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
              <div className="space-y-2 text-sm">
                {quiz.stats.attempts && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempts:</span>
                    <span className="font-medium">{quiz.stats.attempts}</span>
                  </div>
                )}
                {quiz.stats.averageScore && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{quiz.stats.averageScore}%</span>
                  </div>
                )}
                {quiz.stats.completionRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion:</span>
                    <span className="font-medium">{quiz.stats.completionRate}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleViewDetails}
            icon={<FiEye className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            View Details
          </Button>
          
          <Button
            variant={statusConfig.button.variant}
            onClick={handleStartQuiz}
            icon={<statusConfig.button.icon className="w-4 h-4" />}
            iconPosition="left"
            className="flex-1 sm:flex-none"
            disabled={status === 'scheduled' && dt && dt > new Date()}
          >
            {statusConfig.button.text}
            <FiChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </FadeIn>
  );
}

// Export variants for different use cases
QuizCard.Compact = (props) => <QuizCard {...props} compact={true} />;
QuizCard.WithStats = (props) => <QuizCard {...props} showStats={true} />;
