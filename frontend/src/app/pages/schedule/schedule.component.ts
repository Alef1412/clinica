import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, Appointment, Product, AppointmentStatus } from '../../models/types';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 h-full flex flex-col animate-fade-in" (click)="showHeaderCalendar.set(false); showModalCalendar.set(false)">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-stone-800 dark:text-white flex items-center gap-2">
             <lucide-icon name="calendar" size="28" class="text-primary"></lucide-icon>
             Agenda
          </h2>
          <p class="text-stone-500 dark:text-stone-400 text-sm">Gerencie suas consultas semanais.</p>
        </div>
        
        <div class="flex gap-3">
             <button 
                (click)="handleGoogleSync()"
                [disabled]="isSyncing()"
                class="px-4 py-2 rounded-xl font-medium border transition-all flex items-center gap-2 text-sm shadow-sm"
                [ngClass]="googleSynced() 
                        ? 'bg-white dark:bg-stone-800 text-green-600 border-green-200 dark:border-green-800 hover:border-red-200 hover:text-red-500' 
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'"
                [title]="googleSynced() ? 'Clique para desconectar' : 'Sincronizar com Google'"
            >
                <lucide-icon *ngIf="isSyncing()" name="loader-2" class="animate-spin" size="16"></lucide-icon>
                <ng-container *ngIf="!isSyncing()">
                  <div *ngIf="googleSynced()" class="relative">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="w-4 h-4" alt="GCal"/>
                    <div class="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <img *ngIf="!googleSynced()" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="w-4 h-4" alt="GCal"/>
                </ng-container>
                {{ isSyncing() ? 'Conectando...' : googleSynced() ? 'Sincronizado' : 'Conectar Google' }}
            </button>
            <button 
              (click)="$event.stopPropagation(); isModalOpen.set(true)"
              class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all text-sm"
            >
              <lucide-icon name="plus" size="18"></lucide-icon>
              <span class="hidden sm:inline">Novo Agendamento</span>
            </button>
        </div>
      </div>

      <!-- Calendar Controls -->
      <div class="flex items-center justify-between bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 relative z-20">
         <div class="flex items-center gap-2">
            <button (click)="$event.stopPropagation(); prevWeek()" class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300">
                <lucide-icon name="chevron-left" size="20"></lucide-icon>
            </button>
            
            <div class="relative">
                <button 
                    (click)="$event.stopPropagation(); showHeaderCalendar.set(!showHeaderCalendar()); showModalCalendar.set(false)"
                    [class.bg-primary-50]="showHeaderCalendar()"
                    [class.text-primary-700]="showHeaderCalendar()"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-200"
                >
                    <lucide-icon name="calendar" size="18" [class.text-primary]="showHeaderCalendar()"></lucide-icon>
                    <span class="font-semibold text-stone-800 dark:text-white">
                        {{ startOfWeek() | date:'LLLL, yyyy':'':'pt-BR' }}
                    </span>
                </button>
                <div *ngIf="showHeaderCalendar()" class="mini-calendar-popup" (click)="$event.stopPropagation()">
                   <!-- Mini Calendar Simplified -->
                   <div class="flex justify-between items-center mb-4">
                      <span class="font-bold text-sm text-stone-800 dark:text-white">{{ currentDate() | date:'MMMM yyyy':'':'pt-BR' }}</span>
                   </div>
                   <div class="text-xs text-stone-400 text-center">Calendário interativo em desenvolvimento</div>
                </div>
            </div>

            <button (click)="$event.stopPropagation(); nextWeek()" class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300">
                <lucide-icon name="chevron-right" size="20"></lucide-icon>
            </button>
         </div>
         <div class="flex gap-4 px-4 text-xs font-medium">
             <div class="flex items-center gap-1.5">
                 <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span class="text-stone-600 dark:text-stone-400">Dr. Lucas</span>
             </div>
             <div *ngIf="googleSynced()" class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full border border-red-500 bg-white"></div>
                <span class="text-stone-600 dark:text-stone-400">Google Calendar</span>
            </div>
         </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-auto shadow-sm flex flex-col min-h-[600px]">
        <!-- Header Row -->
        <div class="flex border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
            <div class="w-16 border-r border-stone-200 dark:border-stone-800 shrink-0"></div>
            <div *ngFor="let date of weekDays()" class="flex-1 py-3 text-center border-r border-stone-200 dark:border-stone-800 min-w-[100px]">
                <p class="text-xs uppercase font-semibold mb-1" [class.text-primary]="isToday(date)">
                    {{ date | date:'EEE':'':'pt-BR' }}
                </p>
                <div class="w-8 h-8 rounded-full flex items-center justify-center mx-auto text-lg font-bold" 
                     [class.bg-primary]="isToday(date)" [class.text-white]="isToday(date)">
                    {{ date | date:'dd' }}
                </div>
            </div>
        </div>

        <!-- Time Grid -->
        <div class="flex flex-1 relative">
            <div class="w-16 shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">
                <div *ngFor="let hour of hours" class="h-[60px] text-right pr-2 pt-2 text-xs text-stone-500 relative">
                    {{ hour }}:00
                </div>
            </div>

            <div *ngFor="let date of weekDays(); let dayIndex = index" class="flex-1 border-r border-stone-200 dark:border-stone-800 relative min-w-[100px]">
                <div *ngFor="let hour of hours" 
                     class="h-[60px] border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer"
                     (click)="$event.stopPropagation(); onSlotClick(date, hour)">
                </div>

                <!-- Events -->
                <div *ngFor="let apt of getAppointmentsForDay(date)"
                     (click)="onEventClick($event, apt)"
                     class="absolute left-1 right-1 rounded-md p-1.5 text-xs shadow-sm border-l-4 overflow-hidden cursor-pointer hover:brightness-95 transition z-10"
                     [ngStyle]="getEventStyle(apt)">
                    <div class="font-bold truncate flex items-center gap-1">
                        <img *ngIf="apt.source === 'GOOGLE'" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="w-3 h-3 inline" />
                        <span *ngIf="apt.status === 'PENDING'">(Pendente) </span> 
                        {{ apt.serviceName }}
                    </div>
                    <div class="truncate text-[10px] opacity-80">
                        {{ userRole() === 'PATIENT' ? apt.professionalName : apt.patientName }}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Detail Modal Simplified -->
      <div *ngIf="selectedAppointment()" class="modal-backdrop" (click)="selectedAppointment.set(null)">
          <div class="modal-container max-w-sm" (click)="$event.stopPropagation()">
            <div class="modal-header" [ngClass]="getHeaderClass(selectedAppointment()!)">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                 <lucide-icon name="calendar" size="20"></lucide-icon> Detalhes
              </h3>
              <button (click)="selectedAppointment.set(null)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            <div class="p-6 space-y-4">
               <div class="font-bold text-lg">{{ selectedAppointment()?.serviceName }}</div>
               <div class="text-stone-500">
                  {{ selectedAppointment()?.date | date:'EEEE, dd MMMM':'':'pt-BR' }} às {{ selectedAppointment()?.date | date:'HH:mm' }}
               </div>
               <button (click)="handleStatusChange('CANCELLED')" class="w-full bg-red-50 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition">
                  Cancelar Agendamento
               </button>
            </div>
          </div>
      </div>

       <!-- Booking Modal Simplified -->
       <div *ngIf="isModalOpen()" class="modal-backdrop" (click)="isModalOpen.set(false)">
          <div class="modal-container max-w-md" (click)="$event.stopPropagation()">
            <div class="modal-header bg-primary">
              <h3 class="text-white font-bold text-lg">Novo Agendamento</h3>
              <button (click)="isModalOpen.set(false)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            <form (submit)="handleBook($event)" class="p-6 space-y-4">
               <div>
                  <label class="modal-label">Procedimento</label>
                  <select name="svc" [(ngModel)]="bookingData.serviceId" class="modal-input" required>
                     <option value="">Selecione...</option>
                     <option *ngFor="let s of services()" [value]="s.id">{{ s.name }} - R$ {{ s.price }}</option>
                  </select>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="modal-label">Data</label>
                    <input type="date" name="date" [(ngModel)]="bookingData.date" class="modal-input" required />
                  </div>
                  <div>
                    <label class="modal-label">Hora</label>
                    <input type="time" name="time" [(ngModel)]="bookingData.time" class="modal-input" required />
                  </div>
               </div>
               <button type="submit" class="modal-submit bg-primary mt-4">Confirmar Agendamento</button>
            </form>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .text-primary { color: var(--primary-color); }
    .bg-primary { background-color: var(--primary-color); }
    .bg-primary-50 { background-color: #fdf2f8; }
    .bg-primary-dark { background-color: #db2777; }
    
    .mini-calendar-popup {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.5rem;
      z-index: 50;
      background-color: white;
      padding: 1rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      border: 1px solid #e7e5e4;
      width: 16rem;
    }
    :host-context(.dark) .mini-calendar-popup { background-color: #292524; border-color: #44403c; }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(28, 25, 23, 0.4);
      backdrop-filter: blur(4px);
      padding: 1rem;
    }
    .modal-container {
      background-color: white;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      width: 100%;
      overflow: hidden;
      border: 1px solid #e7e5e4;
    }
    :host-context(.dark) .modal-container { background-color: #1c1917; border-color: #292524; }
    .modal-header { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .modal-label { display: block; font-size: 0.875rem; font-weight: 500; color: #44403c; margin-bottom: 0.25rem; }
    .modal-input { width: 100%; border-radius: 0.75rem; border: 1px solid #e7e5e4; background-color: #f5f5f4; padding: 0.625rem; outline: none; }
    .modal-submit { width: 100%; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.75rem; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class ScheduleComponent implements OnInit {
  private mockDb = inject(MockDbService);

  userRole = signal<string>(UserRole.ADMIN);
  appointments = signal<Appointment[]>([]);
  services = signal<Product[]>([]);
  
  googleSynced = signal(false);
  isSyncing = signal(false);
  currentDate = signal(new Date());
  
  isModalOpen = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  
  showHeaderCalendar = signal(false);
  showModalCalendar = signal(false);

  hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  bookingData = {
    serviceId: '',
    date: '',
    time: ''
  };

  startOfWeek = computed(() => {
    const d = new Date(this.currentDate());
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0,0,0,0);
    return d;
  });

  weekDays = computed(() => {
    const start = this.startOfWeek();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    // Mock user for now
    const user = { id: '1', role: UserRole.ADMIN } as any;
    let apps = await this.mockDb.getAppointments(user);
    if (this.googleSynced()) {
      const gApps = await this.mockDb.getGoogleEvents();
      apps = [...apps, ...gApps];
    }
    this.appointments.set(apps);
    this.services.set(await this.mockDb.getProducts());
  }

  isToday(date: Date) {
    return new Date().toDateString() === date.toDateString();
  }

  prevWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 7);
    this.currentDate.set(d);
  }

  nextWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 7);
    this.currentDate.set(d);
  }

  getAppointmentsForDay(date: Date) {
    return this.appointments().filter(apt => {
      const d = new Date(apt.date);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && apt.status !== AppointmentStatus.CANCELLED;
    });
  }

  getEventStyle(apt: Appointment) {
    const d = new Date(apt.date);
    const top = (d.getHours() - 8) * 60 + d.getMinutes();
    const service = this.services().find(s => s.id === apt.serviceId);
    const height = service ? service.durationMin : 60;
    
    let color = apt.source === 'GOOGLE' ? '#ea4335' : (apt.status === 'PENDING' ? '#f59e0b' : '#3b82f6');
    if (apt.source === 'LUMINA' && apt.status !== 'PENDING') color = '#ec4899';

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: `${color}20`,
      borderLeftColor: color,
      borderTopColor: apt.source === 'GOOGLE' ? color : undefined,
      borderRightColor: apt.source === 'GOOGLE' ? color : undefined,
      borderBottomColor: apt.source === 'GOOGLE' ? color : undefined,
      color: color
    };
  }

  getHeaderClass(apt: Appointment) {
    if (apt.source === 'GOOGLE') return 'bg-white border-b border-stone-200';
    if (apt.status === 'PENDING') return 'bg-amber-500';
    return 'bg-stone-800';
  }

  async handleBook(e: Event) {
    e.preventDefault();
    if (!this.bookingData.serviceId || !this.bookingData.date || !this.bookingData.time) return;
    
    const svc = this.services().find(s => s.id === this.bookingData.serviceId);
    if (!svc) return;

    await this.mockDb.createAppointment({
      patientId: '1',
      patientName: 'Walk-in Client',
      serviceId: svc.id,
      serviceName: svc.name,
      date: new Date(`${this.bookingData.date}T${this.bookingData.time}`).toISOString(),
      price: svc.price,
      status: AppointmentStatus.CONFIRMED
    });
    
    this.isModalOpen.set(false);
    this.loadData();
  }

  async handleStatusChange(status: string) {
    const apt = this.selectedAppointment();
    if (!apt) return;
    await this.mockDb.updateAppointmentStatus(apt.id, status as AppointmentStatus);
    this.selectedAppointment.set(null);
    this.loadData();
  }

  handleGoogleSync() {
    if (this.googleSynced()) {
        this.googleSynced.set(false);
        this.loadData();
        return;
    }
    this.isSyncing.set(true);
    setTimeout(() => {
        this.isSyncing.set(false);
        this.googleSynced.set(true);
        this.loadData();
    }, 2000);
  }

  onSlotClick(date: Date, hour: number) {
    this.bookingData.date = date.toISOString().split('T')[0];
    this.bookingData.time = `${hour.toString().padStart(2, '0')}:00`;
    this.isModalOpen.set(true);
  }

  onEventClick(e: Event, apt: Appointment) {
    e.stopPropagation();
    this.selectedAppointment.set(apt);
  }
}
