import { User, UserRole, Appointment, AppointmentStatus, Product, Transaction, AnamnesisStatus, AnamnesisForm } from '../types';

// Extended User interface internally for the DB
interface DBUser extends User {
  password?: string;
}

// Initial Mock Data
const MOCK_USERS: DBUser[] = [
  { id: '1', name: 'Ana Silva (Admin)', email: 'admin@lumina.com', password: '123', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/64/200/200', anamnesisStatus: AnamnesisStatus.NONE, color: '#ec4899', phoneNumber: '11999990001', whatsappEnabled: true },
  { id: '2', name: 'Dr. Lucas (Prof)', email: 'doc@lumina.com', password: '123', role: UserRole.PROFESSIONAL, avatar: 'https://picsum.photos/id/65/200/200', anamnesisStatus: AnamnesisStatus.NONE, color: '#3b82f6', phoneNumber: '11999990002', whatsappEnabled: true }, 
  { id: '3', name: 'Julia Roberts (Paciente)', email: 'julia@gmail.com', password: '123', role: UserRole.PATIENT, avatar: 'https://picsum.photos/id/66/200/200', anamnesisStatus: AnamnesisStatus.REQUESTED, color: '#10b981', phoneNumber: '11988887777' }, 
  { id: '4', name: 'Carla Dias (Paciente)', email: 'carla@gmail.com', password: '123', role: UserRole.PATIENT, avatar: 'https://picsum.photos/id/67/200/200', anamnesisStatus: AnamnesisStatus.COMPLETED, color: '#f59e0b', phoneNumber: '11977776666' }, 
];

const MOCK_ANAMNESIS: AnamnesisForm[] = [
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
];

const MOCK_PRODUCTS: Product[] = [
  { id: '101', name: 'Limpeza de Pele Profunda', price: 150, cost: 30, durationMin: 60, description: 'Remoção de impurezas e hidratação.' },
  { id: '102', name: 'Botox (3 regiões)', price: 900, cost: 350, durationMin: 45, description: 'Aplicação de toxina botulínica.' },
  { id: '103', name: 'Massagem Relaxante', price: 120, cost: 10, durationMin: 60, description: 'Técnicas manuais para relaxamento.' },
];

// Helper to set time for today/tomorrow for demo purposes
const getTodayAt = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const getTomorrowAt = (hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
// Helper for "2 Days From Now" to test the reminder logic
const getTwoDaysFromNowAt = (hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'a1', 
    patientId: '3', 
    patientName: 'Julia Roberts', 
    professionalId: '2', 
    professionalName: 'Dr. Lucas', 
    serviceId: '102', 
    serviceName: 'Botox (3 regiões)', 
    date: getTodayAt(14), // Today 14:00
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
    date: getTomorrowAt(10), // Tomorrow 10:00
    status: AppointmentStatus.PENDING,
    price: 150,
    professionalColor: '#3b82f6',
    reminderSent: false,
    source: 'LUMINA'
  },
  // This appointment is exactly 2 days out to trigger the simulation
  { 
    id: 'a4', 
    patientId: '3', 
    patientName: 'Julia Roberts', 
    professionalId: '2', 
    professionalName: 'Dr. Lucas', 
    serviceId: '103', 
    serviceName: 'Massagem Relaxante', 
    date: getTwoDaysFromNowAt(15), 
    status: AppointmentStatus.CONFIRMED,
    price: 120,
    professionalColor: '#3b82f6',
    reminderSent: false,
    source: 'LUMINA'
  }
];

const MOCK_MANUAL_TRANSACTIONS: Transaction[] = [
  { id: 't3', amount: 5000, type: 'EXPENSE', date: new Date().toISOString(), description: 'Aluguel do Espaço', professionalId: undefined },
];

export const authService = {
  login: async (email: string, password: string): Promise<User | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (user) {
          const { password, ...safeUser } = user;
          resolve(safeUser);
        } else {
          resolve(undefined);
        }
      }, 800);
    });
  },

  register: async (name: string, email: string, phone: string, password: string): Promise<User> => {
    const newUser: DBUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phoneNumber: phone,
      password,
      role: UserRole.PATIENT,
      anamnesisStatus: AnamnesisStatus.NONE,
      color: '#10b981',
      avatar: undefined
    };
    MOCK_USERS.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return Promise.resolve(safeUser);
  },

  // Simulate verifying a code sent to WhatsApp/SMS
  verifyCode: async (code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(code === '1234'); // Simple mock validation
      }, 1000);
    });
  }
};

export const dataService = {
  getProducts: async (): Promise<Product[]> => Promise.resolve(MOCK_PRODUCTS),

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    MOCK_PRODUCTS.push(newProduct);
    return Promise.resolve(newProduct);
  },
  
  getAppointments: async (user: User): Promise<Appointment[]> => {
    let appointments = [];
    if (user.role === UserRole.ADMIN) appointments = MOCK_APPOINTMENTS;
    else if (user.role === UserRole.PROFESSIONAL) appointments = MOCK_APPOINTMENTS.filter(a => a.professionalId === user.id);
    else appointments = MOCK_APPOINTMENTS.filter(a => a.patientId === user.id);

    return Promise.resolve(appointments.map(a => {
      const prof = MOCK_USERS.find(u => u.id === a.professionalId);
      return { ...a, professionalColor: prof?.color || '#3b82f6' };
    }));
  },

  createAppointment: async (appt: Omit<Appointment, 'id' | 'status' | 'professionalColor' | 'reminderSent'>): Promise<Appointment> => {
    const prof = MOCK_USERS.find(u => u.id === appt.professionalId);
    const newAppt: Appointment = { 
      ...appt, 
      id: Math.random().toString(36).substr(2, 9), 
      status: AppointmentStatus.PENDING,
      professionalColor: prof?.color || '#3b82f6',
      reminderSent: false,
      source: 'LUMINA'
    };
    MOCK_APPOINTMENTS.push(newAppt);
    return Promise.resolve(newAppt);
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<void> => {
    const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id);
    if (idx !== -1) MOCK_APPOINTMENTS[idx].status = status;
    return Promise.resolve();
  },

  getTransactions: async (user: User): Promise<Transaction[]> => {
    const appointmentTransactions: Transaction[] = [];

    MOCK_APPOINTMENTS.forEach(appt => {
        // Only count LUMINA transactions for finances
        if ((appt.status === AppointmentStatus.CONFIRMED || appt.status === AppointmentStatus.COMPLETED) && appt.source !== 'GOOGLE') {
            appointmentTransactions.push({
                id: `inc-${appt.id}`,
                amount: appt.price,
                type: 'INCOME',
                date: appt.date,
                description: `Serviço: ${appt.serviceName}`,
                professionalId: appt.professionalId
            });

            const product = MOCK_PRODUCTS.find(p => p.id === appt.serviceId);
            if (product && product.cost > 0) {
                appointmentTransactions.push({
                    id: `exp-${appt.id}`,
                    amount: product.cost,
                    type: 'EXPENSE',
                    date: appt.date,
                    description: `Custo Operacional: ${appt.serviceName}`,
                    professionalId: appt.professionalId
                });
            }
        }
    });

    const allTransactions = [...MOCK_MANUAL_TRANSACTIONS, ...appointmentTransactions];

    if (user.role === UserRole.ADMIN) return Promise.resolve(allTransactions);
    if (user.role === UserRole.PROFESSIONAL) return Promise.resolve(allTransactions.filter(t => t.professionalId === user.id));
    return Promise.resolve([]);
  },

  // --- Google Calendar Simulation ---
  getGoogleEvents: async (): Promise<Appointment[]> => {
    // Generate events relative to current week to ensure they are visible in the demo
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0,0,0,0);

    const googleEvents: Appointment[] = [
        {
            id: 'g1',
            patientId: 'google-user',
            patientName: 'Agenda Pessoal',
            professionalId: '2', 
            professionalName: 'Dr. Lucas',
            serviceId: 'g-lunch',
            serviceName: 'Almoço em Família',
            date: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // Wed 12:00
            status: AppointmentStatus.CONFIRMED,
            price: 0,
            professionalColor: '#ea4335', // Google Red
            source: 'GOOGLE'
        },
        {
            id: 'g2',
            patientId: 'google-user',
            patientName: 'Agenda Pessoal',
            professionalId: '2', 
            professionalName: 'Dr. Lucas',
            serviceId: 'g-dentist',
            serviceName: 'Dentista',
            date: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // Fri 09:00
            status: AppointmentStatus.CONFIRMED,
            price: 0,
            professionalColor: '#ea4335',
            source: 'GOOGLE'
        },
        {
            id: 'g3',
            patientId: 'google-user',
            patientName: 'Agenda Pessoal',
            professionalId: '2', 
            professionalName: 'Dr. Lucas',
            serviceId: 'g-gym',
            serviceName: 'Academia',
            date: new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(), // Tue 18:00
            status: AppointmentStatus.CONFIRMED,
            price: 0,
            professionalColor: '#ea4335',
            source: 'GOOGLE'
        }
    ];

    return new Promise(resolve => setTimeout(() => resolve(googleEvents), 800)); // Simulate API delay
  },

  getPatients: async (): Promise<User[]> => {
    return Promise.resolve(MOCK_USERS.filter(u => u.role === UserRole.PATIENT));
  },

  getProfessionals: async (): Promise<User[]> => {
    return Promise.resolve(MOCK_USERS.filter(u => u.role === UserRole.PROFESSIONAL || u.role === UserRole.ADMIN));
  },

  createPatient: async (name: string, email: string): Promise<User> => {
    const newUser: DBUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: '123',
      role: UserRole.PATIENT,
      anamnesisStatus: AnamnesisStatus.NONE,
      color: '#10b981',
      avatar: undefined
    };
    MOCK_USERS.push(newUser);
    const { password, ...safeUser } = newUser;
    return Promise.resolve(safeUser);
  },

  requestAnamnesis: async (patientId: string): Promise<void> => {
    const user = MOCK_USERS.find(u => u.id === patientId);
    if (user) {
      user.anamnesisStatus = AnamnesisStatus.REQUESTED;
    }
    return Promise.resolve();
  },

  saveAnamnesis: async (form: Omit<AnamnesisForm, 'id' | 'updatedAt'>): Promise<AnamnesisForm> => {
    const newForm: AnamnesisForm = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    const existingIdx = MOCK_ANAMNESIS.findIndex(a => a.patientId === form.patientId);
    if (existingIdx !== -1) MOCK_ANAMNESIS.splice(existingIdx, 1);
    
    MOCK_ANAMNESIS.push(newForm);
    
    const user = MOCK_USERS.find(u => u.id === form.patientId);
    if (user) user.anamnesisStatus = AnamnesisStatus.COMPLETED;

    return Promise.resolve(newForm);
  },

  getAnamnesis: async (patientId: string): Promise<AnamnesisForm | undefined> => {
    return Promise.resolve(MOCK_ANAMNESIS.find(a => a.patientId === patientId));
  },

  updateUserPassword: async (userId: string, newPass: string): Promise<void> => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.password = newPass;
    }
    return Promise.resolve();
  },

  updateUserProfile: async (userId: string, data: { name?: string; email?: string; phoneNumber?: string; whatsappEnabled?: boolean }): Promise<User | undefined> => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
        if (data.whatsappEnabled !== undefined) user.whatsappEnabled = data.whatsappEnabled;
        
        const { password, ...safeUser } = user;
        return Promise.resolve(safeUser);
    }
    return Promise.resolve(undefined);
  },

  checkAndSendReminders: async (): Promise<number> => {
    const now = new Date();
    let sentCount = 0;

    for (const appt of MOCK_APPOINTMENTS) {
        if (appt.status !== AppointmentStatus.CONFIRMED || appt.reminderSent || appt.source === 'GOOGLE') continue;

        const apptDate = new Date(appt.date);
        const timeDiff = apptDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        if (hoursDiff > 0 && hoursDiff <= 50) {
            const professional = MOCK_USERS.find(u => u.id === appt.professionalId);
            
            if (professional && professional.whatsappEnabled) {
                appt.reminderSent = true;
                sentCount++;
                console.log(`[WhatsApp Mock] Sending reminder to ${appt.patientName} for ${appt.serviceName} at ${apptDate.toLocaleString()}`);
            }
        }
    }
    return Promise.resolve(sentCount);
  }
};