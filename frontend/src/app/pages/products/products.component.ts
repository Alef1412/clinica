import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, Product } from '../../models/types';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-stone-800 dark:text-white">Serviços & Produtos</h2>
          <p class="text-stone-500 dark:text-stone-400">Catálogo de tratamentos disponíveis.</p>
        </div>
        <button *ngIf="canEdit()"
          (click)="isModalOpen.set(true)"
          class="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all"
        >
          <lucide-icon name="plus" size="18"></lucide-icon>
          Novo Serviço
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let product of products()" class="product-card group">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition">
              <lucide-icon name="tag" size="24"></lucide-icon>
            </div>
            <div class="text-right">
                <span class="font-bold text-lg text-stone-800 dark:text-white block">R$ {{ product.price | number:'1.2-2':'pt-BR' }}</span>
                <span *ngIf="canEdit()" class="text-xs text-stone-400 dark:text-stone-500 block">Custo: R$ {{ product.cost | number:'1.2-2' }}</span>
            </div>
          </div>
          
          <h3 class="font-bold text-lg text-stone-800 dark:text-white mb-2">{{ product.name }}</h3>
          <p class="text-stone-500 dark:text-stone-400 text-sm mb-4 min-h-[40px] flex-1">{{ product.description }}</p>
          
          <div class="pt-4 border-t border-stone-50 dark:border-stone-800 flex items-center justify-between">
            <div class="flex items-center gap-2 text-stone-400 text-xs font-medium uppercase tracking-wider">
                <lucide-icon name="clock" size="14"></lucide-icon>
                <span>{{ product.durationMin }} min</span>
            </div>
            
            <div *ngIf="canEdit()" class="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                <lucide-icon name="trending-up" size="12"></lucide-icon>
                Lucro: R$ {{ (product.price - product.cost) | number:'1.2-2' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Create Product Modal -->
      <div *ngIf="isModalOpen()" class="modal-backdrop" (click)="isModalOpen.set(false)">
          <div class="modal-container max-w-md" (click)="$event.stopPropagation()">
            <div class="modal-header bg-primary">
              <h3 class="text-white font-bold text-lg">Novo Serviço</h3>
              <button (click)="isModalOpen.set(false)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleCreate($event)" class="p-6 space-y-4">
              <div>
                <label class="modal-label">Nome do Serviço</label>
                <input type="text" name="name" [(ngModel)]="newData.name" required class="modal-input" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                 <div>
                  <label class="modal-label">Preço Venda (R$)</label>
                  <input type="number" name="price" [(ngModel)]="newData.price" required class="modal-input" />
                </div>
                 <div>
                  <label class="modal-label">Custo (R$)</label>
                  <input type="number" name="cost" [(ngModel)]="newData.cost" required class="modal-input" placeholder="0.00" />
                </div>
              </div>

               <div>
                  <label class="modal-label">Duração (min)</label>
                  <input type="number" name="dur" [(ngModel)]="newData.durationMin" required class="modal-input" />
                </div>

              <div>
                <label class="modal-label">Descrição</label>
                <textarea name="desc" [(ngModel)]="newData.description" class="modal-input h-24 resize-none"></textarea>
              </div>

              <div class="pt-4">
                <button type="submit" class="modal-submit bg-primary">Salvar Serviço</button>
              </div>
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
    
    .product-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #f5f5f4;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
    }
    :host-context(.dark) .product-card { background-color: #1c1917; border-color: #292524; }
    .product-card:hover { border-color: var(--primary-color); }

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
    :host-context(.dark) .modal-label { color: #d6d3d1; }
    .modal-input { width: 100%; border-radius: 0.75rem; border: 1px solid #e7e5e4; background-color: #f5f5f4; padding: 0.625rem; outline: none; }
    :host-context(.dark) .modal-input { background-color: #1c1917; border-color: #292524; color: white; }
    .modal-submit { width: 100%; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.75rem; transition: all 0.2s; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class ProductsComponent implements OnInit {
  private mockDb = inject(MockDbService);

  currentUserRole = signal<string>(UserRole.ADMIN);
  products = signal<Product[]>([]);
  isModalOpen = signal(false);
  
  newData = {
    name: '',
    price: 0,
    cost: 0,
    durationMin: 0,
    description: ''
  };

  canEdit = computed(() => this.currentUserRole() === UserRole.ADMIN || this.currentUserRole() === UserRole.PROFESSIONAL);

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.products.set(await this.mockDb.getProducts());
  }

  async handleCreate(e: Event) {
    e.preventDefault();
    if (!this.newData.name || !this.newData.price) return;

    await this.mockDb.createProduct({
      name: this.newData.name,
      price: this.newData.price,
      cost: this.newData.cost,
      durationMin: this.newData.durationMin,
      description: this.newData.description
    });

    this.isModalOpen.set(false);
    this.newData = { name: '', price: 0, cost: 0, durationMin: 0, description: '' };
    this.loadProducts();
  }
}
