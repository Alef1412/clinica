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
    <div class="dashboard-wrapper animate-fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 mb-5">
        <div>
          <h2 class="welcome-text mb-1">Olá, {{ user()?.name?.split(' ')[0] }}</h2>
          <p class="subtitle-text mb-0">Bem-vindo ao seu painel de controle.</p>
        </div>
        <div class="date-badge">
          {{ today | date:'fullDate':'':'pt-BR' }}
        </div>
      </div>

      <!-- Patient Action Required Notification -->
      <div *ngIf="user()?.role === 'PATIENT' && user()?.anamnesisStatus === 'REQUESTED'" 
           class="alert-premium amber-theme d-flex align-items-start gap-4 mb-5">
        <div class="alert-icon-box">
          <lucide-icon name="alert-circle" size="24"></lucide-icon>
        </div>
        <div>
          <h3 class="alert-title">Ficha de Anamnese Pendente</h3>
          <p class="alert-desc">Seu profissional solicitou o preenchimento da sua ficha de saúde para melhor atendê-lo.</p>
          <button (click)="navigateTo('/anamnesis')" class="btn-alert">
            Preencher Agora
          </button>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-12 col-md-6 col-lg-3">
          <div class="stat-card-premium">
            <div class="stat-info">
              <p class="stat-label">Agendamentos Futuros</p>
              <h3 class="stat-number">{{ stats().upcomingAppointments }}</h3>
            </div>
            <div class="stat-icon-box pink">
              <lucide-icon name="calendar" size="24"></lucide-icon>
            </div>
          </div>
        </div>

        <div *ngIf="user()?.role !== 'PATIENT'" class="col-12 col-md-6 col-lg-3">
          <div class="stat-card-premium">
            <div class="stat-info">
              <p class="stat-label">Receita Total</p>
              <h3 class="stat-number">R$ {{ stats().totalRevenue | number:'1.2-2':'pt-BR' }}</h3>
            </div>
            <div class="stat-icon-box emerald">
              <lucide-icon name="dollar-sign" size="24"></lucide-icon>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="stat-card-premium">
            <div class="stat-info">
              <p class="stat-label">Atendimentos Realizados</p>
              <h3 class="stat-number">{{ stats().completedAppointments }}</h3>
            </div>
            <div class="stat-icon-box blue">
              <lucide-icon name="check-circle" size="24"></lucide-icon>
            </div>
          </div>
        </div>

         <div class="col-12 col-md-6 col-lg-3">
          <div class="stat-card-premium">
            <div class="stat-info">
              <p class="stat-label">Horas Pendentes</p>
              <h3 class="stat-number">12h</h3>
            </div>
            <div class="stat-icon-box orange">
              <lucide-icon name="clock" size="24"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Split -->
      <div class="row g-4">
        
        <!-- Left Col - Chart -->
        <div class="col-12 col-lg-8" *ngIf="user()?.role !== 'PATIENT'; else patientBanner">
          <div class="chart-container-premium">
            <h3 class="chart-title">Performance Semanal</h3>
            <div class="chart-box">
              <p-chart type="line" [data]="chartData" [options]="chartOptions" height="100%"></p-chart>
            </div>
          </div>
        </div>

        <ng-template #patientBanner>
          <div class="col-12 col-lg-8">
            <div class="banner-premium d-flex flex-column justify-content-center p-5 position-relative">
               <h3 class="banner-title position-relative">Cuidar de você é o nosso propósito.</h3>
               <p class="banner-desc position-relative">Agende seu próximo procedimento e descubra o poder da sua melhor versão.</p>
               <button (click)="navigateTo('/schedule')" class="btn-banner position-relative">
                 Agendar Agora
               </button>
            </div>
          </div>
        </ng-template>

        <!-- Right Col - Recent Activity -->
        <div class="col-12 col-lg-4">
          <div class="activity-card-premium">
            <h3 class="card-section-title">Próximos Agendamentos</h3>
            <div class="activity-list mt-4">
              <div *ngFor="let apt of upcomingAppts()" (click)="navigateTo('/schedule')" 
                   class="activity-item d-flex align-items-center gap-3 p-3">
                <div class="date-circle d-flex align-items-center justify-content-center">
                  {{ apt.date | date:'dd' }}
                </div>
                <div class="activity-info flex-grow-1 min-w-0">
                  <p class="service-name mb-0 text-truncate">{{ apt.serviceName }}</p>
                  <p class="person-name mb-0 text-truncate">
                    {{ user()?.role === 'PATIENT' ? apt.professionalName : apt.patientName }}
                  </p>
                </div>
                
                <!-- Actions -->
                <ng-container *ngIf="apt.status === 'PENDING' && (user()?.role === 'ADMIN' || user()?.role === 'PROFESSIONAL'); else statusBadge">
                  <button (click)="handleQuickConfirm($event, apt.id)" class="btn-confirm-quick">
                    <lucide-icon name="check" size="16"></lucide-icon>
                  </button>
                </ng-container>

                <ng-template #statusBadge>
                  <span class="status-badge" [ngClass]="apt.status.toLowerCase()">
                    {{ apt.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente' }}
                  </span>
                </ng-template>
              </div>
              
              <div *ngIf="upcomingAppts().length === 0" class="empty-state text-center py-4">
                Nenhum agendamento futuro.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-text { font-size: 1.75rem; font-weight: 800; color: var(--text-color); letter-spacing: -0.02em; }
    .subtitle-text { font-size: 1rem; color: var(--text-color-secondary); }
    
    .date-badge {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      box-shadow: var(--shadow-sm);
    }

    .alert-premium {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 1.5rem;
      padding: 1.5rem;
      &.amber-theme { color: #92400e; }
    }

    .alert-icon-box {
      background: #fef3c7;
      padding: 12px;
      border-radius: 12px;
      color: #d97706;
    }

    .alert-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 4px; }
    .alert-desc { font-size: 0.9375rem; opacity: 0.9; margin-bottom: 16px; }

    .btn-alert {
      background: #d97706;
      color: white;
      border: 0;
      padding: 8px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      &:hover { background: #b45309; }
    }

    .stat-card-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    }

    .stat-label { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-color-secondary); margin-bottom: 4px; }
    .stat-number { font-size: 1.75rem; font-weight: 800; color: var(--text-color); margin: 0; }

    .stat-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      &.pink { background: linear-gradient(135deg, #f43f5e, #fb7185); }
      &.emerald { background: linear-gradient(135deg, #10b981, #34d399); }
      &.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
      &.orange { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    }

    .chart-container-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .chart-title { font-size: 1.125rem; font-weight: 700; color: var(--text-color); margin-bottom: 1.5rem; }
    .chart-box { height: 300px; }

    .banner-premium {
      background: var(--grad-premium);
      border-radius: 1.5rem;
      color: white;
      min-height: 100%;
      overflow: hidden;
      &::after {
        content: '';
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        filter: blur(40px);
      }
    }

    .banner-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
    .banner-desc { font-size: 1.1rem; opacity: 0.8; margin-bottom: 2rem; }

    .btn-banner {
      background: white;
      color: var(--primary-color);
      border: 0;
      padding: 12px 28px;
      border-radius: 12px;
      font-weight: 700;
      width: fit-content;
      transition: all 0.2s;
      &:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    }

    .activity-card-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .card-section-title { font-size: 1.125rem; font-weight: 700; color: var(--text-color); }

    .activity-item {
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { background: var(--surface-hover); }
    }

    .date-circle {
      width: 44px;
      height: 44px;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: 50%;
      font-weight: 800;
      font-size: 0.9rem;
    }

    .service-name { font-weight: 700; font-size: 0.875rem; color: var(--text-color); }
    .person-name { font-size: 0.75rem; color: var(--text-color-secondary); }

    .btn-confirm-quick {
      background: #f0fdf4;
      color: #16a34a;
      border: 0;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:hover { background: #dcfce7; }
    }

    .status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 99px;
      &.confirmed { background: #f0fdf4; color: #16a34a; }
      &.pending { background: #fffbeb; color: #d97706; }
    }

    .empty-state { color: var(--text-color-secondary); font-size: 0.875rem; font-style: italic; }
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
