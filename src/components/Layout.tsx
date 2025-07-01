import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationToastContainer } from './NotificationToast';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  User,
  Menu,
  X,
  CalendarDays,
  Sun,
  Moon
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { logout, isAdmin, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { toasts, removeToast, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: FileText, label: 'Calendar', path: '/calendar' },
  ];

  const patientNavItems = [
    { icon: User, label: 'My Profile', path: '/patient-profile' },
    { icon: CalendarDays, label: 'My Appointments', path: '/patient-appointments' },
  ];

  const navItems = isAdmin ? adminNavItems : patientNavItems;

  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Logo and brand */}
              <div className="flex items-center space-x-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* Clickable Logo */}
                <button
                  onClick={() => navigate(isAdmin ? '/dashboard' : '/patient-profile')}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
                >
                  <img 
                    src="/Dental-Logo.png" 
                    alt="ENTNT Dental Connect Logo" 
                    className="h-14 w-14 object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">ENTNT Dental Connect</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Professional Dental Management</p>
                  </div>
                </button>
              </div>
              
              {/* Right side - Notifications, Theme toggle, User info and logout */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Notifications */}
                <NotificationDropdown />
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Moon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  )}
                </button>
                
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <nav className={`
            fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-30
            w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg lg:shadow-sm 
            border-r border-blue-100 dark:border-gray-700 h-screen lg:h-[calc(100vh-4rem)]
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile sidebar header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-blue-100 dark:border-gray-700">
              <button
                onClick={() => {
                  navigate(isAdmin ? '/dashboard' : '/patient-profile');
                  closeSidebar();
                }}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
              >
                <img 
                  src="/Dental-Logo.png" 
                  alt="ENTNT Dental Connect Logo" 
                  className="h-10 w-10 object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ENTNT Dental Connect</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Professional Dental Management</p>
                </div>
              </button>
              <button
                onClick={closeSidebar}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info for mobile */}
            <div className="lg:hidden p-4 border-b border-blue-100 dark:border-gray-700 bg-blue-50/50 dark:bg-gray-800/50">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{user?.role}</p>
            </div>

            {/* Navigation items */}
            <div className="p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                      transition-all duration-200 font-medium text-sm
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400 hover:scale-102'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0 lg:ml-0">
            <div className="p-4 sm:p-6 max-w-full">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Notification Toast Container */}
      <NotificationToastContainer />
    </>
  );
};