import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { User, UserRole, AnamnesisStatus } from '../../models/types';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="patients-wrapper animate-fade-in">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-5">
        <div>
          <h2 class="section-title mb-1">
            {{ isAdmin() ? 'Gerenciar Usuários' : 'Pacientes' }}
          </h2>
          <p class="section-subtitle mb-0">
            {{ isAdmin() ? 'Controle total de pacientes e equipe.' : 'Gerencie a base de clientes da clínica.' }}
          </p>
        </div>
        
        <div class="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
             <!-- Admin View Toggle -->
            <div *ngIf="isAdmin()" class="role-toggle-group d-flex p-1">
                <button 
                    (click)="viewRole.set('PATIENTS')"
                    [class.active]="viewRole() === 'PATIENTS'"
                    class="btn-toggle-role"
                >
                    Pacientes
                </button>
                <button 
                     (click)="viewRole.set('PROFESSIONALS')"
                     [class.active]="viewRole() === 'PROFESSIONALS'"
                     class="btn-toggle-role"
                >
                    Equipe
                </button>
            </div>

            <div class="search-box-container position-relative flex-grow-1">
                <lucide-icon name="search" class="search-icon" size="18"></lucide-icon>
                <input 
                    type="text" 
                    [placeholder]="viewRole() === 'PATIENTS' ? 'Buscar paciente...' : 'Buscar profissional...'"
                    class="form-control search-input"
                    [(ngModel)]="searchTerm"
                />
            </div>
            
            <button *ngIf="viewRole() === 'PATIENTS'"
                (click)="isRegisterModalOpen.set(true)"
                class="btn btn-primary-premium d-flex align-items-center justify-content-center gap-2"
            >
                <lucide-icon name="plus" size="18"></lucide-icon>
                Novo Paciente
            </button>
            
            <button *ngIf="viewRole() === 'PROFESSIONALS' && isAdmin()"
                (click)="isMemberModalOpen.set(true)"
                class="btn btn-primary-premium d-flex align-items-center justify-content-center gap-2"
            >
                <lucide-icon name="plus" size="18"></lucide-icon>
                Novo Membro
            </button>
        </div>
      </div>

      <div class="row g-4">
        <div *ngFor="let listUser of filteredUsers()" class="col-12 col-md-6 col-lg-4">
          <div class="user-card-premium d-flex flex-column align-items-center text-center position-relative">
              
              <!-- Password Edit Button -->
              <button 
                  (click)="openPasswordModal(listUser)"
                  class="btn-change-password position-absolute"
                  title="Alterar Senha"
              >
                  <lucide-icon name="lock" size="16"></lucide-icon>
              </button>

              <div class="user-avatar-container mb-4 position-relative">
                <img *ngIf="listUser.avatar" [src]="listUser.avatar" [alt]="listUser.name" class="img-fluid rounded-circle" />
                <div *ngIf="!listUser.avatar" class="avatar-placeholder d-flex align-items-center justify-content-center">
                  <lucide-icon name="user" size="32"></lucide-icon>
                </div>
              </div>
              
              <h3 class="user-card-name d-flex align-items-center gap-2">
                  {{ listUser.name }}
                  <lucide-icon *ngIf="listUser.role === 'ADMIN'" name="shield" class="text-warning" size="14"></lucide-icon>
              </h3>
              
              <div class="user-card-email d-flex align-items-center gap-2 mb-4">
                <lucide-icon name="mail" size="14"></lucide-icon>
                <span>{{ listUser.email }}</span>
              </div>
              
              <!-- Action Buttons - Patients view -->
              <div *ngIf="viewRole() === 'PATIENTS'" class="w-100 pt-4 border-top d-flex gap-2">
                  <button *ngIf="listUser.anamnesisStatus === 'NONE'"
                      (click)="handleRequestAnamnesis(listUser.id)"
                      class="btn btn-light-premium flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      title="Solicitar Anamnese"
                  >
                      <lucide-icon name="send" size="16"></lucide-icon>
                      <span class="d-none d-sm-inline">Solicitar Ficha</span>
                      <span class="d-inline d-sm-none">Solicitar</span>
                  </button>
                  
                  <div *ngIf="listUser.anamnesisStatus === 'REQUESTED'"
                      class="status-pill-amber flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  >
                      <lucide-icon name="clock" size="16"></lucide-icon> (Pendente)
                  </div>
                  
                  <button *ngIf="listUser.anamnesisStatus === 'COMPLETED'"
                      (click)="handleViewAnamnesis(listUser.id)"
                      class="btn btn-primary-light flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  >
                      <lucide-icon name="file-text" size="16"></lucide-icon>
                      Ver Ficha
                  </button>
              </div>
              
              <!-- Role Badge - Professionals view -->
              <div *ngIf="viewRole() === 'PROFESSIONALS'" class="w-100 pt-4 border-top">
                  <span class="badge-role">
                      {{ listUser.role === 'ADMIN' ? 'Administrador' : 'Profissional' }}
                  </span>
              </div>
          </div>
        </div>
        
        <div *ngIf="filteredUsers().length === 0" class="col-12 text-center py-5 empty-users-text">
            Nenhum usuário encontrado.
        </div>
      </div>

       <!-- Modals -->
       <div *ngIf="isRegisterModalOpen() || isMemberModalOpen() || isPasswordModalOpen()" class="modal-backdrop-premium d-flex align-items-center justify-content-center p-3">
          
          <!-- Register Patient Modal -->
          <div *ngIf="isRegisterModalOpen()" class="modal-card-premium animate-fade-in">
            <div class="modal-header-premium bg-primary d-flex justify-content-between align-items-center p-4">
              <h3 class="mb-0 text-white font-weight-bold">Cadastrar Paciente</h3>
              <button (click)="isRegisterModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleRegisterPatient($event)" class="p-4">
              <div class="mb-3">
                <label class="form-label-premium">Nome Completo</label>
                <input type="text" name="newName" [(ngModel)]="newPatientData.name" required class="form-control-premium" />
              </div>
              <div class="mb-4">
                <label class="form-label-premium">E-mail</label>
                <input type="email" name="newEmail" [(ngModel)]="newPatientData.email" required class="form-control-premium" />
              </div>
              <button type="submit" class="btn btn-primary-premium w-100 py-3">Cadastrar</button>
            </form>
          </div>

          <!-- Member Modal -->
          <div *ngIf="isMemberModalOpen()" class="modal-card-premium animate-fade-in">
            <div class="modal-header-premium bg-primary d-flex justify-content-between align-items-center p-4">
              <h3 class="mb-0 text-white font-weight-bold">Cadastrar Membro</h3>
              <button (click)="isMemberModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleRegisterMember($event)" class="p-4">
              <div class="mb-3">
                <label class="form-label-premium">Nome Completo</label>
                <input type="text" name="mName" [(ngModel)]="newMemberData.name" required class="form-control-premium" />
              </div>
              <div class="mb-3">
                <label class="form-label-premium">E-mail</label>
                <input type="email" name="mEmail" [(ngModel)]="newMemberData.email" required class="form-control-premium" />
              </div>
              <div class="mb-4">
                <label class="form-label-premium">Perfil</label>
                <select name="mRole" [(ngModel)]="newMemberData.role" class="form-select-premium">
                  <option [value]="UserRole.PROFESSIONAL">Profissional</option>
                  <option [value]="UserRole.ADMIN">Administrador</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary-premium w-100 py-3">Cadastrar Membro</button>
            </form>
          </div>

          <!-- Password Modal -->
          <div *ngIf="isPasswordModalOpen()" class="modal-card-premium animate-fade-in">
            <div class="modal-header-premium bg-dark d-flex justify-content-between align-items-center p-4">
              <h3 class="mb-0 text-white font-weight-bold d-flex align-items-center gap-2">
                <lucide-icon name="lock" size="18"></lucide-icon> Senha
              </h3>
              <button (click)="isPasswordModalOpen.set(false)" class="btn-close-modal border-0 bg-transparent text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleUpdatePassword($event)" class="p-4">
              <div class="user-details-tip mb-3 p-3 rounded-lg text-sm">
                  Alterando senha para: <strong>{{ selectedUser()?.name }}</strong>
              </div>
              <div class="mb-4">
                <label class="form-label-premium">Nova Senha</label>
                <input type="password" name="newPass" [(ngModel)]="newPassword" required placeholder="Digite a nova senha" class="form-control-premium" />
              </div>
              <button type="submit" class="btn btn-dark w-100 py-3 rounded-xl font-weight-bold">Salvar Senha</button>
            </form>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.9375rem; color: var(--text-color-secondary); }

    .role-toggle-group {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      gap: 4px;
    }

    .btn-toggle-role {
      border: 0;
      background: transparent;
      padding: 6px 16px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color-secondary);
      transition: all 0.2s;
      &.active { background: var(--primary-light); color: var(--primary-color); }
      &:hover:not(.active) { color: var(--text-color); }
    }

    .search-input {
      border-radius: 14px;
      padding: 10px 12px 10px 40px;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      color: var(--text-color);
      box-shadow: var(--shadow-sm);
      &:focus { box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); border-color: var(--primary-color); }
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-color-secondary);
    }

    .btn-primary-premium {
      background: var(--grad-primary);
      color: white;
      border: 0;
      border-radius: 14px;
      padding: 10px 20px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3); color: white; }
    }

    .user-card-premium {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      &:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
    }

    .user-avatar-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      padding: 4px;
      background: var(--grad-primary);
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid var(--surface-card); }
    }

    .avatar-placeholder {
      width: 100%; height: 100%; border-radius: 50%; 
      background: var(--surface-hover); color: var(--text-color-secondary);
      border: 3px solid var(--surface-card);
    }

    .user-card-name { font-size: 1.125rem; font-weight: 800; color: var(--text-color); margin-bottom: 4px; }
    .user-card-email { font-size: 0.875rem; color: var(--text-color-secondary); }

    .btn-change-password {
      top: 16px; right: 16px; border: 0; background: transparent; color: var(--stone-300);
      transition: color 0.2s;
      &:hover { color: var(--primary-color); }
    }

    .btn-light-premium {
      background: var(--surface-hover);
      border: 0; border-radius: 12px; padding: 10px;
      color: var(--text-color); font-weight: 600; font-size: 0.875rem;
      &:hover { background: var(--stone-200); }
    }

    .btn-primary-light {
      background: var(--primary-light);
      border: 0; border-radius: 12px; padding: 10px;
      color: var(--primary-color); font-weight: 600; font-size: 0.875rem;
      &:hover { background: #ffe4e6; }
    }

    .status-pill-amber {
      background: #fffbeb; color: #d97706; border: 1px solid #fde68a;
      border-radius: 12px; padding: 10px; font-size: 0.875rem; font-weight: 600;
    }

    .badge-role {
      background: var(--surface-hover); color: var(--text-color-secondary);
      padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700;
    }

    /* Modal Styles Re-defined */
    .modal-backdrop-premium {
      position: fixed; inset: 0; background: rgba(12, 10, 9, 0.4); backdrop-filter: blur(8px); z-index: 1100;
    }

    .modal-card-premium {
      background: var(--surface-card); width: 100%; max-width: 440px; border-radius: 1.5rem; overflow: hidden; box-shadow: var(--shadow-lg);
    }

    .form-label-premium { font-size: 0.875rem; font-weight: 700; color: var(--text-color); margin-bottom: 6px; }
    .form-control-premium, .form-select-premium {
      border-radius: 12px; padding: 12px; border: 1px solid var(--surface-border); background: var(--surface-hover);
      color: var(--text-color); font-size: 0.9375rem;
      &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); outline: none; }
    }

    .user-details-tip { background: var(--surface-hover); border: 1px solid var(--surface-border); color: var(--text-color-secondary); }
    .empty-users-text { color: var(--text-color-tertiary); font-style: italic; }
  `]
})
export class PatientsComponent implements OnInit {
  private mockDb = inject(MockDbService);
  private router = inject(Router);

  UserRole = UserRole;
  currentUser = signal<any>(null);
  usersList = signal<User[]>([]);
  searchTerm = '';
  viewRole = signal<'PATIENTS' | 'PROFESSIONALS'>('PATIENTS');
  
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  // Modals
  isRegisterModalOpen = signal(false);
  isMemberModalOpen = signal(false);
  isPasswordModalOpen = signal(false);
  
  newPatientData = { name: '', email: '' };
  newMemberData = { name: '', email: '', role: UserRole.PROFESSIONAL };
  selectedUser = signal<User | null>(null);
  newPassword = '';

  ngOnInit() {
    this.currentUser.set({
      id: '1',
      name: 'Ana Silva',
      role: UserRole.ADMIN
    });
    this.loadData();
  }

  async loadData() {
    if (this.viewRole() === 'PATIENTS') {
      const data = await this.mockDb.getPatients();
      this.usersList.set(data);
    } else {
      const data = await this.mockDb.getProfessionals();
      this.usersList.set(data);
    }
  }

  filteredUsers = computed(() => {
    const list = this.usersList();
    const term = this.searchTerm.toLowerCase();
    return list.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    );
  });

  async handleRegisterPatient(e: Event) {
    e.preventDefault();
    if (this.newPatientData.name && this.newPatientData.email) {
      await this.mockDb.createPatient(this.newPatientData.name, this.newPatientData.email);
      this.isRegisterModalOpen.set(false);
      this.newPatientData = { name: '', email: '' };
      this.loadData();
    }
  }

  async handleRegisterMember(e: Event) {
    e.preventDefault();
    if (this.newMemberData.name && this.newMemberData.email) {
      await this.mockDb.createProfessional(this.newMemberData.name, this.newMemberData.email, this.newMemberData.role);
      this.isMemberModalOpen.set(false);
      this.newMemberData = { name: '', email: '', role: UserRole.PROFESSIONAL };
      this.loadData();
    }
  }

  async handleRequestAnamnesis(patientId: string) {
    await this.mockDb.requestAnamnesis(patientId);
    this.loadData();
  }

  handleViewAnamnesis(patientId: string) {
    this.router.navigate([`/anamnesis/${patientId}`]);
  }

  openPasswordModal(targetUser: User) {
    this.selectedUser.set(targetUser);
    this.newPassword = '';
    this.isPasswordModalOpen.set(true);
  }

  async handleUpdatePassword(e: Event) {
    e.preventDefault();
    const user = this.selectedUser();
    if (user && this.newPassword) {
      await this.mockDb.updateUserPassword(user.id, this.newPassword);
      this.isPasswordModalOpen.set(false);
      alert(`Senha alterada com sucesso para ${user.name}`);
    }
  }
}
