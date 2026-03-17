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
    <div class="products-wrapper animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="section-title mb-1">Serviços & Produtos</h2>
          <p class="section-subtitle mb-0">Catálogo de tratamentos disponíveis.</p>
        </div>
        <button *ngIf="canEdit()"
          (click)="isModalOpen.set(true)"
          class="btn btn-primary-premium d-flex align-items-center gap-2 px-4 py-2.5"
        >
          <lucide-icon name="plus" size="18"></lucide-icon>
          Novo Serviço
        </button>
      </div>

      <div class="row g-4">
        <div *ngFor="let product of products()" class="col-12 col-md-6 col-lg-4">
          <div class="product-card-premium h-100 d-flex flex-column p-4 shadow-sm border">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div class="product-icon-box d-flex align-items-center justify-content-center">
                <lucide-icon name="tag" size="24"></lucide-icon>
              </div>
              <div class="text-right">
                  <span class="product-price-label d-block text-end">R$ {{ product.price | number:'1.2-2':'pt-BR' }}</span>
                  <span *ngIf="canEdit()" class="product-cost-label d-block text-end">Custo: R$ {{ product.cost | number:'1.2-2' }}</span>
              </div>
            </div>
            
            <h3 class="product-title-premium mb-2">{{ product.name }}</h3>
            <p class="product-desc-premium mb-4 flex-grow-1">{{ product.description }}</p>
            
            <div class="product-footer pt-4 border-top d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2 product-duration-badge">
                  <lucide-icon name="clock" size="14"></lucide-icon>
                  <span>{{ product.durationMin }} min</span>
              </div>
              
              <div *ngIf="canEdit()" class="product-profit-badge d-flex align-items-center gap-1.5 px-2 py-1 rounded-2">
                  <lucide-icon name="trending-up" size="12"></lucide-icon>
                  Lucro: R$ {{ (product.price - product.cost) | number:'1.2-2' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Product Modal -->
      <div *ngIf="isModalOpen()" class="modal-backdrop-premium d-flex align-items-center justify-content-center p-3 vh-100" (click)="isModalOpen.set(false)">
          <div class="modal-card-premium animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header-premium bg-primary d-flex justify-content-between align-items-center p-4">
              <h3 class="mb-0 text-white font-weight-bold">Novo Serviço</h3>
              <button (click)="isModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleCreate($event)" class="p-4">
              <div class="mb-3">
                <label class="form-label-premium">Nome do Serviço</label>
                <input type="text" name="name" [(ngModel)]="newData.name" required class="form-control-premium" />
              </div>

              <div class="row g-3">
                 <div class="col-6">
                  <label class="form-label-premium">Preço Venda (R$)</label>
                  <input type="number" name="price" [(ngModel)]="newData.price" (ngModelChange)="sanitizeInput('price')" required class="form-control-premium" />
                </div>
                 <div class="col-6">
                  <label class="form-label-premium">Custo (R$)</label>
                  <input type="number" name="cost" [(ngModel)]="newData.cost" (ngModelChange)="sanitizeInput('cost')" required class="form-control-premium" placeholder="0.00" />
                </div>
              </div>

               <div class="my-3">
                  <label class="form-label-premium">Duração (min)</label>
                  <input type="number" name="dur" [(ngModel)]="newData.durationMin" (ngModelChange)="sanitizeInput('durationMin')" required class="form-control-premium" />
                </div>

              <div class="mb-4">
                <label class="form-label-premium">Descrição</label>
                <textarea name="desc" [(ngModel)]="newData.description" class="form-control-premium textarea-premium h-24 resize-none"></textarea>
              </div>

              <button type="submit" class="btn btn-primary-premium w-100 py-3">Salvar Serviço</button>
            </form>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.875rem; color: var(--text-color-secondary); }

    .btn-primary-premium {
      background: var(--grad-primary); border: 0; border-radius: 12px; color: white; font-weight: 700;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3); color: white; }
    }

    .product-card-premium {
      background: var(--surface-card); border-radius: 20px; border-color: var(--surface-border) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { transform: translateY(-5px); border-color: var(--primary-color) !important; box-shadow: var(--shadow-lg); }
    }

    .product-icon-box {
      width: 48px; height: 48px; background: var(--primary-light); color: var(--primary-color);
      border-radius: 14px; transition: all 0.3s;
      .product-card-premium:hover & { background: var(--primary-color); color: white; }
    }

    .product-price-label { font-size: 1.25rem; font-weight: 800; color: var(--text-color); }
    .product-cost-label { font-size: 0.75rem; color: var(--text-color-tertiary); }

    .product-title-premium { font-size: 1.125rem; font-weight: 800; color: var(--text-color); }
    .product-desc-premium { font-size: 0.875rem; color: var(--text-color-secondary); line-height: 1.5; min-height: 40px; }

    .product-duration-badge { font-size: 0.75rem; font-weight: 700; color: var(--text-color-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
    .product-profit-badge { background: #dcfce7; color: #16a34a; font-size: 0.75rem; font-weight: 700; }
    :host-context(.dark) .product-profit-badge { background: rgba(22, 163, 74, 0.1); color: #4ade80; }

    /* Modals */
    .modal-backdrop-premium { position: fixed; inset: 0; background: rgba(12, 10, 9, 0.4); backdrop-filter: blur(8px); z-index: 1100; }
    .modal-card-premium { background: var(--surface-card); width: 100%; max-width: 440px; border-radius: 1.5rem; overflow: hidden; box-shadow: var(--shadow-lg); }
    .btn-close-modal { opacity: 0.8; &:hover { opacity: 1; } }

    .form-label-premium { font-size: 0.8125rem; font-weight: 700; color: var(--text-color-secondary); margin-bottom: 6px; text-transform: uppercase; }
    .form-control-premium { border-radius: 12px; padding: 12px; border: 1px solid var(--surface-border); background: var(--surface-hover); color: var(--text-color); font-size: 0.9375rem; &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); outline: none; } }
    .textarea-premium { min-height: 100px; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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

  sanitizeInput(field: 'price' | 'cost' | 'durationMin') {
    const val = this.newData[field];
    if (val !== null && val !== undefined) {
      // Convert to number to remove leading zeros, but keep it as a number for the model
      this.newData[field] = Number(val);
    }
  }
}
