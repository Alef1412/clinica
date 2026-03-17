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
    <div class="space-y-8 animate-fade-in">
       <div *ngIf="userRole() === 'PATIENT'" class="text-center p-10 text-stone-500 dark:text-stone-400">
          Acesso negado.
       </div>

       <ng-container *ngIf="userRole() !== 'PATIENT'">
          <div>
             <h2 class="text-2xl font-bold text-stone-800 dark:text-white">Financeiro</h2>
             <p class="text-stone-500 dark:text-stone-400">Controle de caixa e relatórios.</p>
           </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="finance-card">
              <div class="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <lucide-icon name="trending-up" size="24"></lucide-icon>
              </div>
              <div>
                <p class="finance-card-label">Receitas</p>
                <h3 class="finance-card-value text-stone-800 dark:text-white">R$ {{ income() | number:'1.0-0':'pt-BR' }}</h3>
              </div>
            </div>
            
            <div class="finance-card">
               <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <lucide-icon name="trending-down" size="24"></lucide-icon>
              </div>
              <div>
                <p class="finance-card-label">Despesas</p>
                <h3 class="finance-card-value text-stone-800 dark:text-white">R$ {{ expense() | number:'1.0-0':'pt-BR' }}</h3>
              </div>
            </div>

            <div class="finance-card">
               <div class="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                <lucide-icon name="dollar-sign" size="24"></lucide-icon>
              </div>
              <div>
                <p class="finance-card-label">Saldo Líquido</p>
                <h3 class="finance-card-value" [ngClass]="balance() >= 0 ? 'text-primary' : 'text-red-500'">
                  R$ {{ balance() | number:'1.0-0':'pt-BR' }}
                </h3>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Pie Chart -->
            <div class="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
              <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-6">Balanço Financeiro</h3>
              <div class="h-64 flex justify-center">
                 <p-chart type="pie" [data]="chartData" [options]="chartOptions" height="100%"></p-chart>
              </div>
              <div class="flex justify-center gap-6 mt-4">
                 <div class="flex items-center gap-2">
                   <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                   <span class="text-sm text-stone-600 dark:text-stone-400">Entradas</span>
                 </div>
                 <div class="flex items-center gap-2">
                   <div class="w-3 h-3 rounded-full bg-red-500"></div>
                   <span class="text-sm text-stone-600 dark:text-stone-400">Saídas</span>
                 </div>
              </div>
            </div>

            <!-- Recent Transactions -->
            <div class="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
              <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-6">Últimas Transações</h3>
              <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div *ngFor="let t of transactions()" class="flex justify-between items-center p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition">
                  <div>
                    <p class="font-medium text-stone-800 dark:text-stone-200 text-sm">{{ t.description }}</p>
                    <p class="text-xs text-stone-400">{{ t.date | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <span class="text-sm font-bold" [ngClass]="t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'">
                    {{ t.type === 'INCOME' ? '+' : '-' }} R$ {{ t.amount | number:'1.0-0':'pt-BR' }}
                  </span>
                </div>
                <div *ngIf="transactions().length === 0" class="text-center text-stone-400 py-10">
                   Nenhuma transação encontrada.
                </div>
              </div>
            </div>
          </div>
       </ng-container>
    </div>
  `,
  styles: [`
    .text-primary { color: var(--primary-color); }
    .bg-primary-100 { background-color: #fdf2f8; }
    
    .finance-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #f5f5f4;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    :host-context(.dark) .finance-card { background-color: #1c1917; border-color: #292524; }
    
    .finance-card-label { font-size: 0.875rem; font-weight: 500; color: #78716c; }
    .finance-card-value { font-size: 1.5rem; font-weight: 700; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
    :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #44403c; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
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
