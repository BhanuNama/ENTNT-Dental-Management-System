import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = StorageManager.getItem('theme', 'light') as 'light' | 'dark' | 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
    setIsDarkMode(shouldUseDark);
    
    // Apply theme to document
    updateDocumentTheme(shouldUseDark);
  }, []);

  const updateDocumentTheme = (darkMode: boolean) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    updateDocumentTheme(newDarkMode);
    StorageManager.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' as const : 'light' as const
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 