import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 group relative overflow-hidden
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
      hover:from-blue-700 hover:to-indigo-700 
      focus:ring-blue-500 shadow-lg hover:shadow-xl 
      hover:shadow-blue-500/25 hover:-translate-y-0.5
    `,
    secondary: `
      bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
      border-2 border-gray-200 dark:border-gray-600 
      hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500
      focus:ring-gray-500 shadow-sm hover:shadow-md hover:-translate-y-0.5
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white 
      hover:from-red-700 hover:to-red-800 
      focus:ring-red-500 shadow-lg hover:shadow-xl 
      hover:shadow-red-500/25 hover:-translate-y-0.5
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600 text-white 
      hover:from-green-700 hover:to-emerald-700 
      focus:ring-green-500 shadow-lg hover:shadow-xl 
      hover:shadow-green-500/25 hover:-translate-y-0.5
    `,
    outline: `
      bg-transparent text-gray-700 dark:text-gray-300 
      border-2 border-gray-300 dark:border-gray-600 
      hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500
      focus:ring-gray-500 hover:-translate-y-0.5
    `,
    ghost: `
      text-gray-600 dark:text-gray-400 
      hover:text-gray-900 dark:hover:text-gray-100 
      hover:bg-gray-100 dark:hover:bg-gray-800 
      focus:ring-gray-500 rounded-xl
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Subtle shimmer effect for primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500" />
      )}
      
      {loading ? (
        <LoadingSpinner size="sm" className="text-current" />
      ) : icon ? (
        <span className="relative z-10">{icon}</span>
      ) : null}
      
      <span className="relative z-10">{children}</span>
    </button>
  );
};