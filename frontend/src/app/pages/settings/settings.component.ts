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
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 class="text-2xl font-bold text-stone-800 dark:text-white">Configurações da Conta</h2>
        <p class="text-stone-500 dark:text-stone-400">Gerencie seus dados pessoais e preferências.</p>
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Sidebar Tabs -->
        <div class="w-full md:w-64 flex flex-col gap-2">
            <button 
                (click)="activeTab.set('PROFILE'); msg.set(null)"
                [class.active-tab]="activeTab() === 'PROFILE'"
                class="tab-btn"
            >
                <lucide-icon name="user" size="18"></lucide-icon> Meu Perfil
            </button>
            <button 
                (click)="activeTab.set('SECURITY'); msg.set(null)"
                [class.active-tab]="activeTab() === 'SECURITY'"
                class="tab-btn"
            >
                <lucide-icon name="lock" size="18"></lucide-icon> Segurança
            </button>
            <button *ngIf="userRole() !== 'PATIENT'"
                (click)="activeTab.set('NOTIFICATIONS'); msg.set(null)"
                [class.active-tab]="activeTab() === 'NOTIFICATIONS'"
                class="tab-btn"
            >
                <lucide-icon name="bell" size="18"></lucide-icon> Notificações
            </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
            <div *ngIf="msg()" class="mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium" 
                 [ngClass]="msg()?.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'">
                <lucide-icon [name]="msg()?.type === 'success' ? 'check' : 'alert-circle'" size="16"></lucide-icon>
                {{ msg()?.text }}
            </div>

            <!-- Profile Form -->
            <form *ngIf="activeTab() === 'PROFILE'" (submit)="handleProfileUpdate($event)" class="space-y-4 animate-fade-in">
                <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-4">Dados Pessoais</h3>
                
                <div>
                    <label class="form-label">Nome Completo</label>
                    <input type="text" name="name" [(ngModel)]="profileData.name" class="form-input" required />
                </div>
                <div>
                    <label class="form-label">E-mail</label>
                    <input type="email" name="email" [(ngModel)]="profileData.email" class="form-input" required />
                </div>
                <div>
                    <label class="form-label">WhatsApp / Telefone</label>
                    <input type="tel" name="phone" [(ngModel)]="profileData.phoneNumber" class="form-input" placeholder="(00) 00000-0000" />
                </div>

                <div class="pt-4">
                    <button type="submit" [disabled]="loading()" class="btn-primary animate-hover">
                        <lucide-icon name="save" size="18"></lucide-icon> Salvar Alterações
                    </button>
                </div>
            </form>

            <!-- Security Form -->
            <form *ngIf="activeTab() === 'SECURITY'" (submit)="handlePasswordUpdate($event)" class="space-y-4 animate-fade-in">
                <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-4">Alterar Senha</h3>
                
                <div>
                    <label class="form-label">Senha Atual</label>
                    <input type="password" name="curr" [(ngModel)]="passData.current" class="form-input" required />
                </div>
                <div>
                    <label class="form-label">Nova Senha</label>
                    <input type="password" name="new" [(ngModel)]="passData.new" class="form-input" required />
                </div>
                <div>
                    <label class="form-label">Confirmar Nova Senha</label>
                    <input type="password" name="conf" [(ngModel)]="passData.confirm" class="form-input" required />
                </div>

                <div class="pt-4">
                    <button type="submit" [disabled]="loading()" class="btn-dark animate-hover">
                        <lucide-icon name="lock" size="18"></lucide-icon> Atualizar Senha
                    </button>
                </div>
            </form>

            <!-- Notifications -->
            <div *ngIf="activeTab() === 'NOTIFICATIONS'" class="space-y-6 animate-fade-in">
                <h3 class="text-lg font-bold text-stone-800 dark:text-white mb-4">Automação de Mensagens</h3>
                
                <div class="flex items-start gap-4 p-4 border border-stone-100 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                    <div class="bg-green-100 text-green-600 p-2 rounded-lg">
                        <lucide-icon name="bell" size="24"></lucide-icon>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-stone-800 dark:text-white">Lembretes de Agendamento (WhatsApp)</h4>
                        <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
                            O sistema enviará automaticamente uma mensagem para o paciente 2 dias antes da consulta confirmada.
                        </p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" [(ngModel)]="whatsappEnabled" (change)="handleNotifUpdate()" />
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-primary { color: var(--primary-color); }
    .btn-primary { 
      background-color: var(--primary-color); color: white; border-radius: 0.75rem; 
      font-weight: 700; padding: 0.625rem 1.5rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
    }
    .btn-dark {
      background-color: #1c1917; color: white; border-radius: 0.75rem;
      font-weight: 700; padding: 0.625rem 1.5rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
    }
    :host-context(.dark) .btn-dark { background-color: white; color: #1c1917; }
    
    .tab-btn {
      width: 100%; text-align: left; padding: 0.75rem 1rem; border-radius: 0.75rem;
      font-weight: 500; font-size: 0.875rem; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem;
      background-color: white; color: #57534e;
    }
    :host-context(.dark) .tab-btn { background-color: #1c1917; color: #a8a29e; }
    .tab-btn:hover { background-color: #f5f5f4; }
    :host-context(.dark) .tab-btn:hover { background-color: #292524; }
    .active-tab { background-color: #fdf2f8 !important; color: #be185d !important; }
    :host-context(.dark) .active-tab { background-color: rgba(190, 24, 93, 0.1) !important; color: #f472b6 !important; }

    .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #44403c; margin-bottom: 0.25rem; }
    :host-context(.dark) .form-label { color: #d6d3d1; }
    .form-input { 
      width: 100%; border-radius: 0.75rem; border: 1px solid #e7e5e4; 
      background-color: #f5f5f4; padding: 0.75rem; outline: none; transition: all 0.2s;
    }
    :host-context(.dark) .form-input { background-color: #1c1917; border-color: #292524; color: white; }
    .form-input:focus { border-color: var(--primary-color); }

    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #e7e5e4; border-radius: 34px; transition: .4s;
    }
    .slider:before {
      position: absolute; content: ""; height: 20px; width: 20px; left: 2px; bottom: 2px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: #10b981; }
    input:checked + .slider:before { transform: translateX(20px); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    .animate-hover:hover { transform: scale(1.02); }
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
