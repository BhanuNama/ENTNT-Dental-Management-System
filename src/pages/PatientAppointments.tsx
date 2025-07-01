import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../context/NotificationContext';
import { StorageManager } from '../utils/storage';
import { format, isToday, isTomorrow, isWithinInterval, addDays, differenceInHours } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  ExternalLink,
  Activity,
  TrendingUp,
  MapPin,
  User,
  Phone,
  Mail,
  X,
  Zap,
  Award,
  Star,
  Bookmark
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { downloadFile, validateFileForDownload } from '../utils/fileDownload';
import Loader from '../components/Loader';

export const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const { patients, incidents, refreshData, processPayment } = useData();
  const { showSuccess, showInfo, showError, showWarning } = useToast();
  const { notifications } = useNotifications();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [appointmentChangeCount, setAppointmentChangeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    incidentId: string;
    amount: number;
    treatment: string;
  }>({
    isOpen: false,
    incidentId: '',
    amount: 0,
    treatment: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const patient = patients.find(p => p.id === user?.patientId);
  const patientIncidents = incidents.filter(i => i.patientId === user?.patientId);

  // Enhanced real-time update listeners with comprehensive appointment focus
  useEffect(() => {
    const handleAppointmentAdded = (event: CustomEvent) => {
      const { patientId, appointment } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        showSuccess('New Appointment Scheduled! 📅', `"${appointment.title}" has been added to your schedule`);
      }
    };

    const handleAppointmentUpdated = (event: CustomEvent) => {
      const { patientId, appointment } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        showInfo('Appointment Modified! ✏️', `"${appointment.title}" details have been updated`);
      }
    };

    const handleAppointmentDeleted = (event: CustomEvent) => {
      const { patientId, appointmentTitle } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        showWarning('Appointment Cancelled! ❌', `"${appointmentTitle}" has been removed from your schedule`);
      }
    };

    const handleAppointmentCompleted = (event: CustomEvent) => {
      const { patientId, appointment } = event.detail;
      if (patientId === user?.patientId) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        showSuccess('Treatment Completed! ✅', `"${appointment.title}" has been marked as completed`);
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
          setAppointmentChangeCount(prev => prev + 1);
          showInfo('Data Synchronized! 🔄', 'Your appointment information has been synchronized across devices');
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

    // Enhanced notification handling for appointments
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      if (notification.patientId === user?.patientId || 
          (notification.type === 'system' && notification.message.includes(patient?.name))) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        
        // Enhanced notification handling with appointment-specific messages
        if (notification.type === 'appointment') {
          showSuccess('📅 Appointment Update!', notification.message);
        } else if (notification.type === 'reminder') {
          showWarning('⏰ Appointment Reminder!', notification.message);
        } else if (notification.type === 'cancellation') {
          showWarning('❌ Appointment Cancelled!', notification.message);
        } else if (notification.type === 'reschedule') {
          showInfo('🔄 Appointment Rescheduled!', notification.message);
        } else if (notification.type === 'completion') {
          showSuccess('✅ Treatment Completed!', notification.message);
        } else if (notification.type === 'system') {
          showInfo('🔄 System Update!', notification.message);
        }
      }
    };

    // Add all event listeners
    window.addEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated as EventListener);
    window.addEventListener('appointmentDeleted', handleAppointmentDeleted as EventListener);
    window.addEventListener('appointmentCompleted', handleAppointmentCompleted as EventListener);
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
    window.addEventListener('dataStored', handleDataStored as EventListener);
    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('appointmentAdded', handleAppointmentAdded as EventListener);
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated as EventListener);
      window.removeEventListener('appointmentDeleted', handleAppointmentDeleted as EventListener);
      window.removeEventListener('appointmentCompleted', handleAppointmentCompleted as EventListener);
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
      window.removeEventListener('dataStored', handleDataStored as EventListener);
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [user?.patientId, patient?.name, refreshData, showSuccess, showInfo, showWarning]);

  // Enhanced periodic data refresh with smart appointment change detection
  useEffect(() => {
    const interval = setInterval(() => {
      const storedIncidents = StorageManager.getItem('incidents', []);
      const currentPatientIncidents = storedIncidents.filter((i: any) => i.patientId === user?.patientId);
      
      // Detailed appointment change detection
      const appointmentCountChanged = currentPatientIncidents.length !== patientIncidents.length;
      const appointmentStatusChanged = currentPatientIncidents.some((newIncident: any) => {
        const oldIncident = patientIncidents.find(old => old.id === newIncident.id);
        return oldIncident && oldIncident.status !== newIncident.status;
      });
      
      if (appointmentCountChanged || appointmentStatusChanged) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        setAppointmentChangeCount(prev => prev + 1);
        
        // Show specific change notifications
        if (appointmentCountChanged && appointmentStatusChanged) {
          showInfo('📊 Multiple Updates!', 'Your appointments have been updated with new additions and status changes');
        } else if (appointmentCountChanged) {
          const change = currentPatientIncidents.length > patientIncidents.length ? 'added' : 'removed';
          showInfo(`📅 Appointment ${change}!`, `An appointment has been ${change} to your schedule`);
        } else if (appointmentStatusChanged) {
          showInfo('🔄 Status Update!', 'One or more of your appointments have had status changes');
        }
      }
    }, 3000); // Check every 3 seconds for responsive updates

    return () => clearInterval(interval);
  }, [user?.patientId, patientIncidents.length, patientIncidents, refreshData, showInfo]);

  const upcomingAppointments = React.useMemo(() => {
    return patientIncidents
    .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }, [patientIncidents]);

  const treatmentHistory = patientIncidents
    .filter(i => i.status === 'Completed')
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  // Enhanced appointment intelligence
  const todayAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && isToday(new Date(i.appointmentDate))
  );
  const tomorrowAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && isTomorrow(new Date(i.appointmentDate))
  );
  const thisWeekAppointments = patientIncidents.filter(i => 
    i.status === 'Scheduled' && 
    isWithinInterval(new Date(i.appointmentDate), { start: new Date(), end: addDays(new Date(), 7) })
  );

  // Calculate stats
  const totalAppointments = patientIncidents.length;
  const completedTreatments = patientIncidents.filter(i => i.status === 'Completed').length;
  const totalSpent = patientIncidents
    .filter(i => i.status === 'Completed')
    .reduce((sum, i) => sum + (i.cost || 0), 0);
  const inProgressAppointments = patientIncidents.filter(i => i.status === 'In Progress').length;

  const handleFileDownload = async (file: any) => {
    if (!validateFileForDownload(file)) {
      showError('Invalid File! ❌', 'This file cannot be downloaded. It may be corrupted or missing.');
      return;
    }

    // Add file to downloading set
    setDownloadingFiles(prev => new Set(prev).add(file.id));

    try {
      const result = await downloadFile(file);
      
      if (result.success) {
        showSuccess('File Downloaded! 📄', result.message);
      } else {
        showError('Download Failed! ❌', result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      showError('Download Failed! ❌', 'An unexpected error occurred while downloading the file.');
    } finally {
      // Remove file from downloading set
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    refreshData();
    setLastUpdateTime(new Date().toISOString());
    setAppointmentChangeCount(prev => prev + 1);
    setTimeout(() => {
      setIsLoading(false);
      showSuccess('Appointments Refreshed! 🔄', 'Your appointment information has been updated');
    }, 1000);
  };

  // Appointment status helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'Scheduled': return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'In Progress': return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'Cancelled': return <X className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Patient notifications related to appointments
  const unreadAppointmentNotifications = notifications.filter(n => 
    !n.isRead && (n.patientId === user?.patientId || n.message.includes(patient?.name || ''))
  );

  const handlePayment = (incidentId: string, amount: number, treatment: string) => {
    setPaymentModal({
      isOpen: true,
      incidentId,
      amount,
      treatment
    });
  };

  const confirmPayment = async () => {
    setIsProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      processPayment(paymentModal.incidentId, paymentModal.amount);
      setPaymentModal({ isOpen: false, incidentId: '', amount: 0, treatment: '' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const cancelPayment = () => {
    setPaymentModal({ isOpen: false, incidentId: '', amount: 0, treatment: '' });
  };

  if (!patient) {
    return (
      <div className="space-y-6 p-1">
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Patient Not Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Unable to load your patient information. Please contact support.
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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10"></div>
        <div className="relative">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/30 dark:border-gray-700/30">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  My Appointments
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Track your treatments and upcoming visits
                </p>
              </div>
      </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
              {unreadAppointmentNotifications.length > 0 && (
                <Card variant="subtle" padding="sm" className="border-emerald-200 dark:border-emerald-800 w-full sm:w-auto">
                  <div className="flex items-center justify-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium">
                      {unreadAppointmentNotifications.length} new notification{unreadAppointmentNotifications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Card>
              )}
              <Button 
                variant="outline" 
                onClick={handleManualRefresh} 
                loading={isLoading}
                icon={<RefreshCw className="h-4 w-4" />}
                className="w-full sm:w-auto justify-center"
              >
                <span className="sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="stats-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{totalAppointments}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-emerald-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{upcomingAppointments.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{completedTreatments}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-purple-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">${totalSpent}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {lastUpdateTime && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Last updated: {format(new Date(lastUpdateTime), 'h:mm:ss a')}
            </p>
          )}
        </div>
      </Card>

      {/* Upcoming Appointments Section */}
      {upcomingAppointments.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Appointments</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your scheduled visits</p>
              </div>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              {upcomingAppointments.length} scheduled
            </div>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <Card key={appointment.id} variant="subtle" hover className="group">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                      isToday(new Date(appointment.appointmentDate)) ? 'bg-orange-100 dark:bg-orange-900/30' :
                      isTomorrow(new Date(appointment.appointmentDate)) ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {appointment.title}
                        </h4>
                        <div className="flex gap-2">
                          {isToday(new Date(appointment.appointmentDate)) && (
                            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                              Today
                            </span>
                          )}
                          {isTomorrow(new Date(appointment.appointmentDate)) && (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                              Tomorrow
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base">{appointment.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{format(new Date(appointment.appointmentDate), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        {appointment.cost && (
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium">${appointment.cost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start sm:self-center ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                    </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Treatment History Section */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
          <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Treatment History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your completed treatments</p>
            </div>
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            {treatmentHistory.length} completed
          </div>
        </div>

        {treatmentHistory.length > 0 ? (
          <div className="space-y-4">
            {treatmentHistory.map((incident) => (
              <div key={incident.id} className="group">
                <Card variant="subtle" className="transition-all duration-200 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">{incident.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base">{incident.description}</p>
                        
                        {incident.treatment && (
                          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-start gap-2">
                              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Treatment</p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">{incident.treatment}</p>
                      </div>
                    </div>
                  </div>
                        )}

                        {incident.comments && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Comments</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{incident.comments}</p>
                    </div>
                  </div>
                  </div>
                )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{format(new Date(incident.appointmentDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{format(new Date(incident.appointmentDate), 'h:mm a')}</span>
                          </div>
                  </div>

                        {/* File Attachments */}
                        {incident.files && incident.files.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {incident.files.map((file) => {
                                const isDownloading = downloadingFiles.has(file.id);
                                const canDownload = validateFileForDownload(file);
                                
                                return (
                        <button
                          key={file.id}
                                    onClick={() => !isDownloading && canDownload && handleFileDownload(file)}
                                    disabled={isDownloading || !canDownload}
                                    className={`
                                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 max-w-full
                                      ${canDownload 
                                        ? 'bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 hover:shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                                      }
                                      ${isDownloading ? 'cursor-wait' : ''}
                                    `}
                                    title={!canDownload ? 'File cannot be downloaded' : isDownloading ? 'Downloading...' : `Download ${file.name}`}
                                  >
                                    <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-24 sm:max-w-32">{file.name}</span>
                                    {isDownloading ? (
                                      <Loader size="sm" />
                                    ) : (
                                      <Download className={`h-3 w-3 flex-shrink-0 ${canDownload ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left lg:text-right lg:ml-4 flex-shrink-0">
                      {incident.cost && (
                        <div className="flex lg:flex-col items-start lg:items-end space-x-2 lg:space-x-0 lg:space-y-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ${incident.cost}
                          </span>
                          {incident.status === 'Completed' && !incident.isPaid && (
                            <button
                              onClick={() => handlePayment(incident.id, incident.cost!, incident.treatment || incident.title)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                            >
                              Pay Now
                            </button>
                          )}
                          {incident.isPaid && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full whitespace-nowrap">
                              ✓ Paid
                            </span>
                          )}
                  </div>
                )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No completed treatments yet
            </p>
          </div>
        )}
      </Card>

      {/* Empty State for No Appointments */}
      {totalAppointments === 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You don't have any appointments scheduled. Contact your healthcare provider to schedule your first visit.
          </p>
          <Button variant="outline" onClick={handleManualRefresh} icon={<RefreshCw className="h-5 w-5" />}>
            Refresh Appointments
          </Button>
        </Card>
      )}
      
      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={paymentModal.isOpen}
        onConfirm={confirmPayment}
        onCancel={cancelPayment}
        amount={paymentModal.amount}
        treatment={paymentModal.treatment}
        isProcessing={isProcessingPayment}
      />
    </div>
  );
};