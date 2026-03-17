import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ChartModule } from 'primeng/chart';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, Appointment, Transaction, AppointmentStatus, AnamnesisStatus } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ChartModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 class="text-3xl font-bold text-stone-800 dark:text-white">Olá, {{ user()?.name?.split(' ')[0] }}</h2>
          <p class="text-stone-500 dark:text-stone-400 mt-2">Bem-vindo ao seu painel de controle.</p>
        </div>
        <div class="text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-full shadow-sm border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300">
          {{ today | date:'fullDate':'':'pt-BR' }}
        </div>
      </div>

      <!-- Patient Action Required Notification -->
      <div *ngIf="user()?.role === 'PATIENT' && user()?.anamnesisStatus === 'REQUESTED'" 
           class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div class="bg-amber-100 dark:bg-amber-800 p-2 rounded-lg text-amber-600 dark:text-amber-200 shrink-0">
          <lucide-icon name="alert-circle" size="24"></lucide-icon>
        </div>
        <div>
          <h3 class="text-amber-800 dark:text-amber-200 font-bold text-lg">Ficha de Anamnese Pendente</h3>
          <p class="text-amber-700 dark:text-amber-300 mt-1 mb-4">Seu profissional solicitou o preenchimento da sua ficha de saúde para melhor atendê-lo.</p>
          <button (click)="navigateTo('/anamnesis')"
            class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-md shadow-amber-200 dark:shadow-none">
            Preencher Agora
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="stat-card">
          <div>
            <p class="stat-title">Agendamentos Futuros</p>
            <h3 class="stat-value">{{ stats().upcomingAppointments }}</h3>
          </div>
          <div class="stat-icon bg-primary-400">
            <lucide-icon name="calendar" class="text-white" size="24"></lucide-icon>
          </div>
        </div>

        <div *ngIf="user()?.role !== 'PATIENT'" class="stat-card">
          <div>
            <p class="stat-title">Receita Total</p>
            <h3 class="stat-value">R$ {{ stats().totalRevenue | number:'1.2-2':'pt-BR' }}</h3>
          </div>
          <div class="stat-icon bg-emerald-400">
            <lucide-icon name="dollar-sign" class="text-white" size="24"></lucide-icon>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <p class="stat-title">Atendimentos Realizados</p>
            <h3 class="stat-value">{{ stats().completedAppointments }}</h3>
          </div>
          <div class="stat-icon bg-blue-400">
            <lucide-icon name="check-circle" class="text-white" size="24"></lucide-icon>
          </div>
        </div>

         <div class="stat-card">
          <div>
            <p class="stat-title">Horas Pendentes</p>
            <h3 class="stat-value">12h</h3>
          </div>
          <div class="stat-icon bg-orange-400">
            <lucide-icon name="clock" class="text-white" size="24"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Main Content Split -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Col - Chart -->
        <div *ngIf="user()?.role !== 'PATIENT'; else patientBanner" class="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-6">Performance Semanal</h3>
          <div class="h-72">
            <p-chart type="line" [data]="chartData" [options]="chartOptions" height="100%"></p-chart>
          </div>
        </div>

        <ng-template #patientBanner>
          <div class="lg:col-span-2 bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
             <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
             <h3 class="text-2xl font-bold mb-4 relative z-10">Cuidar de você é o nosso propósito.</h3>
             <p class="text-white/80 mb-8 max-w-md relative z-10">Agende seu próximo procedimento e descubra o poder da sua melhor versão.</p>
             <button (click)="navigateTo('/schedule')"
                class="bg-white text-primary font-bold py-3 px-6 rounded-xl w-max hover:bg-stone-50 transition shadow-lg relative z-10">
               Agendar Agora
             </button>
          </div>
        </ng-template>

        <!-- Right Col - Recent Activity -->
        <div class="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-6">Próximos Agendamentos</h3>
          <div class="space-y-4">
            <div *ngFor="let apt of upcomingAppts()" (click)="navigateTo('/schedule')" 
                 class="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-transparent hover:border-stone-100 dark:hover:border-stone-700 group">
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {{ apt.date | date:'dd' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{{ apt.serviceName }}</p>
                <p class="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {{ user()?.role === 'PATIENT' ? apt.professionalName : apt.patientName }}
                </p>
              </div>
              
              <!-- Actions -->
              <ng-container *ngIf="apt.status === 'PENDING' && (user()?.role === 'ADMIN' || user()?.role === 'PROFESSIONAL'); else statusBadge">
                <button (click)="handleQuickConfirm($event, apt.id)"
                        class="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition"
                        title="Confirmar Agendamento">
                    <lucide-icon name="check" size="16"></lucide-icon>
                </button>
              </ng-container>

              <ng-template #statusBadge>
                <span [ngClass]="{
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': apt.status === 'CONFIRMED',
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': apt.status === 'PENDING',
                  'bg-gray-100 text-gray-600 dark:bg-stone-800 dark:text-stone-400': apt.status !== 'CONFIRMED' && apt.status !== 'PENDING'
                }" class="text-xs font-semibold px-2 py-1 rounded-full shrink-0">
                  {{ apt.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente' }}
                </span>
              </ng-template>
            </div>
            
            <div *ngIf="upcomingAppts().length === 0" class="text-stone-400 dark:text-stone-600 text-center py-4 text-sm">
              Nenhum agendamento futuro.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-primary { background-color: var(--primary-color); }
    .text-primary { color: var(--primary-color); }
    .bg-primary-100 { background-color: #fdf2f8; }
    .bg-primary-400 { background-color: #f472b6; }
    
    .stat-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #f5f5f4;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    :host-context(.dark) .stat-card {
      background-color: #1c1917;
      border-color: #292524;
    }
    
    .stat-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #78716c;
      margin-bottom: 0.25rem;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1c1917;
    }
    :host-context(.dark) .stat-value {
      color: #f5f5f4;
    }
    
    .stat-icon {
      padding: 0.75rem;
      border-radius: 0.75rem;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private mockDb = inject(MockDbService);
  private router = inject(Router);

  user = signal<any>(null);
  today = new Date();
  appointments = signal<Appointment[]>([]);
  transactions = signal<Transaction[]>([]);
  
  stats = signal({
    upcomingAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0
  });

  upcomingAppts = signal<Appointment[]>([]);

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    // For demo purposes, we'll just use the first user in the mock DB
    this.user.set({
      id: '1',
      name: 'Ana Silva',
      role: UserRole.ADMIN,
      anamnesisStatus: AnamnesisStatus.NONE
    });

    this.loadData();
    this.initChart();
  }

  async loadData() {
    const apps = await this.mockDb.getAppointments(this.user());
    // Note: getTransactions is not yet in MockDbService, I'll need to add it
    // For now using empty array
    const trans: Transaction[] = []; 
    
    this.appointments.set(apps);
    this.transactions.set(trans);

    this.calculateStats();
  }

  calculateStats() {
    const apps = this.appointments();
    const trans = this.transactions();

    const upcoming = apps.filter(a => new Date(a.date) > new Date() && a.status !== AppointmentStatus.CANCELLED);
    const completed = apps.filter(a => a.status === AppointmentStatus.COMPLETED);
    const revenue = trans.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);

    this.stats.set({
      upcomingAppointments: upcoming.length,
      totalRevenue: revenue,
      completedAppointments: completed.length
    });

    this.upcomingAppts.set(upcoming.slice(0, 4));
  }

  initChart() {
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#f5f5f4' : '#4b5563';
    const surfaceBorder = isDark ? '#292524' : '#dfe7ef';

    this.chartData = {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Performance',
          data: [400, 300, 600, 800, 500, 900, 100],
          fill: true,
          borderColor: '#ec4899',
          tension: 0.4,
          backgroundColor: 'rgba(236, 72, 153, 0.1)'
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: 'transparent', drawBorder: false }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      },
      maintainAspectRatio: false
    };
  }

  async handleQuickConfirm(e: Event, id: string) {
    e.stopPropagation();
    await this.mockDb.updateAppointmentStatus(id, AppointmentStatus.CONFIRMED);
    this.loadData();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
