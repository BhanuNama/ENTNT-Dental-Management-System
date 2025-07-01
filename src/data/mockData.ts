import { User, Patient, Incident } from '../types';

export const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@entnt.in',
      password: 'admin123',
      role: 'Admin' as const,
      name: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      email: 'john@entnt.in',
      password: 'patient123',
      role: 'Patient' as const,
      patientId: 'p1',
      name: 'John Doe'
    },
    {
      id: '3',
      email: 'emma@entnt.in',
      password: 'patient123',
      role: 'Patient' as const,
      patientId: 'p2',
      name: 'Emma Wilson'
    }
  ] as User[],

  patients: [
    {
      id: 'p1',
      name: 'John Doe',
      dob: '1990-05-10',
      contact: '1234567890',
      email: 'john@entnt.in',
      address: '123 Main St, Anytown USA',
      emergencyContact: '0987654321',
      healthInfo: 'No known allergies, previous root canal in 2019',
      insurance: 'Delta Dental Premium',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'p2',
      name: 'Emma Wilson',
      dob: '1985-08-22',
      contact: '5555551234',
      email: 'emma@entnt.in',
      address: '456 Oak Ave, Springfield USA',
      emergencyContact: '5555554321',
      healthInfo: 'Allergic to penicillin, wears braces',
      insurance: 'Cigna Dental Care',
      createdAt: '2024-02-01T14:30:00Z'
    },
    {
      id: 'p3',
      name: 'Michael Brown',
      dob: '1975-12-03',
      contact: '7777778888',
      email: 'michael@example.com',
      address: '789 Pine Rd, Riverside USA',
      emergencyContact: '7777779999',
      healthInfo: 'Diabetes, regular checkups needed',
      insurance: 'MetLife Dental',
      createdAt: '2024-01-20T09:15:00Z'
    }
  ] as Patient[],

  incidents: [
    {
      id: 'i1',
      patientId: 'p1',
      title: 'Routine Cleaning',
      description: 'Regular dental cleaning and checkup',
      comments: 'Good oral hygiene, minor plaque buildup',
      appointmentDate: '2025-01-15T10:00:00',
      cost: 120,
      treatment: 'Professional cleaning, fluoride treatment',
      status: 'Completed' as const,
      nextDate: '2025-07-15T10:00:00',
      files: [
        {
          id: 'f1',
          name: 'cleaning_invoice.pdf',
          type: 'application/pdf',
          url: 'data:application/pdf;base64,sample',
          size: 1024,
          uploadedAt: '2025-01-15T10:30:00Z'
        }
      ],
      createdAt: '2024-12-20T10:00:00Z'
    },
    {
      id: 'i2',
      patientId: 'p1',
      title: 'Toothache Consultation',
      description: 'Upper molar pain and sensitivity',
      comments: 'Sensitive to cold drinks, intermittent pain',
      appointmentDate: '2025-01-22T14:00:00',
      status: 'Scheduled' as const,
      files: [],
      createdAt: '2025-01-18T16:00:00Z'
    },
    {
      id: 'i3',
      patientId: 'p2',
      title: 'Braces Adjustment',
      description: 'Monthly orthodontic adjustment',
      comments: 'Progress is good, tightening needed',
      appointmentDate: '2025-01-25T09:00:00',
      cost: 80,
      treatment: 'Wire adjustment, new elastics',
      status: 'Completed' as const,
      nextDate: '2025-02-25T09:00:00',
      files: [
        {
          id: 'f2',
          name: 'braces_progress.jpg',
          type: 'image/jpeg',
          url: 'https://images.pexels.com/photos/6812418/pexels-photo-6812418.jpeg?auto=compress&cs=tinysrgb&w=400',
          size: 2048,
          uploadedAt: '2025-01-25T09:30:00Z'
        }
      ],
      createdAt: '2025-01-20T11:00:00Z'
    },
    {
      id: 'i4',
      patientId: 'p3',
      title: 'Dental Implant Consultation',
      description: 'Consultation for replacing missing tooth',
      comments: 'Good candidate for implant, bone density adequate',
      appointmentDate: '2025-01-28T15:30:00',
      status: 'Scheduled' as const,
      files: [],
      createdAt: '2025-01-22T13:00:00Z'
    }
  ] as Incident[]
};