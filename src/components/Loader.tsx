import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        viewBox="25 25 50 50" 
        className={`${sizeClasses[size]} animate-spin`}
        style={{
          transformOrigin: 'center',
          animation: 'rotate4 2s linear infinite'
        }}
      >
        <circle 
          cx={50} 
          cy={50} 
          r={20} 
          fill="none"
          stroke="#106ee8"
          strokeWidth="10"
          strokeLinecap="round"
          className="animate-pulse"
          style={{
            strokeDasharray: '2, 200',
            strokeDashoffset: '0',
            animation: 'dash4 1.5s ease-in-out infinite'
          }}
        />
      </svg>
      
      <style jsx>{`
        @keyframes rotate4 {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash4 {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dashoffset: -125px;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader; 