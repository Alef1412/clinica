import { Injectable, signal } from '@angular/core';
import { User, UserRole, Appointment, AppointmentStatus, Product, Transaction, AnamnesisStatus, AnamnesisForm } from '../models/types';

// Extended User interface internally for the DB
interface DBUser extends User {
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDbService {
  // Global Shared State using Signals
  private users = signal<DBUser[]>([
    { id: '1', name: 'Ana Silva (Admin)', email: 'admin@lumina.com', password: '123', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/64/200/200', anamnesisStatus: AnamnesisStatus.NONE, color: '#ec4899', phoneNumber: '11999990001', whatsappEnabled: true },
    { id: '2', name: 'Dr. Lucas (Prof)', email: 'doc@lumina.com', password: '123', role: UserRole.PROFESSIONAL, avatar: 'https://picsum.photos/id/65/200/200', anamnesisStatus: AnamnesisStatus.NONE, color: '#3b82f6', phoneNumber: '11999990002', whatsappEnabled: true }, 
    { id: '3', name: 'Julia Roberts (Paciente)', email: 'julia@gmail.com', password: '123', role: UserRole.PATIENT, avatar: 'https://picsum.photos/id/66/200/200', anamnesisStatus: AnamnesisStatus.REQUESTED, color: '#10b981', phoneNumber: '11988887777' }, 
    { id: '4', name: 'Carla Dias (Paciente)', email: 'carla@gmail.com', password: '123', role: UserRole.PATIENT, avatar: 'https://picsum.photos/id/67/200/200', anamnesisStatus: AnamnesisStatus.COMPLETED, color: '#f59e0b', phoneNumber: '11977776666' }, 
  ]);

  private anamnesis = signal<AnamnesisForm[]>([
    {
      id: 'an1',
      patientId: '4',
      bloodType: 'A+',
      allergies: 'Dipirona',
      medications: 'Anticoncepcional',
      surgeries: 'Nenhuma',
      skinType: 'Mista',
      sunExposure: 'Moderada',
      smoker: false,
      notes: 'Pele sensível a ácidos.',
      updatedAt: new Date().toISOString()
    }
  ]);

  private products = signal<Product[]>([
    { id: '101', name: 'Limpeza de Pele Profunda', price: 150, cost: 30, durationMin: 60, description: 'Remoção de impurezas e hidratação.' },
    { id: '102', name: 'Botox (3 regiões)', price: 900, cost: 350, durationMin: 45, description: 'Aplicação de toxina botulínica.' },
    { id: '103', name: 'Massagem Relaxante', price: 120, cost: 10, durationMin: 60, description: 'Técnicas manuais para relaxamento.' },
  ]);

  private appointments = signal<Appointment[]>([
    { 
      id: 'a1', 
      patientId: '3', 
      patientName: 'Julia Roberts', 
      professionalId: '2', 
      professionalName: 'Dr. Lucas', 
      serviceId: '102', 
      serviceName: 'Botox (3 regiões)', 
      date: this.getTodayAt(14),
      status: AppointmentStatus.CONFIRMED,
      price: 900,
      professionalColor: '#3b82f6',
      reminderSent: true,
      source: 'LUMINA'
    },
    { 
        id: 'a2', 
        patientId: '4', 
        patientName: 'Carla Dias', 
        professionalId: '2', 
        professionalName: 'Dr. Lucas', 
        serviceId: '101', 
        serviceName: 'Limpeza de Pele', 
        date: this.getTomorrowAt(10),
        status: AppointmentStatus.PENDING,
        price: 150,
        professionalColor: '#3b82f6',
        reminderSent: false,
        source: 'LUMINA'
      },
  ]);

  private transactions = signal<Transaction[]>([
    { id: 't3', amount: 5000, type: 'EXPENSE', date: new Date().toISOString(), description: 'Aluguel do Espaço', professionalId: undefined },
  ]);

  // Auth Logic
  async login(email: string, password: string): Promise<User | undefined> {
    await this.delay(800);
    const user = this.users().find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return undefined;
  }

  async register(name: string, email: string, phone: string, password: string, role: UserRole = UserRole.PATIENT): Promise<User> {
    const newUser: DBUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phoneNumber: phone,
      password,
      role: role,
      anamnesisStatus: AnamnesisStatus.NONE,
      color: role === UserRole.PATIENT ? '#10b981' : '#ec4899',
      whatsappEnabled: role !== UserRole.PATIENT,
      avatar: undefined
    };
    this.users.update(prev => [...prev, newUser]);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  // Data Logic
  getProducts() { return this.products(); }
  
  getAppointments(user: User) {
    const appts = this.appointments();
    if (user.role === UserRole.ADMIN) return appts;
    if (user.role === UserRole.PROFESSIONAL) return appts.filter(a => a.professionalId === user.id);
    return appts.filter(a => a.patientId === user.id);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    this.appointments.update(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  getPatients() {
    return this.users().filter(u => u.role === UserRole.PATIENT);
  }

  getProfessionals() {
    return this.users().filter(u => u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN);
  }

  async createPatient(name: string, email: string) {
    const newUser: DBUser = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, password: '123',
      role: UserRole.PATIENT,
      anamnesisStatus: AnamnesisStatus.NONE,
      color: '#10b981'
    };
    this.users.update(p => [...p, newUser]);
    return newUser;
  }

  async createProfessional(name: string, email: string, role: UserRole) {
    const newUser: DBUser = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, password: '123',
      role,
      anamnesisStatus: AnamnesisStatus.NONE,
      color: role === UserRole.ADMIN ? '#ec4899' : '#3b82f6',
      whatsappEnabled: true
    };
    this.users.update(p => [...p, newUser]);
    return newUser;
  }

  // Helpers
  private delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
  private getTodayAt(hour: number) {
    const d = new Date(); d.setHours(hour, 0, 0, 0); return d.toISOString();
  }
  private getTomorrowAt(hour: number) {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(hour, 0, 0, 0); return d.toISOString();
  }
}
