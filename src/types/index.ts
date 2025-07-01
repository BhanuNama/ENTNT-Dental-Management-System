export interface User {
  id: string;
  email: string;
  password: string;
  role: 'Admin' | 'Patient';
  patientId?: string;
  name?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  email: string;
  address: string;
  emergencyContact: string;
  healthInfo: string;
  insurance?: string;
  createdAt: string;
  totalSpent?: number;
}

export interface Incident {
  id: string;
  patientId: string;
  title: string;
  description: string;
  comments: string;
  appointmentDate: string;
  cost?: number;
  treatment?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  nextDate?: string;
  files: FileAttachment[];
  createdAt: string;
  isPaid?: boolean;
  paidAt?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'update' | 'reminder' | 'system' | 'cancellation';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  patientId?: string;
  appointmentId?: string;
  actionUrl?: string;
  targetRole?: 'Admin' | 'Patient';
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}