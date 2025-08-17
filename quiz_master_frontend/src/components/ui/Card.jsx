// Reusable Card Component with Interactive Animations
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-200 shadow-md',
  outlined: 'bg-white border-2 border-gray-200 shadow-none',
  ghost: 'bg-transparent border-none shadow-none',
  gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-sm'
};

const Card = React.forwardRef(({
  children,
  variant = 'default',
  hover = true,
  clickable = false,
  padding = 'default',
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    rounded-xl transition-all duration-200
    ${clickable ? 'cursor-pointer' : ''}
    ${padding === 'none' ? '' : 
      padding === 'sm' ? 'p-4' : 
      padding === 'lg' ? 'p-8' : 'p-6'}
  `;

  const variantClasses = cardVariants[variant] || cardVariants.default;
  const cardClasses = cn(baseClasses, variantClasses, className);

  const motionProps = {
    className: cardClasses,
    onClick: clickable ? onClick : undefined,
    ...(hover && {
      whileHover: { 
        y: -2, 
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      }
    }),
    ...(clickable && {
      whileTap: { scale: 0.98 }
    }),
    transition: { duration: 0.2 },
    ...props
  };

  return (
    <motion.div ref={ref} {...motionProps}>
      {children}
    </motion.div>
  );
});

// Card sub-components for better organization
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('mb-4 pb-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

Card.displayName = 'Card';
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
