import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { showError, showSuccess } = useToast();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = login(email, password);
      if (success) {
        showSuccess('Login successful', 'Welcome back!');
      } else {
        showError('Login failed', 'Invalid email or password');
      }
    } catch (err) {
      showError('Login error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@entnt.in', password: 'admin123', description: 'Full access to patient management' },
    { role: 'Patient', email: 'john@entnt.in', password: 'patient123', description: 'View appointments and profile' }
  ];

  const handleDemoLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setLoading(true);

    // Small delay to show the credentials being filled
    setTimeout(() => {
      try {
        const success = login(email, password);
        if (success) {
          showSuccess('Demo login successful', 'Welcome to ENTNT Dental Connect!');
        } else {
          showError('Login failed', 'Invalid demo credentials');
        }
      } catch (err) {
        showError('Login error', 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("/login-bg.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        filter: 'contrast(1.1) saturate(1.1) brightness(1.05)'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/30 backdrop-blur-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/Dental-Logo.png" 
              alt="ENTNT Dental Connect Logo" 
              className="h-24 w-24 object-contain rounded-2xl shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">ENTNT Dental Connect</h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Professional Dental Management System</p>
        </div>

        {/* Login Form */}
        <Card padding="lg" className="shadow-2xl border-blue-100 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5" />}
              required
            />

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Demo Accounts</h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDemoLogin(cred.email, cred.password)}
                  disabled={loading}
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Login as {cred.role}
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {cred.email} / {cred.password}
                      </p>
                    </div>
                    <div className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};