// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiMaximize2, FiMinimize2, FiMove, FiSettings } from 'react-icons/fi';

const DashboardLayout = ({ 
  children, 
  columns = 12, 
  gap = 4, 
  className = '',
  enableDragDrop = false,
  enableResize = false 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState({});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`dashboard-layout ${className}`}>
      {/* Layout Controls */}
      {(enableDragDrop || enableResize) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <FiGrid className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Dashboard Layout</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiSettings className="w-4 h-4 mr-2 inline" />
              {isEditMode ? 'Exit Edit' : 'Edit Layout'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid gap-${gap} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${Math.min(columns, 4)}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            layout
            className={`dashboard-item ${isEditMode ? 'edit-mode' : ''}`}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
