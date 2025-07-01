import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'floating';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseInputClasses = `
    w-full transition-all duration-200 font-medium text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500 
    focus:outline-none focus:ring-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
      bg-white dark:bg-gray-800 
      focus:border-blue-500 dark:focus:border-blue-400 
      focus:shadow-lg focus:shadow-blue-500/10 dark:focus:shadow-blue-400/10
      hover:border-gray-300 dark:hover:border-gray-500
    `,
    minimal: `
      px-3 py-2.5 border-b-2 border-gray-200 dark:border-gray-600 
      bg-transparent 
      focus:border-blue-500 dark:focus:border-blue-400
      hover:border-gray-300 dark:hover:border-gray-500
    `,
    floating: `
      px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
      bg-gray-50/50 dark:bg-gray-800/50 
      focus:bg-white dark:focus:bg-gray-800 
      focus:border-blue-500 dark:focus:border-blue-400 
      focus:shadow-lg focus:shadow-blue-500/10 dark:focus:shadow-blue-400/10
      hover:bg-gray-50 dark:hover:bg-gray-800/70
    `
  };

  const errorClasses = error 
    ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:shadow-red-500/10 dark:focus:shadow-red-400/10' 
    : '';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
            {icon}
          </div>
        )}
        
        <input
          className={`
            ${baseInputClasses}
            ${variantClasses[variant]}
            ${errorClasses}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};