import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../context/NotificationContext';
import { StorageManager } from '../utils/storage';
import { Patient } from '../types';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, RefreshCw, Bell, AlertCircle, X, Users, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';

export const Patients: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient, refreshData } = useData();
  const { showSuccess, showInfo, showError } = useToast();
  const { notifications } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    patientId: string;
    patientName: string;
  }>({
    isOpen: false,
    patientId: '',
    patientName: ''
  });
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);

  // Comprehensive real-time update listeners
  useEffect(() => {
    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = 'detail' in event ? event.detail?.key : event.key;
      if (key === 'patients') {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
        showInfo('Patients Updated! 🔄', 'Patient database has been refreshed');
      }
    };

    // Handle custom localStorage events
    const handleLocalStorageChanged = (event: CustomEvent) => {
      handleStorageChange(event);
    };

    // Listen for custom storage events
    const handleDataStored = (event: CustomEvent) => {
      const { key } = event.detail;
      if (key === 'patients') {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
      }
    };

    // Listen for notification events
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      if (notification.type === 'system' && notification.title.includes('Patient')) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
      }
    };

    // Add all event listeners
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
    window.addEventListener('dataStored', handleDataStored as EventListener);
    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageChanged', handleLocalStorageChanged as EventListener);
      window.removeEventListener('dataStored', handleDataStored as EventListener);
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [refreshData, showInfo]);

  // Periodic data refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const storedPatients = StorageManager.getItem('patients', []);
      
      // Check if there are changes
      if (storedPatients.length !== patients.length) {
        refreshData();
        setLastUpdateTime(new Date().toISOString());
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [patients.length, refreshData]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.includes(searchTerm)
  );

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleDeletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    setDeleteConfirmation({
      isOpen: true,
      patientId: id,
      patientName: patient?.name || 'Unknown Patient'
    });
  };

  const confirmDeletePatient = async () => {
    setIsDeletingPatient(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const patient = patients.find(p => p.id === deleteConfirmation.patientId);
      deletePatient(deleteConfirmation.patientId);
      showSuccess('Patient Deleted! 🗑️', `${patient?.name} has been removed from the system`);
      setDeleteConfirmation({ isOpen: false, patientId: '', patientName: '' });
    } finally {
      setIsDeletingPatient(false);
    }
  };

  const cancelDeletePatient = () => {
    setDeleteConfirmation({ isOpen: false, patientId: '', patientName: '' });
  };

  const handleSavePatient = (patient: Patient) => {
    if (editingPatient) {
      updatePatient(patient);
      showSuccess('Patient Updated! ✏️', `${patient.name}'s information has been updated`);
    } else {
      addPatient(patient);
      showSuccess('Patient Added! 👥', `${patient.name} has been added to the system`);
    }
    setShowModal(false);
    setLastUpdateTime(new Date().toISOString());
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setLastUpdateTime(new Date().toISOString());
    setTimeout(() => {
      setIsRefreshing(false);
      showInfo('Data Refreshed! 🔄', 'Patient database has been updated');
    }, 1000);
  };

  const unreadSystemNotifications = notifications.filter(n => 
    !n.isRead && n.type === 'system' && n.title.includes('Patient')
  );

  // Calculate stats
  const totalPatients = patients.length;
  const patientsWithInsurance = patients.filter(p => p.insurance).length;
  const recentPatients = patients.filter(p => {
    const createdDate = new Date(p.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length;

  return (
    <div className="space-y-6 p-1">
      {/* Clean Header Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Patient Database
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and view patient information
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {unreadSystemNotifications.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    {unreadSystemNotifications.length} update{unreadSystemNotifications.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={handleManualRefresh} 
              loading={isRefreshing}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Button onClick={handleAddPatient} icon={<Plus className="h-4 w-4" />} className="btn-enhanced">
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats-card group">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPatients}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="stats-card group">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{patientsWithInsurance}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">With Insurance</p>
            </div>
          </div>
        </div>
        <div className="stats-card group">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{recentPatients}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Search Section */}
      <Card padding="lg" className="border-emerald-100 dark:border-emerald-900/30">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patient Search</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find patients quickly and efficiently</p>
              </div>
            </div>
            {filteredPatients.length !== patients.length && (
              <div className="trust-badge">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>{filteredPatients.length} of {patients.length} found</span>
                </div>
              </div>
            )}
          </div>
          <Input
            icon={<Search className="h-5 w-5" />}
            placeholder="Search by name, email, phone, or medical record..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="floating"
            className="input"
          />
        </div>
      </Card>

      {/* Patients Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} hover className="group">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Age: {new Date().getFullYear() - new Date(patient.dob).getFullYear()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => handleEditPatient(patient)}
                     icon={<Edit2 className="h-4 w-4" />}
                   >
                     {""}
                   </Button>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => handleDeletePatient(patient.id)}
                     icon={<Trash2 className="h-4 w-4" />}
                     className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                   >
                     {""}
                   </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>{patient.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-teal-500" />
                  <span className="truncate">{patient.email}</span>
                </div>
                {patient.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-cyan-500" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {format(new Date(patient.createdAt), 'MMM yyyy')}</span>
                </div>
                {patient.insurance && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Shield className="h-3 w-3" />
                    <span>Insured</span>
                  </div>
                )}
              </div>

              {/* Health Info */}
              {patient.healthInfo && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      {patient.healthInfo.length > 80 ? `${patient.healthInfo.substring(0, 80)}...` : patient.healthInfo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty States */}
      {filteredPatients.length === 0 && patients.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No patients yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get started by adding your first patient to the system. You can track their information, appointments, and medical history.
          </p>
          <Button onClick={handleAddPatient} size="lg" icon={<Plus className="h-5 w-5" />} className="btn-enhanced">
            Add First Patient
          </Button>
        </Card>
      )}

      {filteredPatients.length === 0 && patients.length > 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No patients found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No patients match your search for "<span className="font-medium text-emerald-600 dark:text-emerald-400">{searchTerm}</span>"
          </p>
          <Button variant="outline" onClick={() => setSearchTerm('')} className="btn-enhanced">
            Clear Search
          </Button>
        </Card>
      )}

      {/* Patient Modal */}
      {showModal && (
        <PatientModal
          patient={editingPatient}
          onSave={handleSavePatient}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onConfirm={confirmDeletePatient}
        onCancel={cancelDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete "${deleteConfirmation.patientName}"? This will also delete all their appointments and cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isProcessing={isDeletingPatient}
        processingText="Deleting patient..."
      />
    </div>
  );
};

// Patient Modal Component
interface PatientModalProps {
  patient: Patient | null;
  onSave: (patient: Patient) => void;
  onClose: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    name: patient?.name || '',
    dob: patient?.dob || '',
    contact: patient?.contact || '',
    email: patient?.email || '',
    address: patient?.address || '',
    emergencyContact: patient?.emergencyContact || '',
    healthInfo: patient?.healthInfo || '',
    insurance: patient?.insurance || '',
    createdAt: patient?.createdAt || new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData: Patient = {
      id: patient?.id || `p${Date.now()}`,
      ...formData
    };
    onSave(patientData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter home address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Emergency contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance Provider</label>
            <input
              type="text"
              value={formData.insurance}
              onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Insurance company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Information</label>
            <textarea
              value={formData.healthInfo}
              onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Allergies, medical conditions, previous treatments..."
            />
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
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {patient ? 'Update' : 'Add'} Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};