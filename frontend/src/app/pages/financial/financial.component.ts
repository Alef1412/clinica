import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChartModule } from 'primeng/chart';
import { MockDbService } from '../../services/mock-db.service';
import { User, Transaction, UserRole } from '../../models/types';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ChartModule],
  template: `
    <div class="finance-wrapper animate-fade-in">
       <div *ngIf="userRole() === 'PATIENT'" class="empty-state-notice">
          Acesso negado. Esta área é restrita a administradores e profissionais.
       </div>

       <ng-container *ngIf="userRole() !== 'PATIENT'">
          <div class="mb-5">
             <h2 class="section-title mb-1">Financeiro</h2>
             <p class="section-subtitle mb-0">Controle de caixa, fluxo de receitas e despesas.</p>
           </div>

          <div class="row g-4 mb-5">
            <div class="col-12 col-md-4">
              <div class="finance-card-premium">
                <div class="icon-box green">
                  <lucide-icon name="trending-up" size="24"></lucide-icon>
                </div>
                <div>
                  <p class="card-label">Receitas</p>
                  <h3 class="card-value income">R$ {{ income() | number:'1.0-0':'pt-BR' }}</h3>
                </div>
              </div>
            </div>
            
            <div class="col-12 col-md-4">
              <div class="finance-card-premium">
                <div class="icon-box red">
                  <lucide-icon name="trending-down" size="24"></lucide-icon>
                </div>
                <div>
                  <p class="card-label">Despesas</p>
                  <h3 class="card-value expense">R$ {{ expense() | number:'1.0-0':'pt-BR' }}</h3>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="finance-card-premium">
                <div class="icon-box primary">
                  <lucide-icon name="dollar-sign" size="24"></lucide-icon>
                </div>
                <div>
                  <p class="card-label">Saldo Líquido</p>
                  <h3 class="card-value balance" [class.negative]="balance() < 0">
                    R$ {{ balance() | number:'1.0-0':'pt-BR' }}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Pie Chart -->
            <div class="col-12 col-lg-6">
              <div class="chart-card-premium">
                <h3 class="card-title mb-4">Balanço Financeiro</h3>
                <div class="chart-box">
                   <p-chart type="pie" [data]="chartData" [options]="chartOptions" height="100%"></p-chart>
                </div>
                <div class="d-flex justify-content-center gap-4 mt-4">
                   <div class="d-flex align-items-center gap-2">
                     <div class="legend-dot green"></div>
                     <span class="legend-text">Entradas</span>
                   </div>
                   <div class="d-flex align-items-center gap-2">
                     <div class="legend-dot red"></div>
                     <span class="legend-text">Saídas</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- Recent Transactions -->
            <div class="col-12 col-lg-6">
              <div class="list-card-premium">
                <h3 class="card-title mb-4">Últimas Transações</h3>
                <div class="transaction-list custom-scrollbar">
                  <div *ngFor="let t of transactions()" class="transaction-item d-flex justify-content-between align-items-center p-3 mb-2">
                    <div>
                      <p class="trans-desc mb-0">{{ t.description }}</p>
                      <p class="trans-date mb-0">{{ t.date | date:'dd/MM/yyyy' }}</p>
                    </div>
                    <span class="trans-amount" [class.income]="t.type === 'INCOME'" [class.expense]="t.type === 'EXPENSE'">
                      {{ t.type === 'INCOME' ? '+' : '-' }} R$ {{ t.amount | number:'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                  <div *ngIf="transactions().length === 0" class="empty-list text-center py-5">
                     Nenhuma transação encontrada para este período.
                  </div>
                </div>
              </div>
            </div>
          </div>
       </ng-container>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.9375rem; color: var(--text-color-secondary); }

    .finance-card-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    }

    .icon-box {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      &.green { background: #dcfce7; color: #16a34a; }
      &.red { background: #fee2e2; color: #ef4444; }
      &.primary { background: var(--primary-light); color: var(--primary-color); }
    }

    .card-label { font-size: 0.8125rem; font-weight: 700; color: var(--text-color-secondary); text-transform: uppercase; margin-bottom: 4px; }
    .card-value { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .card-value.income { color: #16a34a; }
    .card-value.expense { color: #ef4444; }
    .card-value.balance { color: var(--primary-color); }
    .card-value.balance.negative { color: #ef4444; }

    .chart-card-premium, .list-card-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      height: 100%;
    }

    .card-title { font-size: 1.125rem; font-weight: 700; color: var(--text-color); }
    .chart-box { height: 260px; }

    .legend-dot { width: 10px; height: 10px; border-radius: 50%; &.green { background: #10b981; } &.red { background: #ef4444; } }
    .legend-text { font-size: 0.8125rem; color: var(--text-color-secondary); font-weight: 600; }

    .transaction-list { max-height: 340px; overflow-y: auto; padding-right: 8px; }
    .transaction-item {
      background: var(--surface-hover); border-radius: 12px; transition: all 0.2s;
      &:hover { transform: translateX(4px); background: #fdf2f8; }
    }

    .trans-desc { font-weight: 700; font-size: 0.875rem; color: var(--text-color); }
    .trans-date { font-size: 0.75rem; color: var(--text-color-secondary); }
    .trans-amount { font-size: 0.9375rem; font-weight: 800; &.income { color: #16a34a; } &.expense { color: #ef4444; } }

    .empty-state-notice { text-align: center; padding: 4rem; color: var(--text-color-secondary); font-style: italic; }
    .empty-list { color: var(--text-color-tertiary); font-style: italic; font-size: 0.875rem; }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--stone-200); border-radius: 10px; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class FinancialComponent implements OnInit {
  private mockDb = inject(MockDbService);

  userRole = signal<string>(UserRole.ADMIN);
  transactions = signal<Transaction[]>([]);
  
  income = computed(() => this.transactions().filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0));
  expense = computed(() => this.transactions().filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0));
  balance = computed(() => this.income() - this.expense());

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.loadData();
    this.initChart();
  }

  async loadData() {
    // Mock user for now
    const user = { id: '1', role: UserRole.ADMIN } as any;
    const data = await this.mockDb.getTransactions(user);
    this.transactions.set(data);
    this.updateChartData();
  }

  updateChartData() {
    this.chartData = {
      labels: ['Entradas', 'Saídas'],
      datasets: [
        {
          data: [this.income(), this.expense()],
          backgroundColor: ['#10b981', '#ef4444'],
          hoverBackgroundColor: ['#059669', '#dc2626'],
          borderWidth: 0
        }
      ]
    };
  }

  initChart() {
    this.chartOptions = {
        plugins: {
            legend: { display: false }
        },
        cutout: '60%',
        maintainAspectRatio: false
    };
  }
}
