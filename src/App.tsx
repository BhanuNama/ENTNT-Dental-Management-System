import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Calendar } from './pages/Calendar';
import { PatientProfile } from './pages/PatientProfile';
import { PatientAppointments } from './pages/PatientAppointments';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
        <NotificationProvider>
      <DataProvider>
        <Router>
          <Routes>
              <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patients"
                element={
                  <ProtectedRoute adminOnly>
                    <Patients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="appointments"
                element={
                  <ProtectedRoute adminOnly>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <ProtectedRoute adminOnly>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route path="patient-profile" element={<PatientProfile />} />
              <Route path="patient-appointments" element={<PatientAppointments />} />
              {/* Redirect old patient-view to patient-profile */}
              <Route path="patient-view" element={<Navigate to="/patient-profile" replace />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
      </NotificationProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;