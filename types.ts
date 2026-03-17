export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  PATIENT = 'PATIENT'
}

export enum AnamnesisStatus {
  NONE = 'NONE',
  REQUESTED = 'REQUESTED',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  anamnesisStatus: AnamnesisStatus;
  color?: string; // Hex color for calendar identification
  phoneNumber?: string;
  whatsappEnabled?: boolean; // Only for professionals/admin to enable auto-sending
}

export interface AnamnesisForm {
  id: string;
  patientId: string;
  bloodType: string;
  allergies: string;
  medications: string;
  surgeries: string;
  skinType: string; // e.g., Dry, Oily, Mixed
  sunExposure: string; // e.g., Low, Moderate, High
  smoker: boolean;
  notes: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number; // Operational cost
  durationMin: number;
  description: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO String
  status: AppointmentStatus;
  price: number;
  professionalColor?: string; // Helper for frontend rendering
  reminderSent?: boolean; // Track if 48h reminder was sent
  source?: 'LUMINA' | 'GOOGLE'; // Track origin of appointment
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
  professionalId?: string; // If null, belongs to clinic general
}