// Reusable Badge Component with Interactive Animations
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  indigo: 'bg-indigo-100 text-indigo-800'
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  clickable = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    ${rounded ? 'rounded-full' : 'rounded-md'}
    ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
  `;

  const variantClasses = badgeVariants[variant] || badgeVariants.default;
  const sizeClasses = badgeSizes[size] || badgeSizes.md;

  const badgeClasses = cn(baseClasses, variantClasses, sizeClasses, className);

  const Component = clickable ? motion.button : motion.span;

  return (
    <Component
      ref={ref}
      className={badgeClasses}
      onClick={clickable ? onClick : undefined}
      whileHover={clickable ? { scale: 1.05 } : {}}
      whileTap={clickable ? { scale: 0.95 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </Component>
  );
});

Badge.displayName = 'Badge';

export default Badge;
