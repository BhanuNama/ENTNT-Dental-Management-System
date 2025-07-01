import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign, FileText, Download, User, Phone, Mail, RefreshCw } from 'lucide-react';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { downloadFile, validateFileForDownload } from '../utils/fileDownload';
import { useToast } from '../hooks/useToast';
import Loader from '../components/Loader';
import { Button } from '../components/Button';

export const PatientView: React.FC = () => {
  const { user } = useAuth();
  const { patients, incidents, processPayment, refreshData } = useData();
  const { showSuccess, showError } = useToast();
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const patient = patients.find(p => p.id === user?.patientId);
  const patientIncidents = incidents.filter(i => i.patientId === user?.patientId);

  // Get upcoming appointments - just regular scheduled appointments
  const upcomingAppointments = React.useMemo(() => {
    return patientIncidents
    .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }, [patientIncidents]);

  const pastAppointments = patientIncidents
    .filter(i => i.status === 'Completed')
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const totalCost = pastAppointments.reduce((sum, appointment) => sum + (appointment.cost || 0), 0);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient profile not found.</p>
      </div>
    );
  }

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      showSuccess('Profile Refreshed! 🔄', 'Your profile information has been updated');
    }, 1000);
  };

  return (
    <div className="space-y-6 p-1 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 sm:p-4 lg:p-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">Welcome, {patient.name}</h1>
              <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Your dental health dashboard</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              loading={isRefreshing}
              icon={<RefreshCw className="h-4 w-4" />}
              className="w-full sm:w-auto min-w-[120px] justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-2"
            >
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Info & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Patient Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Information</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{format(new Date(patient.dob), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{patient.contact}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{patient.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Visits</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{patientIncidents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">${totalCost}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">No upcoming appointments scheduled</p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{appointment.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                    {appointment.status}
                  </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">{appointment.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                  </div>
                </div>
                {appointment.comments && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Notes:</strong> {appointment.comments}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Treatment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Treatment History</h2>
        {pastAppointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">No treatment history available</p>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{appointment.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{appointment.treatment}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-left lg:text-right flex-shrink-0">
                    {appointment.cost && (
                      <div className="flex lg:flex-col items-start lg:items-end space-x-2 lg:space-x-0 lg:space-y-2">
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                          ${appointment.cost}
                        </span>
                        {appointment.status === 'Completed' && !appointment.isPaid && (
                          <button
                            onClick={() => handlePayment(appointment.id, appointment.cost!, appointment.treatment || appointment.title)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                          >
                            Pay Now
                          </button>
                        )}
                        {appointment.isPaid && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full whitespace-nowrap">
                            ✓ Paid
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">{appointment.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                  </div>
                </div>

                {/* File Attachments */}
                {appointment.files && appointment.files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.files.map((file) => {
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
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-20 sm:max-w-32">{file.name}</span>
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
            ))}
          </div>
        )}
      </div>

      {/* Health Information */}
      {patient.healthInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Health Information</h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-300">{patient.healthInfo}</p>
          </div>
        </div>
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