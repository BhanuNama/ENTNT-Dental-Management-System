import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Incident } from '../types';
import { mockData } from '../data/mockData';
import { StorageManager } from '../utils/storage';
import { useToast } from '../hooks/useToast';
import { useAuth } from './AuthContext';

interface DataContextType {
  patients: Patient[];
  incidents: Incident[];
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (incident: Incident) => void;
  deleteIncident: (id: string) => void;
  processPayment: (incidentId: string, amount: number) => void;
  getPatientIncidents: (patientId: string) => Incident[];
  refreshData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Enhanced cross-session event dispatcher
const dispatchCrossSessionEvent = (eventType: string, data: any) => {
  // Create a timestamp for cross-session communication
  const timestamp = Date.now();
  const eventData = { ...data, timestamp };

  // ALWAYS dispatch local event immediately for this session
  window.dispatchEvent(new CustomEvent(eventType, { detail: eventData }));
  
  // Force storage event for cross-tab communication
  localStorage.setItem('lastCrossSessionEvent', JSON.stringify({
    type: eventType,
    data: eventData,
    timestamp
  }));
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const initializeData = async () => {
    setIsLoading(true);
    
    try {
      // Initialize with mock data if no existing data
      const storedUsers = StorageManager.getItem('users', []);
      const storedPatients = StorageManager.getItem('patients', []);
      const storedIncidents = StorageManager.getItem('incidents', []);

      if (storedUsers.length === 0) {
        StorageManager.setItem('users', mockData.users);
      }
      if (storedPatients.length === 0) {
        StorageManager.setItem('patients', mockData.patients);
        setPatients(mockData.patients);
      } else {
        setPatients(storedPatients);
      }
      if (storedIncidents.length === 0) {
        StorageManager.setItem('incidents', mockData.incidents);
        setIncidents(mockData.incidents);
      } else {
        setIncidents(storedIncidents);
      }

      showSuccess('Data loaded successfully');
    } catch (error) {
      showError('Failed to load data', 'Using fallback data');
      setPatients(mockData.patients);
      setIncidents(mockData.incidents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeData();

    // Enhanced cross-session event listeners
    const handleStorageEvent = (event: CustomEvent) => {
      const { key, success, error } = event.detail;
      if (success) {
        showSuccess('Data saved', `${key} updated successfully`);
      } else {
        showError('Save failed', `Failed to update ${key}`);
      }
    };

    // Listen for cross-tab storage changes
    const handleCrossTabStorage = (event: StorageEvent) => {
      if (event.key === 'lastCrossSessionEvent' && event.newValue) {
        try {
          const eventData = JSON.parse(event.newValue);
          
          // Re-dispatch the event in this session (no session filtering)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent(eventData.type, { 
              detail: eventData.data 
            }));
            
            // Refresh data if it's a data-changing event
            if (['appointmentAdded', 'appointmentUpdated', 'appointmentDeleted', 
                 'patientAdded', 'patientUpdated', 'patientDeleted'].includes(eventData.type)) {
              refreshData();
            }
          }, 100);
        } catch (error) {
          console.error('Error handling cross-session event:', error);
        }
      } else if (['patients', 'incidents', 'notifications'].includes(event.key || '')) {
        // Handle direct storage changes
        setTimeout(() => {
          refreshData();
        }, 100);
      }
    };

    // Set up event listeners
    window.addEventListener('dataStored', handleStorageEvent as EventListener);
    window.addEventListener('storage', handleCrossTabStorage);
    
    return () => {
      window.removeEventListener('dataStored', handleStorageEvent as EventListener);
      window.removeEventListener('storage', handleCrossTabStorage);
    };
  }, [showSuccess, showError]);

  const refreshData = () => {
    const storedPatients = StorageManager.getItem('patients', []);
    const storedIncidents = StorageManager.getItem('incidents', []);
    setPatients(storedPatients);
    setIncidents(storedIncidents);
  };

  const addPatient = (patient: Patient) => {
    const updated = [...patients, patient];
    setPatients(updated);
    StorageManager.setItem('patients', updated);
    
    // Enhanced cross-session notification
    const notificationData = {
      title: 'New Patient Added',
      message: `Patient ${patient.name} has been successfully added to the system.`,
      type: 'system',
      priority: 'low'
    };
    
    // Dispatch cross-session events
    dispatchCrossSessionEvent('createNotification', notificationData);
    dispatchCrossSessionEvent('patientAdded', { patient });
    
    showSuccess('Patient added', `${patient.name} has been added successfully`);
  };

  const updatePatient = (patient: Patient) => {
    const updated = patients.map(p => p.id === patient.id ? patient : p);
    setPatients(updated);
    StorageManager.setItem('patients', updated);
    
    // Enhanced cross-session notification for patient
    const notificationData = {
      title: 'Profile Updated',
      message: 'Your patient profile information has been updated by your healthcare provider.',
      type: 'update',
      priority: 'medium',
      patientId: patient.id
    };
    
    // Dispatch cross-session events
    dispatchCrossSessionEvent('createNotification', notificationData);
    dispatchCrossSessionEvent('patientUpdated', { patient, patientId: patient.id });
    
    showSuccess('Patient updated', `${patient.name}'s profile has been updated`);
  };

  const deletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    StorageManager.setItem('patients', updated);
    
    // Also delete related incidents
    const updatedIncidents = incidents.filter(i => i.patientId !== id);
    setIncidents(updatedIncidents);
    StorageManager.setItem('incidents', updatedIncidents);
    
    // Enhanced cross-session notification
    if (patient) {
      const notificationData = {
        title: 'Patient Removed',
        message: `Patient ${patient.name} and all related records have been removed from the system.`,
        type: 'system',
        priority: 'medium'
      };
      
      // Dispatch cross-session events
      dispatchCrossSessionEvent('createNotification', notificationData);
      dispatchCrossSessionEvent('patientDeleted', { patient, patientId: id });
      
      showSuccess('Patient deleted', `${patient.name} has been removed from the system`);
    }
  };

  const addIncident = (incident: Incident) => {
    const updated = [...incidents, incident];
    setIncidents(updated);
    StorageManager.setItem('incidents', updated);
    
    // Enhanced cross-session notification for patient
    const patient = patients.find(p => p.id === incident.patientId);
    if (patient) {
      const appointmentDate = new Date(incident.appointmentDate);
      const notificationData = {
        title: 'New Appointment Scheduled',
        message: `Your appointment "${incident.title}" has been scheduled for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        type: 'appointment' as const,
        priority: 'high' as const,
        patientId: incident.patientId,
        appointmentId: incident.id,
        targetRole: 'Patient' as const
      };
      
      // Dispatch cross-session events
      dispatchCrossSessionEvent('createNotification', notificationData);
      dispatchCrossSessionEvent('appointmentAdded', { 
        incident, 
        appointment: incident, 
        patientId: incident.patientId 
      });
      
      showSuccess('Appointment scheduled', `New appointment for ${patient.name} has been added`);
    }
  };

  const updateIncident = (incident: Incident) => {
    const updated = incidents.map(i => i.id === incident.id ? incident : i);
    setIncidents(updated);
    StorageManager.setItem('incidents', updated);
    
    // If this is a completion with a nextDate, create a new appointment
    if (incident.status === 'Completed' && incident.nextDate) {
      const nextAppointment: Incident = {
        id: `i${Date.now()}-follow`,
        patientId: incident.patientId,
        title: `Follow-up: ${incident.title}`,
        description: `Follow-up appointment for ${incident.title.toLowerCase()}`,
        comments: `Scheduled follow-up after ${incident.title}`,
        appointmentDate: incident.nextDate,
        status: 'Scheduled',
        files: [],
        createdAt: new Date().toISOString()
      };
      
      // Add the new appointment
      const updatedWithNext = [...updated, nextAppointment];
      setIncidents(updatedWithNext);
      StorageManager.setItem('incidents', updatedWithNext);
      
      // Notification for the new follow-up appointment
      const patient = patients.find(p => p.id === incident.patientId);
      if (patient) {
        const appointmentDate = new Date(incident.nextDate);
        const notificationData = {
          title: 'Follow-up Appointment Scheduled',
          message: `Your follow-up appointment "${nextAppointment.title}" has been scheduled for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          type: 'appointment' as const,
          priority: 'high' as const,
          patientId: incident.patientId,
          appointmentId: nextAppointment.id,
          targetRole: 'Patient' as const
        };
        
        dispatchCrossSessionEvent('createNotification', notificationData);
        dispatchCrossSessionEvent('appointmentAdded', { 
          incident: nextAppointment, 
          appointment: nextAppointment, 
          patientId: incident.patientId 
        });
      }
    }
    
    // Enhanced cross-session notification for patient
    const patient = patients.find(p => p.id === incident.patientId);
    if (patient) {
      const appointmentDate = new Date(incident.appointmentDate);
      const notificationData = {
        title: 'Appointment Updated',
        message: `Your appointment "${incident.title}" has been updated. New date/time: ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        type: 'update' as const,
        priority: 'high' as const,
        patientId: incident.patientId,
        appointmentId: incident.id,
        targetRole: 'Patient' as const
      };
      
      // Dispatch cross-session events
      dispatchCrossSessionEvent('createNotification', notificationData);
      dispatchCrossSessionEvent('appointmentUpdated', { 
        incident, 
        appointment: incident, 
        patientId: incident.patientId 
      });
      
      showSuccess('Appointment updated', `Appointment for ${patient.name} has been updated`);
    }
  };

  const deleteIncident = (id: string) => {
    const incident = incidents.find(i => i.id === id);
    const updated = incidents.filter(i => i.id !== id);
    setIncidents(updated);
    StorageManager.setItem('incidents', updated);
    
    // Enhanced cross-session notification for patient
    if (incident) {
      const patient = patients.find(p => p.id === incident.patientId);
      if (patient) {
        const appointmentDate = new Date(incident.appointmentDate);
        const notificationData = {
          title: 'Appointment Cancelled',
          message: `Your appointment "${incident.title}" scheduled for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} has been cancelled.`,
          type: 'cancellation',
          priority: 'high',
          patientId: incident.patientId,
          appointmentId: incident.id,
          targetRole: 'Patient' as const
        };
        
        // Dispatch cross-session events
        dispatchCrossSessionEvent('createNotification', notificationData);
        dispatchCrossSessionEvent('appointmentDeleted', { 
          incident, 
          appointmentTitle: incident.title, 
          patientId: incident.patientId 
        });
        
        showSuccess('Appointment cancelled', `Appointment for ${patient.name} has been cancelled`);
      }
    }
  };

  const processPayment = (incidentId: string, amount: number) => {
    // Find the incident
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) {
      showError('Payment failed', 'Appointment not found');
      return;
    }

    // Find the patient
    const patient = patients.find(p => p.id === incident.patientId);
    if (!patient) {
      showError('Payment failed', 'Patient not found');
      return;
    }

    // Update incident with payment information
    const updatedIncident = {
      ...incident,
      isPaid: true,
      paidAt: new Date().toISOString()
    };

    // Update patient's total spent
    const updatedPatient = {
      ...patient,
      totalSpent: (patient.totalSpent || 0) + amount
    };

    // Update both arrays
    const updatedIncidents = incidents.map(i => i.id === incidentId ? updatedIncident : i);
    const updatedPatients = patients.map(p => p.id === patient.id ? updatedPatient : p);

    // Save to state and storage
    setIncidents(updatedIncidents);
    setPatients(updatedPatients);
    StorageManager.setItem('incidents', updatedIncidents);
    StorageManager.setItem('patients', updatedPatients);

    // Create payment notification for patient
    const notificationData = {
      title: 'Payment Confirmed',
      message: `Your payment of $${amount} for "${incident.title}" has been successfully processed. Thank you for your payment!`,
      type: 'update' as const,
      priority: 'medium' as const,
      patientId: patient.id,
      appointmentId: incidentId,
      targetRole: 'Patient' as const
    };

    // Create revenue notification for admin
    const adminNotificationData = {
      title: 'Payment Received',
      message: `Payment of $${amount} received from ${patient.name} for "${incident.title}". Amount has been added to your revenue.`,
      type: 'system' as const,
      priority: 'low' as const,
      targetRole: 'Admin' as const
      // No patientId for admin notifications
    };

    // Dispatch cross-session events
    dispatchCrossSessionEvent('createNotification', notificationData);
    dispatchCrossSessionEvent('createNotification', adminNotificationData);
    dispatchCrossSessionEvent('paymentProcessed', { 
      incidentId, 
      amount, 
      patientId: patient.id,
      patientName: patient.name 
    });

    showSuccess('Payment successful', `Payment of $${amount} has been processed`);
  };

  const getPatientIncidents = (patientId: string) => {
    return incidents.filter(incident => incident.patientId === patientId);
  };

  const value = {
    patients,
    incidents,
    addPatient,
    updatePatient,
    deletePatient,
    addIncident,
    updateIncident,
    deleteIncident,
    processPayment,
    getPatientIncidents,
    refreshData,
    isLoading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};