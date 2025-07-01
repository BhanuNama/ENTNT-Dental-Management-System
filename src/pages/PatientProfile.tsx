import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../context/NotificationContext';
import { StorageManager } from '../utils/storage';
import { format, differenceInYears, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Heart,
  Shield,
  FileText,
  Clock,
  DollarSign,
  RefreshCw,
  Bell,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Activity,
  TrendingUp,
  CreditCard,
  Award,
  Zap
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const { patients, incidents, refreshData } = useData();
  const { showInfo, showSuccess, showError, showWarning } = useToast();
  const { notifications } = useNotifications();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [profileChangeCount, setProfileChangeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const patient = patients.find(p => p.id === user?.patientId);
  const patientIncidents = incidents.filter(i => i.patientId === user?.patientId);

  // Enhanced real-time update listeners with specific patient focus
  useEffect(() => {
    const handleAppointmentAdded = (event: CustomEvent) => {
      const { patientId, appointment } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        showSuccess('New Appointment Scheduled! 📅', `"${appointment.title}" has been added to your schedule`);
      }
    };

    const handleAppointmentUpdated = (event: CustomEvent) => {
      const { patientId, appointment } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        showInfo('Appointment Modified! ✏️', `"${appointment.title}" details have been updated`);
      }
    };

    const handleAppointmentDeleted = (event: CustomEvent) => {
      const { patientId, appointmentTitle } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        showWarning('Appointment Cancelled! ❌', `"${appointmentTitle}" has been removed from your schedule`);
      }
    };

    const handlePatientUpdated = (event: CustomEvent) => {
      const { patientId } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        showSuccess('Profile Updated! 👤', 'Your personal information has been updated');
      }
    };

    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = 'detail' in event ? event.detail?.key : event.key;
      if (key === 'incidents' || key === 'patients') {
        setIsLoading(true);
        setTimeout(() => {
          refreshData();
          setLastUpdateTime(new Date().toISOString());
          setProfileChangeCount(prev => prev + 1);
          showInfo('Data Synchronized! 🔄', 'Your information has been synchronized across devices');
          setIsLoading(false);
        }, 500);
      }
    };

    // Handle custom localStorage events
    const handleLocalStorageChanged = (event: CustomEvent) => {
      handleStorageChange(event);
    };

    // Listen for custom storage events
    const handleDataStored = (event: CustomEvent) => {
      const { key } = event.detail;
      if (key === 'incidents' || key === 'patients') {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
      }
    };

    // Listen for notification events specifically for patient
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      if (notification.patientId === user?.patientId || 
          (notification.type === 'system' && notification.message.includes(patient?.name))) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        
        // Enhanced notification handling with different types
        if (notification.type === 'appointment') {
          showSuccess('📅 Appointment Update!', notification.message);
        } else if (notification.type === 'update') {
          showInfo('ℹ️ Profile Update!', notification.message);
        } else if (notification.type === 'reminder') {
          showWarning('⏰ Reminder!', notification.message);
        } else if (notification.type === 'system') {
          showInfo('🔄 System Update!', notification.message);
        }
      }
    };

    // Add all event listeners
    window.addEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated as EventListener);
    window.addEventListener('appointmentDeleted', handleAppointmentDeleted as EventListener);
    window.addEventListener('patientUpdated', handlePatientUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
    window.addEventListener('dataStored', handleDataStored as EventListener);
    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated as EventListener);
      window.removeEventListener('appointmentDeleted', handleAppointmentDeleted as EventListener);
      window.removeEventListener('patientUpdated', handlePatientUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
      window.removeEventListener('dataStored', handleDataStored as EventListener);
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [user?.patientId, patient?.name, refreshData, showSuccess, showInfo, showWarning]);

  // Enhanced periodic data refresh with smart change detection
  useEffect(() => {
    const interval = setInterval(() => {
      const storedIncidents = StorageManager.getItem('incidents', []);
      const storedPatients = StorageManager.getItem('patients', []);
      const currentPatientIncidents = storedIncidents.filter((i: any) => i.patientId === user?.patientId);
      const currentPatient = storedPatients.find((p: any) => p.id === user?.patientId);
      
      // Detailed change detection
      const incidentChanges = currentPatientIncidents.length !== patientIncidents.length;
      const patientChanges = JSON.stringify(currentPatient) !== JSON.stringify(patient);
      
      if (incidentChanges || patientChanges) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setProfileChangeCount(prev => prev + 1);
        
        // Show specific change notifications
        if (incidentChanges && patientChanges) {
          showInfo('📊 Complete Update!', 'Both your profile and appointments have been updated');
        } else if (incidentChanges) {
          showInfo('📅 Appointment Update!', 'Your appointment schedule has been updated');
        } else if (patientChanges) {
          showInfo('👤 Profile Update!', 'Your personal information has been updated');
        }
      }
    }, 3000); // Check every 3 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [user?.patientId, patientIncidents.length, patient, refreshData, showInfo]);

  const completedTreatments = patientIncidents.filter(i => i.status === 'Completed').length;
  const upcomingAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && new Date(i.appointmentDate) > new Date()
  ).length;
  const totalSpent = patientIncidents
    .filter(i => i.status === 'Completed')
    .reduce((sum, i) => sum + (i.cost || 0), 0);

  // Enhanced appointment analysis
  const todayAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && isToday(new Date(i.appointmentDate))
  );
  const tomorrowAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && isTomorrow(new Date(i.appointmentDate))
  );
  const thisWeekAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && 
    isWithinInterval(new Date(i.appointmentDate), {
      start: new Date(),
      end: addDays(new Date(), 7)
    })
  );

  const handleManualRefresh = () => {
    setIsLoading(true);
    refreshData();
    setLastUpdateTime(new Date().toISOString());
    setProfileChangeCount(prev => prev + 1);
    setTimeout(() => {
      setIsLoading(false);
      showSuccess('Profile Refreshed! 🔄', 'Your information has been updated');
    }, 1000);
  };

  // Calculate patient age
  const age = patient?.dob ? differenceInYears(new Date(), new Date(patient.dob)) : 0;

  // Patient notifications related to them
  const unreadPatientNotifications = notifications.filter(n => 
    !n.isRead && (n.patientId === user?.patientId || n.message.includes(patient?.name || ''))
  );

  if (!patient) {
    return (
      <div className="space-y-6 p-1">
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Not Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Unable to load your patient profile. Please contact support.
          </p>
          <Button onClick={handleManualRefresh} icon={<RefreshCw className="h-5 w-5" />}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header Section */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/30 dark:border-gray-700/30 flex-shrink-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                  Welcome, {patient.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  Your personal health dashboard
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
              {unreadPatientNotifications.length > 0 && (
                <Card variant="subtle" padding="sm" className="border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                      {unreadPatientNotifications.length} new
                    </span>
                  </div>
                </Card>
              )}
              <Button 
                variant="outline" 
                onClick={handleManualRefresh} 
                loading={isLoading}
                icon={<RefreshCw className="h-4 w-4" />}
                className="w-full sm:w-auto justify-center min-w-[100px]"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingAppointments}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTreatments}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalSpent}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayAppointments.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                </div>
              </div>
            </div>
          </div>

          {lastUpdateTime && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-4 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Last updated: {format(new Date(lastUpdateTime), 'h:mm:ss a')}
            </p>
          )}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Information */}
        <Card className="lg:col-span-2" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your profile details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="subtle" padding="md">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{age} years old</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {format(new Date(patient.createdAt), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="subtle" padding="md">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{patient.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{patient.email}</p>
                  </div>
                </div>
                {patient.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">{patient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-6 space-y-4">
            {patient.healthInfo && (
              <Card variant="subtle" padding="md" className="border-l-4 border-l-red-500">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Health Information</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{patient.healthInfo}</p>
                  </div>
                </div>
              </Card>
            )}

            {patient.insurance && (
              <Card variant="subtle" padding="md" className="border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Insurance Provider</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{patient.insurance}</p>
                  </div>
                </div>
              </Card>
            )}

            {patient.emergencyContact && (
              <Card variant="subtle" padding="md" className="border-l-4 border-l-orange-500">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Emergency Contact</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">{patient.emergencyContact}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments Sidebar */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Appointments</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your next visits</p>
            </div>
          </div>

          {/* Today's Appointments */}
          {todayAppointments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Today's Appointments
              </h4>
              <div className="space-y-2">
                {todayAppointments.map((appointment) => (
                  <Card key={appointment.id} variant="subtle" padding="sm" className="border-l-4 border-l-orange-500">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{appointment.title}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.appointmentDate), 'h:mm a')}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow's Appointments */}
          {tomorrowAppointments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Tomorrow
              </h4>
              <div className="space-y-2">
                {tomorrowAppointments.map((appointment) => (
                  <Card key={appointment.id} variant="subtle" padding="sm" className="border-l-4 border-l-blue-500">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{appointment.title}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.appointmentDate), 'h:mm a')}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Upcoming */}
          {thisWeekAppointments.filter(a => !isToday(new Date(a.appointmentDate)) && !isTomorrow(new Date(a.appointmentDate))).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                This Week
              </h4>
              <div className="space-y-2">
                {thisWeekAppointments
                  .filter(a => !isToday(new Date(a.appointmentDate)) && !isTomorrow(new Date(a.appointmentDate)))
                  .slice(0, 3)
                  .map((appointment) => (
                    <Card key={appointment.id} variant="subtle" padding="sm" className="border-l-4 border-l-green-500">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{appointment.title}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(appointment.appointmentDate), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {upcomingAppointments === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No upcoming appointments scheduled
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your latest medical history</p>
            </div>
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            {patientIncidents.length} total records
          </div>
        </div>

        <div className="space-y-3">
          {patientIncidents
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
            .slice(0, 5)
            .map((incident) => (
              <Card key={incident.id} variant="subtle" hover className="group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      incident.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30' :
                      incident.status === 'Scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      incident.status === 'In Progress' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {incident.status === 'Completed' ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                       incident.status === 'Scheduled' ? <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                       incident.status === 'In Progress' ? <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> :
                       <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {incident.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(incident.appointmentDate), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      incident.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      incident.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      incident.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {incident.status}
                    </span>
                    {incident.cost && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        ${incident.cost}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {patientIncidents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No medical records found
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};