import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Incident, FileAttachment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, FileText, Activity, Calendar, User, TrendingUp, CheckCircle, AlertCircle, Pause, X, Download } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import Loader from '../components/Loader';
import ConfirmationModal from '../components/ConfirmationModal';
import { downloadFile, validateFileForDownload } from '../utils/fileDownload';

export const Appointments: React.FC = () => {
  const { incidents, patients, addIncident, updateIncident, deleteIncident } = useData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingIncident, setCompletingIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<string>('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    incidentId: string;
    incidentTitle: string;
  }>({
    isOpen: false,
    incidentId: '',
    incidentTitle: ''
  });
  const [isDeletingIncident, setIsDeletingIncident] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  const filteredIncidents = incidents.filter(incident => {
    const patient = patients.find(p => p.id === incident.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddIncident = () => {
    setEditingIncident(null);
    setShowModal(true);
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
    setShowModal(true);
  };

  const handleDeleteIncident = (id: string) => {
    const incident = incidents.find(inc => inc.id === id);
    setDeleteConfirmation({
      isOpen: true,
      incidentId: id,
      incidentTitle: incident?.title || 'Unknown Appointment'
    });
  };

  const confirmDeleteIncident = async () => {
    setIsDeletingIncident(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      deleteIncident(deleteConfirmation.incidentId);
      setDeleteConfirmation({ isOpen: false, incidentId: '', incidentTitle: '' });
    } finally {
      setIsDeletingIncident(false);
    }
  };

  const cancelDeleteIncident = () => {
    setDeleteConfirmation({ isOpen: false, incidentId: '', incidentTitle: '' });
  };

  const handleMarkComplete = (incident: Incident) => {
    setCompletingIncident(incident);
    setShowCompletionModal(true);
  };

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };

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
      default: return <Pause className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Calculate stats
  const totalAppointments = incidents.length;
  const todayAppointments = incidents.filter(inc => isToday(new Date(inc.appointmentDate)));
  const scheduledAppointments = incidents.filter(inc => inc.status === 'Scheduled');
  const completedAppointments = incidents.filter(inc => inc.status === 'Completed');
  const totalRevenue = incidents
    .filter(inc => inc.status === 'Completed' && inc.cost)
    .reduce((sum, inc) => sum + (inc.cost || 0), 0);

  const handleFileDownload = async (file: FileAttachment) => {
    // Set downloading state
    setDownloadingFiles(prev => new Set(prev).add(file.id));
    
    try {
      const result = await downloadFile(file);
      
      if (result.success) {
        showSuccess('Download Complete! 📁', result.message);
      } else {
        showError('Download Failed! ❌', result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      showError('Download Error! ❌', 'An unexpected error occurred during download.');
    } finally {
      // Remove downloading state
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header Section */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></div>
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Appointments & Treatments
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Manage patient appointments, treatments, and medical records
              </p>
        </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Button 
          onClick={handleAddIncident}
                size="lg" 
                icon={<Plus className="h-5 w-5" />}
                className="w-full sm:w-auto justify-center"
              >
                Schedule Appointment
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
                <div className="bg-orange-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{todayAppointments.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Today</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{completedAppointments.length}</p>
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
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">${totalRevenue}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters Section */}
      <Card padding="lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Find Appointments</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            icon={<Search className="h-5 w-5" />}
            placeholder="Search by patient, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="floating"
          />
          <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 pl-4 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 appearance-none text-sm sm:text-base"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        {filteredIncidents.length !== incidents.length && (
          <div className="mt-4 text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            Showing {filteredIncidents.length} of {incidents.length} appointments
      </div>
        )}
      </Card>

      {/* Appointments Bento Grid */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} hover className="group">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 space-y-4 min-w-0">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
                    {getStatusIcon(incident.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {incident.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{getPatientName(incident.patientId)}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{incident.description}</p>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{format(new Date(incident.appointmentDate), 'MMM dd, yyyy h:mm a')}</span>
                  </div>
                  {incident.cost && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium">${incident.cost}</span>
                    </div>
                  )}
                  {incident.files.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span>{incident.files.length} file{incident.files.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Treatment & Comments */}
                <div className="space-y-3">
                  {incident.treatment && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Treatment</p>
                          <p className="text-sm text-green-700 dark:text-green-300">{incident.treatment}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {incident.comments && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Comments</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{incident.comments}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Attachments */}
                  {incident.files && incident.files.length > 0 && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                      <div className="flex items-start gap-2 mb-3">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                            Attachments ({incident.files.length})
                          </p>
                        </div>
                      </div>
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
                                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                ${canDownload 
                                  ? 'bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 hover:shadow-md' 
                                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                                }
                                ${isDownloading ? 'cursor-wait' : ''}
                              `}
                              title={!canDownload ? 'File cannot be downloaded' : isDownloading ? 'Downloading...' : `Download ${file.name}`}
                            >
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">{file.name}</span>
                              {isDownloading ? (
                                <Loader size="sm" />
                              ) : (
                                <Download className={`h-3 w-3 ${canDownload ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {(incident.status === 'Scheduled' || incident.status === 'In Progress') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkComplete(incident)}
                    icon={<CheckCircle className="h-4 w-4" />}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Mark as Complete"
                  >
                    <span className="sr-only">Mark as Complete</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditIncident(incident)}
                  icon={<Edit2 className="h-4 w-4" />}
                  title="Edit Appointment"
                >
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteIncident(incident.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete Appointment"
                >
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredIncidents.length === 0 && incidents.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No appointments yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get started by scheduling your first appointment. You can track treatments, manage patient records, and monitor progress.
          </p>
          <Button onClick={handleAddIncident} size="lg" icon={<Plus className="h-5 w-5" />}>
            Schedule First Appointment
          </Button>
        </Card>
      )}

      {filteredIncidents.length === 0 && incidents.length > 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-400" />
        </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No appointments found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No appointments match your current filters
          </p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Appointment Modal */}
      {showModal && (
        <AppointmentModal
          incident={editingIncident}
          patients={patients}
          isLoading={isLoading}
          onSave={async (incident) => {
            setIsLoading(true);
            setLoadingOperation(editingIncident ? 'Updating appointment...' : 'Scheduling appointment...');
            
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
              
            if (editingIncident) {
              updateIncident(incident);
            } else {
              addIncident(incident);
            }
            setShowModal(false);
            } finally {
              setIsLoading(false);
              setLoadingOperation('');
            }
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && completingIncident && (
        <CompletionModal
          incident={completingIncident}
          isLoading={isLoading}
          onSave={async (completedIncident) => {
            setIsLoading(true);
            setLoadingOperation('Completing appointment...');
            
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
              updateIncident(completedIncident);
              setShowCompletionModal(false);
              setCompletingIncident(null);
            } finally {
              setIsLoading(false);
              setLoadingOperation('');
            }
          }}
          onClose={() => {
            setShowCompletionModal(false);
            setCompletingIncident(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <Loader size="lg" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{loadingOperation}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Please wait...</p>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onConfirm={confirmDeleteIncident}
        onCancel={cancelDeleteIncident}
        title="Delete Appointment"
        message={`Are you sure you want to delete "${deleteConfirmation.incidentTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isProcessing={isDeletingIncident}
        processingText="Deleting appointment..."
      />
    </div>
  );
};

// Appointment Modal Component
interface AppointmentModalProps {
  incident: Incident | null;
  patients: any[];
  isLoading?: boolean;
  onSave: (incident: Incident) => void;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ incident, patients, isLoading = false, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Incident, 'id'>>({
    patientId: incident?.patientId || '',
    title: incident?.title || '',
    description: incident?.description || '',
    comments: incident?.comments || '',
    appointmentDate: incident?.appointmentDate || '',
    cost: incident?.cost || 0,
    treatment: incident?.treatment || '',
    status: incident?.status || 'Scheduled',
    nextDate: incident?.nextDate || '',
    files: incident?.files || [],
    createdAt: incident?.createdAt || new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentData: Incident = {
      id: incident?.id || `i${Date.now()}`,
      ...formData
    };
    onSave(incidentData);
  };

  const handleFilesChange = (files: FileAttachment[]) => {
    setFormData({ ...formData, files });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {incident ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient *</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Appointment Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., Routine Cleaning, Root Canal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Describe the appointment or procedure..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Additional notes or observations..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment</label>
              <input
                type="text"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Treatment provided"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Appointment</label>
              <input
                type="datetime-local"
                value={formData.nextDate}
                onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Files & Documents</label>
            <FileUpload files={formData.files} onFilesChange={handleFilesChange} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && <Loader size="sm" />}
              <span>{incident ? 'Update' : 'Schedule'} Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Completion Modal Component
interface CompletionModalProps {
  incident: Incident;
  isLoading?: boolean;
  onSave: (incident: Incident) => void;
  onClose: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ incident, isLoading = false, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    cost: incident.cost || 0,
    treatment: incident.treatment || '',
    status: 'Completed' as const,
    nextDate: incident.nextDate || '',
    files: incident.files || [],
    comments: incident.comments || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const completedIncident: Incident = {
      ...incident,
      ...formData,
      status: 'Completed'
    };
    onSave(completedIncident);
  };

  const handleFilesChange = (files: FileAttachment[]) => {
    setFormData({ ...formData, files });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Complete Appointment
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {incident.title} - {incident.patientId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Appointment Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Appointment Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Title:</span> {incident.title}
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Date:</span> {format(new Date(incident.appointmentDate), 'MMM dd, yyyy h:mm a')}
              </div>
              <div className="col-span-2">
                <span className="text-blue-700 dark:text-blue-300">Description:</span> {incident.description}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Treatment Cost ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter treatment cost"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Next Appointment (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.nextDate}
                onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Treatment Details *
            </label>
            <textarea
              required
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Describe the treatment provided..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Additional notes, observations, or recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Upload Files (Invoices, Images, etc.)
            </label>
            <FileUpload files={formData.files} onFilesChange={handleFilesChange} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && <Loader size="sm" />}
              <span>Complete Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};