import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContextType } from '../types';
import { StorageManager } from '../utils/storage';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from storage on mount
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = StorageManager.getItem('notifications', []);
      
      // Add demo notifications for testing if no notifications exist
      if (storedNotifications.length === 0 && user) {
        const demoNotifications: Notification[] = [
          {
            id: 'welcome-notification',
            title: 'Welcome to ENTNT Dental Connect',
            message: 'Your dental management system is ready to use.',
            type: 'system',
            priority: 'low',
            isRead: false,
            createdAt: new Date().toISOString(),
            patientId: user.role === 'Patient' ? user.patientId : undefined,
            targetRole: user.role
          }
        ];
        
        StorageManager.setItem('notifications', demoNotifications);
        setNotifications(demoNotifications);
      } else {
        // Enhanced filtering for notifications based on role and targetRole
        const filteredNotifications = storedNotifications.filter((n: Notification) => {
          // If notification has a targetRole, only show to matching role
          if (n.targetRole) {
            return n.targetRole === user?.role;
          }
          
          // Legacy filtering for notifications without targetRole
          if (user?.role === 'Admin') {
            // Admin sees all notifications without specific targetRole
            return !n.patientId || true;
          } else if (user?.role === 'Patient') {
            // Patient sees only their notifications or system notifications
            return n.patientId === user.patientId || n.type === 'system' || !n.patientId;
          }
          
          return false;
        });
        
        setNotifications(filteredNotifications);
      }
    };

    loadNotifications();
  }, [user]);

  // Simplified cross-session notification handling
  useEffect(() => {
    const handleCreateNotification = (event: CustomEvent) => {
      const notificationData = event.detail;
      const newNotification: Notification = {
        id: `n${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        ...notificationData
      };

      // Enhanced notification filtering based on targetRole
      const shouldAddNotification = (() => {
        // If notification has a targetRole, only show to matching role
        if (newNotification.targetRole) {
          return newNotification.targetRole === user?.role;
        }
        
        // Legacy filtering for notifications without targetRole
        if (user?.role === 'Admin') {
          // Admin sees all notifications without specific targetRole
          return !newNotification.patientId || true;
        } else if (user?.role === 'Patient') {
          // Patient sees only their notifications or system notifications
          return newNotification.patientId === user?.patientId || 
                 newNotification.type === 'system' || 
                 !newNotification.patientId;
        }
        
        return false;
      })();

      if (shouldAddNotification) {
        // Add to UI state immediately
        setNotifications(prev => [newNotification, ...prev]);

        // Always show toast notification for immediate feedback
        window.dispatchEvent(new CustomEvent('newNotification', { 
          detail: newNotification 
        }));
      }

      // Store notification in global storage
      const allStoredNotifications = StorageManager.getItem('notifications', []);
      const allUpdatedNotifications = [newNotification, ...allStoredNotifications];
      StorageManager.setItem('notifications', allUpdatedNotifications);
    };

    // Simplified cross-session storage listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'notifications' && event.newValue) {
        try {
          const newNotifications = JSON.parse(event.newValue);
          
          // Enhanced filtering based on role and targetRole
          const filteredNotifications = newNotifications.filter((n: Notification) => {
            // If notification has a targetRole, only show to matching role
            if (n.targetRole) {
              return n.targetRole === user?.role;
            }
            
            // Legacy filtering for notifications without targetRole
            if (user?.role === 'Admin') {
              // Admin sees all notifications without specific targetRole
              return !n.patientId || true;
            } else if (user?.role === 'Patient') {
              // Patient sees only their notifications or system notifications
              return n.patientId === user?.patientId || n.type === 'system' || !n.patientId;
            }
            
            return false;
          });
          
          setNotifications(filteredNotifications);
        } catch (error) {
          console.error('Error handling notification storage change:', error);
        }
      }
    };

    // Set up event listeners
    window.addEventListener('createNotification', handleCreateNotification as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('createNotification', handleCreateNotification as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      id: `n${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notificationData
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    
    // Store all notifications (not filtered)
    const allStoredNotifications = StorageManager.getItem('notifications', []);
    const allUpdatedNotifications = [newNotification, ...allStoredNotifications];
    StorageManager.setItem('notifications', allUpdatedNotifications);

    // Dispatch custom event for toast notification
    window.dispatchEvent(new CustomEvent('newNotification', { 
      detail: newNotification 
    }));
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);

    // Update in storage
    const allStoredNotifications = StorageManager.getItem('notifications', []);
    const allUpdatedNotifications = allStoredNotifications.map((n: Notification) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    StorageManager.setItem('notifications', allUpdatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);

    // Update in storage
    const allStoredNotifications = StorageManager.getItem('notifications', []);
    const allUpdatedNotifications = allStoredNotifications.map((n: Notification) => {
      if (user?.role === 'Patient' && (n.patientId === user.patientId || n.type === 'system' || !n.patientId)) {
        return { ...n, isRead: true };
      } else if (user?.role === 'Admin') {
        return { ...n, isRead: true };
      }
      return n;
    });
    StorageManager.setItem('notifications', allUpdatedNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);

    // Update in storage
    const allStoredNotifications = StorageManager.getItem('notifications', []);
    const allUpdatedNotifications = allStoredNotifications.filter((n: Notification) => n.id !== notificationId);
    StorageManager.setItem('notifications', allUpdatedNotifications);
  };

  const clearAll = () => {
    // Clear notifications for current user context
    if (user?.role === 'Patient') {
      setNotifications([]);
      
      // Update storage - keep notifications for other patients
      const allStoredNotifications = StorageManager.getItem('notifications', []);
      const remainingNotifications = allStoredNotifications.filter((n: Notification) => 
        n.patientId && n.patientId !== user.patientId
      );
      StorageManager.setItem('notifications', remainingNotifications);
    } else {
      setNotifications([]);
      StorageManager.setItem('notifications', []);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 