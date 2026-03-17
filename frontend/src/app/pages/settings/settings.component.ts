import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { User, UserRole } from '../../models/types';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="settings-wrapper mx-auto animate-fade-in">
      <div class="mb-4">
        <h2 class="section-title mb-1">Configurações da Conta</h2>
        <p class="section-subtitle mb-0">Gerencie seus dados pessoais e preferências.</p>
      </div>

      <div class="row g-4">
        <!-- Sidebar Tabs -->
        <div class="col-12 col-md-4 col-lg-3">
            <div class="settings-sidebar d-flex flex-column gap-2">
                <button 
                    (click)="activeTab.set('PROFILE'); msg.set(null)"
                    class="btn-tab-settings d-flex align-items-center gap-3 w-100 border-0"
                    [class.active]="activeTab() === 'PROFILE'"
                >
                    <lucide-icon name="user" size="18"></lucide-icon> Meu Perfil
                </button>
                <button 
                    (click)="activeTab.set('SECURITY'); msg.set(null)"
                    class="btn-tab-settings d-flex align-items-center gap-3 w-100 border-0"
                    [class.active]="activeTab() === 'SECURITY'"
                >
                    <lucide-icon name="lock" size="18"></lucide-icon> Segurança
                </button>
                <button *ngIf="userRole() !== 'PATIENT'"
                    (click)="activeTab.set('NOTIFICATIONS'); msg.set(null)"
                    class="btn-tab-settings d-flex align-items-center gap-3 w-100 border-0"
                    [class.active]="activeTab() === 'NOTIFICATIONS'"
                >
                    <lucide-icon name="bell" size="18"></lucide-icon> Notificações
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="col-12 col-md-8 col-lg-9">
            <div class="settings-content shadow-sm p-4 p-md-5">
                <div *ngIf="msg()" class="alert-premium mb-4 d-flex align-items-center gap-2" 
                     [ngClass]="msg()?.type === 'success' ? 'success' : 'error'">
                    <lucide-icon [name]="msg()?.type === 'success' ? 'check' : 'alert-circle'" size="16"></lucide-icon>
                    {{ msg()?.text }}
                </div>

                <!-- Profile Form -->
                <form *ngIf="activeTab() === 'PROFILE'" (submit)="handleProfileUpdate($event)" class="animate-fade-in">
                    <h3 class="settings-form-title mb-4">Dados Pessoais</h3>
                    
                    <div class="mb-3">
                        <label class="form-label-premium">Nome Completo</label>
                        <input type="text" name="name" [(ngModel)]="profileData.name" class="form-control-premium" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label-premium">E-mail</label>
                        <input type="email" name="email" [(ngModel)]="profileData.email" class="form-control-premium" required />
                    </div>
                    <div class="mb-4">
                        <label class="form-label-premium">WhatsApp / Telefone</label>
                        <input type="tel" name="phone" [(ngModel)]="profileData.phoneNumber" class="form-control-premium" placeholder="(00) 00000-0000" />
                    </div>

                    <div class="pt-2">
                        <button type="submit" [disabled]="loading()" class="btn btn-primary-premium d-flex align-items-center gap-2 px-4 py-2.5">
                            <lucide-icon name="save" size="18"></lucide-icon> Salvar Alterações
                        </button>
                    </div>
                </form>

                <!-- Security Form -->
                <form *ngIf="activeTab() === 'SECURITY'" (submit)="handlePasswordUpdate($event)" class="animate-fade-in">
                    <h3 class="settings-form-title mb-4">Alterar Senha</h3>
                    
                    <div class="mb-3">
                        <label class="form-label-premium">Senha Atual</label>
                        <input type="password" name="curr" [(ngModel)]="passData.current" class="form-control-premium" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label-premium">Nova Senha</label>
                        <input type="password" name="new" [(ngModel)]="passData.new" class="form-control-premium" required />
                    </div>
                    <div class="mb-4">
                        <label class="form-label-premium">Confirmar Nova Senha</label>
                        <input type="password" name="conf" [(ngModel)]="passData.confirm" class="form-control-premium" required />
                    </div>

                    <div class="pt-2">
                        <button type="submit" [disabled]="loading()" class="btn btn-dark-premium d-flex align-items-center gap-2 px-4 py-2.5">
                            <lucide-icon name="lock" size="18"></lucide-icon> Atualizar Senha
                        </button>
                    </div>
                </form>

                <!-- Notifications -->
                <div *ngIf="activeTab() === 'NOTIFICATIONS'" class="animate-fade-in">
                    <h3 class="settings-form-title mb-4">Automação de Mensagens</h3>
                    
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="icon-box-success p-2 rounded-3">
                            <lucide-icon name="bell" size="24"></lucide-icon>
                        </div>
                        <div class="flex-grow-1">
                            <h4 class="notification-title mb-1">Lembretes de Agendamento (WhatsApp)</h4>
                            <p class="notification-desc mb-0">
                                O sistema enviará automaticamente uma mensagem para o paciente 2 dias antes da consulta confirmada.
                            </p>
                        </div>
                        <div class="form-check form-switch-premium">
                            <input class="form-check-input" type="checkbox" role="switch" [(ngModel)]="whatsappEnabled" (change)="handleNotifUpdate()">
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.875rem; color: var(--text-color-secondary); }

    .btn-tab-settings {
      text-align: left; padding: 12px 16px; border-radius: 12px;
      font-weight: 700; font-size: 0.875rem; transition: all 0.2s;
      background: var(--surface-card); color: var(--text-color-secondary);
      &:hover { background: var(--surface-hover); color: var(--text-color); }
      &.active { background: #fdf2f8; color: var(--primary-color); }
    }
    :host-context(.dark) .btn-tab-settings.active { background: rgba(190, 24, 93, 0.1); color: #f472b6; }

    .settings-content {
      background: var(--surface-card); border-radius: 20px;
      border: 1px solid var(--surface-border);
    }

    .settings-form-title { font-size: 1.125rem; font-weight: 800; color: var(--text-color); }
    
    .alert-premium {
      padding: 12px 16px; border-radius: 12px; font-size: 0.8125rem; font-weight: 600;
      &.success { background: #f0fdf4; border: 1px solid #dcfce7; color: #16a34a; }
      &.error { background: #fef2f2; border: 1px solid #fee2e2; color: #ef4444; }
    }

    .btn-primary-premium {
      background: var(--grad-primary); border: 0; border-radius: 12px; color: white; font-weight: 700;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3); color: white; }
    }

    .btn-dark-premium {
      background: #1c1917; border: 0; border-radius: 12px; color: white; font-weight: 700;
      transition: all 0.2s; &:hover { background: #292524; transform: translateY(-2px); color: white; }
    }
    :host-context(.dark) .btn-dark-premium { background: white; color: #1c1917; &:hover { background: #e7e5e4; } }

    .notification-card {
      background: var(--surface-hover); border: 1px solid var(--surface-border); border-radius: 16px;
    }
    .icon-box-success { background: #dcfce7; color: #16a34a; }
    .notification-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-color); }
    .notification-desc { font-size: 0.8125rem; color: var(--text-color-secondary); line-height: 1.4; }

    .form-switch-premium .form-check-input {
      width: 44px; height: 24px; cursor: pointer;
      &:checked { background-color: #22c55e; border-color: #22c55e; }
      &:focus { border-color: #22c55e; outline: 0; box-shadow: 0 0 0 0.25rem rgba(34, 197, 94, 0.1); }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class SettingsComponent implements OnInit {
  private mockDb = inject(MockDbService);

  activeTab = signal<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
  loading = signal(false);
  userRole = signal<string>(UserRole.ADMIN);
  msg = signal<{type: 'success' | 'error', text: string} | null>(null);

  profileData = { id: '1', name: 'Ana Silva', email: 'ana@lumina.com', phoneNumber: '' };
  passData = { current: '', new: '', confirm: '' };
  whatsappEnabled = false;

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    // Mock user load
    this.profileData = { id: '1', name: 'Ana Silva', email: 'ana@lumina.com', phoneNumber: '(11) 98765-4321' };
    this.whatsappEnabled = true;
  }

  async handleProfileUpdate(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.msg.set(null);
    try {
        await this.mockDb.updateUserProfile(this.profileData.id, this.profileData);
        this.msg.set({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (e) {
        this.msg.set({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
        this.loading.set(false);
    }
  }

  async handlePasswordUpdate(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.msg.set(null);

    if (this.passData.new !== this.passData.confirm) {
        this.msg.set({ type: 'error', text: 'As novas senhas não coincidem.' });
        this.loading.set(false);
        return;
    }

    await this.mockDb.updateUserPassword(this.profileData.id, this.passData.new);
    this.msg.set({ type: 'success', text: 'Senha alterada com sucesso!' });
    this.loading.set(false);
    this.passData = { current: '', new: '', confirm: '' };
  }

  async handleNotifUpdate() {
      this.loading.set(true);
      await this.mockDb.updateUserProfile(this.profileData.id, { whatsappEnabled: this.whatsappEnabled } as any);
      this.msg.set({ type: 'success', text: 'Configurações de notificação salvas.' });
      this.loading.set(false);
  }
}
