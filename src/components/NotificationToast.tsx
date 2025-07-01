import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit, AlertCircle, Settings, Bell } from 'lucide-react';
import { Notification } from '../types';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 6 seconds for better readability
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'appointment':
        return <Calendar className={iconClass} />;
      case 'update':
        return <Edit className={iconClass} />;
      case 'reminder':
        return <AlertCircle className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColors = (type: string, priority: string) => {
    if (priority === 'high') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        progress: 'bg-red-400'
      };
    }
    if (priority === 'medium') {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-100',
        progress: 'bg-yellow-400'
      };
    }
    
    switch (type) {
      case 'appointment':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          progress: 'bg-blue-400'
        };
      case 'update':
        return {
          bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-900 dark:text-green-100',
          progress: 'bg-green-400'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          progress: 'bg-blue-400'
        };
    }
  };

  const colors = getNotificationColors(notification.type, notification.priority);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 w-80 p-4 rounded-xl border-2 shadow-2xl backdrop-blur-sm z-[9999]
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${colors.bg}
      `}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${colors.icon} p-1`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${colors.title} leading-tight`}>
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-[6000ms] ease-linear ${colors.progress}`}
          style={{ 
            width: isVisible ? '0%' : '100%',
            transition: isVisible ? 'width 6s linear' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as Notification;
      setToasts(prev => [...prev, notification]);
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, []);

  const removeToast = (notificationId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== notificationId));
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-3 pointer-events-none z-[9999]" style={{ zIndex: 9999 }}>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(-${index * 8}px)`,
            zIndex: 9999 - index 
          }}
        >
          <ToastNotification 
            notification={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        </div>
      ))}
    </div>
  );
}; 