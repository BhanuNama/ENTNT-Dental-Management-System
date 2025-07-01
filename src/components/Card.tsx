import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'subtle' | 'bordered' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  variant = 'default'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
    subtle: 'bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600',
    glass: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30'
  };

  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 ease-out cursor-pointer group'
    : '';

  return (
    <div 
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        rounded-2xl shadow-sm transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
};