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
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-stone-800 dark:text-white">
            {{ isAdmin() ? 'Gerenciar Usuários' : 'Pacientes' }}
          </h2>
          <p class="text-stone-500 dark:text-stone-400">
            {{ isAdmin() ? 'Controle total de pacientes e equipe.' : 'Gerencie a base de clientes da clínica.' }}
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <!-- Admin View Toggle -->
            <div *ngIf="isAdmin()" class="flex bg-white dark:bg-stone-900 rounded-xl p-1 border border-stone-200 dark:border-stone-800">
                <button 
                    (click)="viewRole.set('PATIENTS')"
                    [class.bg-primary-100]="viewRole() === 'PATIENTS'"
                    [class.text-primary-700]="viewRole() === 'PATIENTS'"
                    class="px-4 py-1.5 rounded-lg text-sm font-medium transition text-stone-500 hover:text-stone-700"
                >
                    Pacientes
                </button>
                <button 
                     (click)="viewRole.set('PROFESSIONALS')"
                     [class.bg-primary-100]="viewRole() === 'PROFESSIONALS'"
                     [class.text-primary-700]="viewRole() === 'PROFESSIONALS'"
                     class="px-4 py-1.5 rounded-lg text-sm font-medium transition text-stone-500 hover:text-stone-700"
                >
                    Equipe
                </button>
            </div>

            <div class="relative w-full">
                <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                <input 
                    type="text" 
                    [placeholder]="viewRole() === 'PATIENTS' ? 'Buscar paciente...' : 'Buscar profissional...'"
                    class="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    [(ngModel)]="searchTerm"
                />
            </div>
            
            <button *ngIf="viewRole() === 'PATIENTS'"
                (click)="isRegisterModalOpen.set(true)"
                class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
                <lucide-icon name="plus" size="18"></lucide-icon>
                Novo Paciente
            </button>
            
            <button *ngIf="viewRole() === 'PROFESSIONALS' && isAdmin()"
                (click)="isMemberModalOpen.set(true)"
                class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
                <lucide-icon name="plus" size="18"></lucide-icon>
                Novo Membro
            </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let listUser of filteredUsers()" class="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center text-center transition hover:shadow-md relative group">
            
            <!-- Password Edit Button -->
            <button 
                (click)="openPasswordModal(listUser)"
                class="absolute top-4 right-4 text-stone-300 hover:text-primary dark:text-stone-600 dark:hover:text-primary transition"
                title="Alterar Senha"
            >
                <lucide-icon name="lock" size="16"></lucide-icon>
            </button>

            <div class="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 mb-4 overflow-hidden border-4 border-primary-50 dark:border-stone-800 relative">
              <img *ngIf="listUser.avatar" [src]="listUser.avatar" [alt]="listUser.name" class="w-full h-full object-cover" />
              <div *ngIf="!listUser.avatar" class="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-600">
                <lucide-icon name="user" size="32"></lucide-icon>
              </div>
            </div>
            
            <h3 class="font-bold text-lg text-stone-800 dark:text-white flex items-center gap-2">
                {{ listUser.name }}
                <lucide-icon *ngIf="listUser.role === 'ADMIN'" name="shield" class="text-amber-500" size="14"></lucide-icon>
            </h3>
            
            <div class="flex items-center gap-2 text-stone-500 dark:text-stone-400 mt-1 mb-4 text-sm">
              <lucide-icon name="mail" size="14"></lucide-icon>
              <span>{{ listUser.email }}</span>
            </div>
            
            <!-- Action Buttons - Patients view -->
            <div *ngIf="viewRole() === 'PATIENTS'" class="w-full pt-4 border-t border-stone-50 dark:border-stone-800 flex gap-2">
                <button *ngIf="listUser.anamnesisStatus === 'NONE'"
                    (click)="handleRequestAnamnesis(listUser.id)"
                    class="flex-1 flex items-center justify-center gap-2 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium py-2 rounded-lg transition text-sm"
                    title="Solicitar Anamnese"
                >
                    <lucide-icon name="send" size="16"></lucide-icon>
                    Solicitar Ficha
                </button>
                
                <div *ngIf="listUser.anamnesisStatus === 'REQUESTED'"
                    class="flex-1 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium py-2 rounded-lg text-sm border border-amber-100 dark:border-amber-900/30"
                >
                    <lucide-icon name="clock" size="16"></lucide-icon> (Pendente)
                </div>
                
                <button *ngIf="listUser.anamnesisStatus === 'COMPLETED'"
                    (click)="handleViewAnamnesis(listUser.id)"
                    class="flex-1 flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium py-2 rounded-lg transition text-sm"
                >
                    <lucide-icon name="file-text" size="16"></lucide-icon>
                    Ver Ficha
                </button>
            </div>
            
            <!-- Role Badge - Professionals view -->
            <div *ngIf="viewRole() === 'PROFESSIONALS'" class="w-full pt-4 border-t border-stone-50 dark:border-stone-800">
                <span class="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-full">
                    {{ listUser.role === 'ADMIN' ? 'Administrador' : 'Profissional' }}
                </span>
            </div>
        </div>
        
        <div *ngIf="filteredUsers().length === 0" class="col-span-full text-center py-10 text-stone-400 dark:text-stone-600">
            Nenhum usuário encontrado.
        </div>
      </div>

       <!-- Register Patient Modal -->
       <div *ngIf="isRegisterModalOpen()" class="modal-backdrop">
          <div class="modal-container">
            <div class="modal-header bg-primary">
              <h3 class="text-white font-bold text-lg">Cadastrar Paciente</h3>
              <button (click)="isRegisterModalOpen.set(false)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleRegisterPatient($event)" class="p-6 space-y-4">
              <div>
                <label class="modal-label">Nome Completo</label>
                <input type="text" name="newName" [(ngModel)]="newPatientData.name" required class="modal-input" />
              </div>
              <div>
                <label class="modal-label">E-mail</label>
                <input type="email" name="newEmail" [(ngModel)]="newPatientData.email" required class="modal-input" />
              </div>
              <div class="pt-4">
                <button type="submit" class="modal-submit bg-primary">Cadastrar</button>
              </div>
            </form>
          </div>
       </div>

      <!-- Member Modal -->
      <div *ngIf="isMemberModalOpen()" class="modal-backdrop">
          <div class="modal-container">
            <div class="modal-header bg-primary">
              <h3 class="text-white font-bold text-lg">Cadastrar Membro na Equipe</h3>
              <button (click)="isMemberModalOpen.set(false)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleRegisterMember($event)" class="p-6 space-y-4">
              <div>
                <label class="modal-label">Nome Completo</label>
                <input type="text" name="mName" [(ngModel)]="newMemberData.name" required class="modal-input" />
              </div>
              <div>
                <label class="modal-label">E-mail</label>
                <input type="email" name="mEmail" [(ngModel)]="newMemberData.email" required class="modal-input" />
              </div>
              <div>
                <label class="modal-label">Perfil</label>
                <select name="mRole" [(ngModel)]="newMemberData.role" class="modal-input">
                  <option [value]="UserRole.PROFESSIONAL">Profissional</option>
                  <option [value]="UserRole.ADMIN">Administrador</option>
                </select>
              </div>
              <div class="pt-4">
                <button type="submit" class="modal-submit bg-primary">Cadastrar Membro</button>
              </div>
            </form>
          </div>
      </div>

      <!-- Password Modal -->
      <div *ngIf="isPasswordModalOpen()" class="modal-backdrop">
          <div class="modal-container">
            <div class="modal-header bg-stone-800">
              <h3 class="text-white font-bold text-lg flex items-center gap-2">
                <lucide-icon name="lock" size="18"></lucide-icon> Alterar Senha
              </h3>
              <button (click)="isPasswordModalOpen.set(false)" class="text-white/80 hover:text-white">
                <lucide-icon name="x" size="20"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="handleUpdatePassword($event)" class="p-6 space-y-4">
              <div class="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-sm text-stone-600 dark:text-stone-300 mb-2">
                  Editando senha para: <span class="font-bold text-stone-800 dark:text-white">{{ selectedUser()?.name }}</span>
              </div>
              <div>
                <label class="modal-label">Nova Senha</label>
                <input type="password" name="newPass" [(ngModel)]="newPassword" required placeholder="Digite a nova senha" class="modal-input" />
              </div>
              <div class="pt-4">
                <button type="submit" class="modal-submit bg-stone-800">Salvar Nova Senha</button>
              </div>
            </form>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-primary { background-color: var(--primary-color); }
    .bg-primary-100 { background-color: #fdf2f8; }
    .bg-primary-50 { background-color: #fdf2f8; }
    .text-primary { color: var(--primary-color); }
    .text-primary-700 { color: #be185d; }
    .focus\\:ring-primary:focus { --tw-ring-color: var(--primary-color); }
    .focus\\:border-primary:focus { border-color: var(--primary-color); }
    
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
      max-width: 28rem;
      overflow: hidden;
      border: 1px solid #e7e5e4;
    }
    :host-context(.dark) .modal-container {
      background-color: #1c1917;
      border-color: #292524;
    }
    .modal-header {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #44403c;
      margin-bottom: 0.25rem;
    }
    :host-context(.dark) .modal-label { color: #d6d3d1; }
    .modal-input {
      width: 100%;
      border-radius: 0.75rem;
      border: 1px solid #e7e5e4;
      background-color: #f5f5f4;
      padding: 0.625rem;
      outline: none;
      transition: all 0.2s;
    }
    :host-context(.dark) .modal-input {
      background-color: #1c1917;
      border-color: #292524;
      color: white;
    }
    .modal-submit {
      width: 100%;
      color: white;
      font-weight: 700;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
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
