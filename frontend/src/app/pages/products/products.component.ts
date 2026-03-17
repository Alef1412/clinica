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
      <div *ngIf="isModalOpen()" class="modal-backdrop-premium d-flex align-items-center justify-content-center p-3" (click)="isModalOpen.set(false)">
        <div class="modal-card-premium animate-fade-in" (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="modal-header-premium d-flex justify-content-between align-items-center px-4 py-3">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon-box d-flex align-items-center justify-content-center">
                <lucide-icon name="package-plus" size="20"></lucide-icon>
              </div>
              <div>
                <h5 class="mb-0 modal-title-text">Novo Serviço</h5>
                <p class="mb-0 modal-subtitle-text">Preencha os dados do serviço</p>
              </div>
            </div>
            <button (click)="isModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent">
              <lucide-icon name="x" size="18"></lucide-icon>
            </button>
          </div>

          <div class="modal-divider"></div>

          <!-- Form Body -->
          <form (submit)="handleCreate($event)" class="px-4 pb-4 pt-3">

            <!-- Nome -->
            <div class="form-group-premium mb-3">
              <label class="form-label-premium">
                <lucide-icon name="tag" size="12" class="me-1"></lucide-icon>
                Nome do Serviço
              </label>
              <div class="input-wrapper-premium">
                <input type="text" name="name" [(ngModel)]="newData.name" required
                  class="form-control-premium" placeholder="Ex: Limpeza de Pele" />
              </div>
            </div>

            <!-- Preço + Custo -->
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label-premium">
                  <lucide-icon name="banknote" size="12" class="me-1"></lucide-icon>
                  Preço de Venda
                </label>
                <div class="money-input-wrapper">
                  <span class="money-prefix">R$</span>
                  <input type="number" name="price" [(ngModel)]="newData.price"
                    (ngModelChange)="sanitizeInput('price')" required
                    class="form-control-premium money-input" placeholder="0,00" min="0" step="0.01" />
                </div>
              </div>
              <div class="col-6">
                <label class="form-label-premium">
                  <lucide-icon name="receipt" size="12" class="me-1"></lucide-icon>
                  Custo
                </label>
                <div class="money-input-wrapper">
                  <span class="money-prefix">R$</span>
                  <input type="number" name="cost" [(ngModel)]="newData.cost"
                    (ngModelChange)="sanitizeInput('cost')" required
                    class="form-control-premium money-input" placeholder="0,00" min="0" step="0.01" />
                </div>
              </div>
            </div>

            <!-- Duração -->
            <div class="form-group-premium mb-3">
              <label class="form-label-premium">
                <lucide-icon name="clock" size="12" class="me-1"></lucide-icon>
                Duração
              </label>
              <div class="duration-input-wrapper">
                <input type="number" name="dur" [(ngModel)]="newData.durationMin"
                  (ngModelChange)="sanitizeInput('durationMin')" required
                  class="form-control-premium duration-input" placeholder="0" min="1" />
                <span class="duration-suffix">min</span>
              </div>
            </div>

            <!-- Descrição -->
            <div class="form-group-premium mb-4">
              <label class="form-label-premium">
                <lucide-icon name="file-text" size="12" class="me-1"></lucide-icon>
                Descrição
              </label>
              <textarea name="desc" [(ngModel)]="newData.description" rows="3"
                class="form-control-premium textarea-premium"
                placeholder="Descreva brevemente o serviço, indicações, etc."></textarea>
            </div>

            <!-- Margem em tempo real -->
            <div *ngIf="newData.price > 0 || newData.cost > 0" class="profit-preview mb-4 px-3 py-2 rounded-3 d-flex align-items-center justify-content-between">
              <span class="profit-label d-flex align-items-center gap-2">
                <lucide-icon name="trending-up" size="14"></lucide-icon>
                Margem de lucro
              </span>
              <span class="profit-value">R$ {{ (newData.price - newData.cost) | number:'1.2-2':'pt-BR' }}</span>
            </div>

            <button type="submit" class="btn btn-submit-premium w-100">
              <lucide-icon name="save" size="16" class="me-2"></lucide-icon>
              Salvar Serviço
            </button>
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

    /* ── Modal ───────────────────────────────────── */
    .modal-backdrop-premium {
      position: fixed; inset: 0; background: rgba(12, 10, 9, 0.55);
      backdrop-filter: blur(10px); z-index: 1100;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .modal-card-premium {
      background: var(--surface-card); width: 100%; max-width: 460px;
      border-radius: 1.75rem; overflow: hidden; box-shadow: var(--shadow-lg);
    }

    .modal-header-premium { background: var(--surface-card); padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
    .modal-icon-box {
      width: 44px; height: 44px; background: var(--primary-light); color: var(--primary-color);
      border-radius: 14px; flex-shrink: 0;
    }
    .modal-title-text { font-size: 1.0625rem; font-weight: 800; color: var(--text-color); }
    .modal-subtitle-text { font-size: 0.75rem; color: var(--text-color-secondary); }
    .modal-divider { height: 1px; background: var(--surface-border); }

    .btn-close-modal {
      width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: var(--text-color-secondary); transition: all 0.2s;
      &:hover { background: var(--surface-hover); color: var(--text-color); }
    }

    /* ── Labels & Groups ─────────────────────────── */
    .form-label-premium {
      font-size: 0.75rem; font-weight: 700; color: var(--text-color-secondary);
      text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;
      display: flex; align-items: center;
    }

    /* ── Base input ──────────────────────────────── */
    .form-control-premium {
      width: 100%; border-radius: 12px; padding: 10px 14px;
      border: 1.5px solid var(--surface-border); background: var(--surface-ground);
      color: var(--text-color); font-size: 0.9375rem; transition: all 0.2s;
      &::placeholder { color: var(--text-color-tertiary); }
      &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.12); outline: none; background: var(--surface-card); }
    }

    /* ── Monetary input ──────────────────────────── */
    .money-input-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .money-prefix {
      position: absolute; left: 12px; font-size: 0.875rem; font-weight: 700;
      color: var(--text-color-secondary); pointer-events: none; z-index: 1;
    }
    .money-input { padding-left: 36px !important; }

    /* ── Duration input ──────────────────────────── */
    .duration-input-wrapper { position: relative; display: flex; align-items: center; }
    .duration-input { padding-right: 44px !important; }
    .duration-suffix {
      position: absolute; right: 14px; font-size: 0.8rem; font-weight: 700;
      color: var(--text-color-secondary); pointer-events: none;
    }

    /* ── Textarea ────────────────────────────────── */
    .textarea-premium { min-height: 90px; resize: none; line-height: 1.6; }

    /* ── Profit preview ──────────────────────────── */
    .profit-preview {
      background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2);
    }
    :host-context(.dark) .profit-preview { background: rgba(22, 163, 74, 0.06); }
    .profit-label { font-size: 0.8rem; font-weight: 600; color: #16a34a; }
    .profit-value { font-size: 0.9rem; font-weight: 800; color: #16a34a; }

    /* ── Submit button ───────────────────────────── */
    .btn-submit-premium {
      background: var(--grad-primary); border: 0; border-radius: 14px; color: white;
      font-weight: 700; font-size: 0.9375rem; padding: 13px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(244, 63, 94, 0.25); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(244, 63, 94, 0.35); }
      &:active { transform: translateY(0); }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
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
