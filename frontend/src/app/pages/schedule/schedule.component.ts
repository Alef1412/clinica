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
    <div class="schedule-wrapper h-100 d-flex flex-column animate-fade-in" (click)="showHeaderCalendar.set(false); showModalCalendar.set(false)">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-4">
        <div>
          <h2 class="section-title mb-1 d-flex align-items-center gap-2">
             <lucide-icon name="calendar" size="28" class="text-primary"></lucide-icon>
             Agenda
          </h2>
          <p class="section-subtitle mb-0">Gerencie suas consultas semanais.</p>
        </div>
        
        <div class="d-flex gap-3">
             <button 
                (click)="handleGoogleSync()"
                [disabled]="isSyncing()"
                class="btn btn-sync-google d-flex align-items-center gap-2"
                [class.synced]="googleSynced()"
                [title]="googleSynced() ? 'Clique para desconectar' : 'Sincronizar com Google'"
            >
                <lucide-icon *ngIf="isSyncing()" name="loader-2" class="animate-spin" size="16"></lucide-icon>
                <ng-container *ngIf="!isSyncing()">
                  <div *ngIf="googleSynced()" class="status-indicator">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="gcal-icon" alt="GCal"/>
                    <div class="dot"></div>
                  </div>
                  <img *ngIf="!googleSynced()" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="gcal-icon" alt="GCal"/>
                </ng-container>
                {{ isSyncing() ? 'Conectando...' : googleSynced() ? 'Sincronizado' : 'Conectar Google' }}
            </button>
            <button 
              (click)="$event.stopPropagation(); isModalOpen.set(true)"
              class="btn btn-primary-premium d-flex align-items-center gap-2"
            >
              <lucide-icon name="plus" size="18"></lucide-icon>
              <span class="d-none d-sm-inline">Novo Agendamento</span>
            </button>
        </div>
      </div>

      <!-- Calendar Controls -->
      <div class="calendar-controls d-flex align-items-center justify-content-between p-2 mb-3">
         <div class="d-flex align-items-center gap-2">
            <button (click)="$event.stopPropagation(); prevWeek()" class="btn btn-icon-nav">
                <lucide-icon name="chevron-left" size="20"></lucide-icon>
            </button>
            
            <div class="position-relative">
                <button 
                    (click)="$event.stopPropagation(); showHeaderCalendar.set(!showHeaderCalendar()); showModalCalendar.set(false)"
                    class="btn btn-month-selector d-flex align-items-center gap-2"
                    [class.active]="showHeaderCalendar()"
                >
                    <lucide-icon name="calendar" size="18"></lucide-icon>
                    <span class="month-label">
                        {{ startOfWeek() | date:'LLLL, yyyy':'':'pt-BR' }}
                    </span>
                </button>
                <div *ngIf="showHeaderCalendar()" class="mini-calendar-popup shadow-lg p-3" (click)="$event.stopPropagation()">
                   <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="popup-month-title">{{ currentDate() | date:'MMMM yyyy':'':'pt-BR' }}</span>
                   </div>
                   <div class="popup-placeholder text-center py-2">Calendário interativo em desenvolvimento</div>
                </div>
            </div>

            <button (click)="$event.stopPropagation(); nextWeek()" class="btn btn-icon-nav">
                <lucide-icon name="chevron-right" size="20"></lucide-icon>
            </button>
         </div>
         <div class="d-flex gap-4 px-3 calendar-legend">
             <div class="legend-item d-flex align-items-center gap-1.5">
                 <div class="legend-dot blue"></div>
                 <span>Dr. Lucas</span>
             </div>
             <div *ngIf="googleSynced()" class="legend-item d-flex align-items-center gap-1.5">
                <div class="legend-dot gcal"></div>
                <span>Google Calendar</span>
            </div>
         </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid-container flex-grow-1 d-flex flex-column shadow-sm overflow-auto">
        <!-- Header Row -->
        <div class="grid-header d-flex sticky-top bg-white z-2">
            <div class="time-label-spacer shrink-0 border-end"></div>
            <div *ngFor="let date of weekDays()" class="day-cell flex-grow-1 py-3 text-center border-end">
                <p class="day-name mb-1" [class.active]="isToday(date)">
                    {{ date | date:'EEE':'':'pt-BR' }}
                </p>
                <div class="day-number shadow-sm" [class.active]="isToday(date)">
                    {{ date | date:'dd' }}
                </div>
            </div>
        </div>

        <!-- Time Grid -->
        <div class="grid-body d-flex flex-grow-1 position-relative">
            <div class="time-labels shrink-0 border-end">
                <div *ngFor="let hour of hours" class="time-label position-relative pr-2 pt-2">
                    {{ hour }}:00
                </div>
            </div>

            <div *ngFor="let date of weekDays(); let dayIndex = index" class="day-column flex-grow-1 border-end position-relative">
                <div *ngFor="let hour of hours" 
                     class="time-slot border-bottom transition-colors cursor-pointer"
                     (click)="$event.stopPropagation(); onSlotClick(date, hour)">
                </div>

                <!-- Events -->
                <div *ngFor="let apt of getAppointmentsForDay(date)"
                     (click)="onEventClick($event, apt)"
                     class="event-block position-absolute rounded-3 shadow-sm transition z-1"
                     [ngStyle]="getEventStyle(apt)">
                    <div class="event-title font-weight-bold text-truncate d-flex align-items-center gap-1">
                        <img *ngIf="apt.source === 'GOOGLE'" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" class="gcal-tiny-icon" />
                        <span *ngIf="apt.status === 'PENDING'">(Pendente) </span> 
                        {{ apt.serviceName }}
                    </div>
                    <div class="event-subtitle text-truncate">
                        {{ userRole() === 'PATIENT' ? apt.professionalName : apt.patientName }}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Detail Modal Simplified -->
      <div *ngIf="selectedAppointment()" class="modal-backdrop-premium d-flex align-items-center justify-content-center p-3" (click)="selectedAppointment.set(null)">
          <div class="modal-card-premium small animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header-premium d-flex justify-content-between align-items-center p-4" [ngClass]="getHeaderClass(selectedAppointment()!)">
              <h3 class="mb-0 text-white font-weight-bold d-flex align-items-center gap-2">
                 <lucide-icon name="calendar" size="20"></lucide-icon> Detalhes
              </h3>
              <button (click)="selectedAppointment.set(null)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            <div class="p-4">
               <div class="event-detail-title mb-2">{{ selectedAppointment()?.serviceName }}</div>
               <div class="event-detail-time mb-4 d-flex align-items-center gap-2">
                  <lucide-icon name="clock" size="16"></lucide-icon>
                  {{ selectedAppointment()?.date | date:'EEEE, dd MMMM':'':'pt-BR' }} às {{ selectedAppointment()?.date | date:'HH:mm' }}
               </div>
               <button (click)="handleStatusChange('CANCELLED')" class="btn btn-cancel-appointment w-100 py-3">
                  Cancelar Agendamento
               </button>
            </div>
          </div>
      </div>

       <!-- Booking Modal Simplified -->
       <div *ngIf="isModalOpen()" class="modal-backdrop-premium d-flex align-items-center justify-content-center p-3" (click)="isModalOpen.set(false)">
          <div class="modal-card-premium animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header-premium bg-primary d-flex justify-content-between align-items-center p-4">
              <h3 class="mb-0 text-white font-weight-bold">Novo Agendamento</h3>
              <button (click)="isModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            <form (submit)="handleBook($event)" class="p-4">
               <div class="mb-3">
                  <label class="form-label-premium">Procedimento</label>
                  <select name="svc" [(ngModel)]="bookingData.serviceId" class="form-select-premium" required>
                     <option value="">Selecione...</option>
                     <option *ngFor="let s of services()" [value]="s.id">{{ s.name }} - R$ {{ s.price }}</option>
                  </select>
               </div>
               <div class="row g-3">
                  <div class="col-6">
                    <label class="form-label-premium">Data</label>
                    <input type="date" name="date" [(ngModel)]="bookingData.date" class="form-control-premium" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label-premium">Hora</label>
                    <input type="time" name="time" [(ngModel)]="bookingData.time" class="form-control-premium" required />
                  </div>
               </div>
               <button type="submit" class="btn btn-primary-premium w-100 py-3 mt-4">Confirmar Agendamento</button>
            </form>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.875rem; color: var(--text-color-secondary); }

    .btn-sync-google {
      background: var(--surface-card); border: 1px solid var(--surface-border);
      border-radius: 12px; padding: 10px 16px; font-weight: 600; font-size: 0.8125rem;
      color: var(--text-color-secondary); transition: all 0.2s;
      &:hover { border-color: var(--stone-300); background: var(--surface-hover); color: var(--text-color); }
      &.synced { color: #16a34a; border-color: #dcfce7; background: #f0fdf4; 
        &:hover { color: #ef4444; border-color: #fee2e2; background: #fef2f2; }
      }
    }

    .status-indicator { position: relative; }
    .gcal-icon { width: 16px; height: 16px; }
    .dot { position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; border: 2px solid white; }

    .btn-primary-premium {
      background: var(--grad-primary); color: white; border: 0; border-radius: 12px;
      padding: 10px 16px; font-weight: 700; font-size: 0.8125rem; box-shadow: var(--shadow-md);
      transition: all 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(244, 63, 94, 0.3); color: white; }
    }

    .calendar-controls { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 14px; }
    .btn-icon-nav { padding: 6px; border: 0; background: transparent; color: var(--text-color-secondary); &:hover { color: var(--primary-color); background: var(--surface-hover); border-radius: 8px; } }

    .btn-month-selector {
      border: 1px solid transparent; background: transparent; padding: 6px 12px; border-radius: 10px;
      font-weight: 700; color: var(--text-color); transition: all 0.2s;
      &.active { background: var(--primary-light); color: var(--primary-color); border-color: var(--primary-light); }
      &:hover:not(.active) { background: var(--surface-hover); }
    }

    .calendar-legend { font-size: 0.75rem; font-weight: 600; color: var(--text-color-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; &.blue { background: #3b82f6; } &.gcal { background: white; border: 1px solid #ef4444; } }

    .calendar-grid-container {
      background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 16px;
      min-height: 600px;
    }

    .grid-header { border-bottom: 1px solid var(--surface-border); }
    .time-label-spacer { width: 64px; }
    .day-cell { min-width: 100px; border-color: var(--surface-border) !important; }
    .day-name { font-size: 0.6875rem; font-weight: 700; color: var(--text-color-tertiary); text-transform: uppercase; &.active { color: var(--primary-color); } }
    .day-number { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 1.125rem; font-weight: 800; color: var(--text-color); transition: all 0.2s; &.active { background: var(--primary-color); color: white; } }

    .time-labels { width: 64px; background: var(--surface-hover); border-color: var(--surface-border) !important; }
    .time-label { height: 60px; font-size: 0.6875rem; color: var(--text-color-tertiary); text-align: right; }
    .day-column { min-width: 100px; border-color: var(--surface-border) !important; }
    .time-slot { height: 60px; border-color: var(--surface-border) !important; &:hover { background: var(--surface-hover); } }

    .event-block { 
      left: 4px; right: 4px; padding: 6px; font-size: 0.75rem; border-left: 4px solid; 
      transition: filter 0.2s; &:hover { filter: brightness(0.95); }
    }
    .event-title { font-size: 0.75rem; margin-bottom: 2px; }
    .event-subtitle { font-size: 0.625rem; opacity: 0.8; }
    .gcal-tiny-icon { width: 12px; height: 12px; }

    /* Modals */
    .modal-backdrop-premium { position: fixed; inset: 0; background: rgba(12, 10, 9, 0.4); backdrop-filter: blur(8px); z-index: 1100; }
    .modal-card-premium { background: var(--surface-card); width: 100%; max-width: 440px; border-radius: 1.5rem; overflow: hidden; box-shadow: var(--shadow-lg); &.small { max-width: 380px; } }
    .modal-header-premium { &.bg-primary { background: var(--primary-color); } }
    .btn-close-modal { opacity: 0.8; &:hover { opacity: 1; } }

    .event-detail-title { font-size: 1.25rem; font-weight: 800; color: var(--text-color); }
    .event-detail-time { font-size: 0.875rem; color: var(--text-color-secondary); font-weight: 600; }
    .btn-cancel-appointment { background: #fef2f2; border: 1px solid #fee2e2; color: #ef4444; font-weight: 700; border-radius: 12px; &:hover { background: #fee2e2; } }

    .form-label-premium { font-size: 0.8125rem; font-weight: 700; color: var(--text-color-secondary); margin-bottom: 6px; text-transform: uppercase; }
    .form-control-premium, .form-select-premium { border-radius: 12px; padding: 12px; border: 1px solid var(--surface-border); background: var(--surface-hover); color: var(--text-color); font-size: 0.9375rem; &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); outline: none; } }

    .mini-calendar-popup { position: absolute; top: 100%; left: 0; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 12px; z-index: 1050; width: 260px; margin-top: 8px; }
    .popup-month-title { font-size: 0.875rem; font-weight: 800; color: var(--text-color); }
    .popup-placeholder { font-size: 0.75rem; color: var(--text-color-tertiary); font-style: italic; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
    if (apt.source === 'GOOGLE') return 'bg-white border-bottom border-light';
    if (apt.status === 'PENDING') return 'bg-warning';
    return 'bg-dark';
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
