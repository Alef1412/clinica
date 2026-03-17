import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole } from '../../models/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[600px]">
        
        <!-- Left Side - Form -->
        <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <lucide-icon name="sparkles" size="16"></lucide-icon>
            </div>
            <span class="text-xl font-bold text-stone-800">Lumina</span>
          </div>

          <ng-container *ngIf="!showVerification(); else verificationTemplate">
            <!-- Tabs -->
            <div class="flex mb-8 border-b border-stone-100">
                <button 
                    (click)="activeTab.set('LOGIN'); error.set('')"
                    [class.text-primary-600]="activeTab() === 'LOGIN'"
                    [class.text-stone-400]="activeTab() !== 'LOGIN'"
                    class="flex-1 pb-3 text-sm font-semibold transition-colors relative hover:text-stone-600"
                >
                    Entrar
                    <div *ngIf="activeTab() === 'LOGIN'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                </button>
                <button 
                    (click)="activeTab.set('REGISTER'); error.set('')"
                    [class.text-primary-600]="activeTab() === 'REGISTER'"
                    [class.text-stone-400]="activeTab() !== 'REGISTER'"
                    class="flex-1 pb-3 text-sm font-semibold transition-colors relative hover:text-stone-600"
                >
                    Criar Conta
                    <div *ngIf="activeTab() === 'REGISTER'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                </button>
            </div>

            <div *ngIf="activeTab() === 'LOGIN'" class="space-y-4 animate-fade-in">
                <h1 class="text-2xl font-bold text-stone-800">Bem-vindo de volta</h1>
                <p class="text-stone-500 mb-4 text-sm">Insira suas credenciais para acessar.</p>
                
                <form (submit)="handleLoginSubmit($event)" class="space-y-4">
                    <div>
                        <div class="relative">
                            <lucide-icon name="mail" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                            <input 
                            name="email"
                            type="email" 
                            [(ngModel)]="loginData.email"
                            required
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="Seu e-mail"
                            />
                        </div>
                    </div>

                    <div>
                    <div class="relative">
                        <lucide-icon name="lock" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                        <input 
                        name="password"
                        type="password" 
                        [(ngModel)]="loginData.password"
                        required
                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        placeholder="Sua senha"
                        />
                    </div>
                    </div>

                    <div *ngIf="error()" class="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <lucide-icon name="info" size="16"></lucide-icon>
                        {{ error() }}
                    </div>

                    <button 
                    type="submit"
                    [disabled]="loading()"
                    class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin mr-2" size="20"></lucide-icon>
                        {{ loading() ? 'Entrando...' : 'Entrar' }}
                    </button>
                </form>

                 <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-stone-100"></div>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-white px-2 text-stone-400">Ou continue com</span>
                    </div>
                </div>

                <button
                    type="button"
                    (click)="handleGoogleLogin()"
                    [disabled]="loading()"
                    class="w-full border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google" />
                    Google
                </button>
            </div>

            <div *ngIf="activeTab() === 'REGISTER'" class="space-y-4 animate-fade-in">
                <h1 class="text-2xl font-bold text-stone-800">Crie sua conta</h1>
                <p class="text-stone-500 mb-4 text-sm">Preencha os dados abaixo.</p>

                 <form (submit)="handleRegisterSubmit($event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-stone-700 mb-2">Qual o seu perfil?</label>
                        <div class="flex gap-3 mb-4">
                            <button
                                type="button"
                                (click)="regData.role = UserRole.PATIENT"
                                [class.bg-primary-50]="regData.role === UserRole.PATIENT"
                                [class.border-primary]="regData.role === UserRole.PATIENT"
                                [class.text-primary-700]="regData.role === UserRole.PATIENT"
                                [class.bg-stone-50]="regData.role !== UserRole.PATIENT"
                                [class.border-stone-200]="regData.role !== UserRole.PATIENT"
                                class="flex-1 py-2 px-3 rounded-xl border font-medium text-sm transition-all hover:bg-stone-100"
                            >
                                Sou Paciente
                            </button>
                            <button
                                type="button"
                                (click)="regData.role = UserRole.ADMIN"
                                [class.bg-primary-50]="regData.role === UserRole.ADMIN"
                                [class.border-primary]="regData.role === UserRole.ADMIN"
                                [class.text-primary-700]="regData.role === UserRole.ADMIN"
                                [class.bg-stone-50]="regData.role !== UserRole.ADMIN"
                                [class.border-stone-200]="regData.role !== UserRole.ADMIN"
                                class="flex-1 py-2 px-3 rounded-xl border font-medium text-sm transition-all hover:bg-stone-100"
                            >
                                Clínica / Prof.
                            </button>
                        </div>
                    </div>

                     <div>
                        <div class="relative">
                            <lucide-icon name="user" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                            <input 
                            name="regName"
                            type="text" 
                            [(ngModel)]="regData.name"
                            required
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="Nome Completo"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <div class="relative">
                            <lucide-icon name="mail" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                            <input 
                            name="regEmail"
                            type="email" 
                            [(ngModel)]="regData.email"
                            required
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="E-mail"
                            />
                        </div>
                    </div>

                     <div>
                        <div class="relative">
                            <lucide-icon name="phone" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                            <input 
                            name="regPhone"
                            type="tel" 
                            [(ngModel)]="regData.phone"
                            required
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="WhatsApp / Celular"
                            />
                        </div>
                    </div>

                    <div>
                        <div class="relative">
                            <lucide-icon name="lock" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size="18"></lucide-icon>
                            <input 
                            name="regPassword"
                            type="password" 
                            [(ngModel)]="regData.password"
                            required
                            class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="Senha"
                            />
                        </div>
                    </div>

                    <button 
                    type="submit"
                    [disabled]="loading()"
                    class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin mr-2" size="20"></lucide-icon>
                        {{ loading() ? 'Cadastrando...' : 'Cadastrar' }}
                    </button>
                </form>
            </div>
          </ng-container>

          <ng-template #verificationTemplate>
            <div class="animate-fade-in text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <lucide-icon name="message-circle" size="32"></lucide-icon>
                </div>
                <h2 class="text-2xl font-bold text-stone-800 mb-2">Verifique seu número</h2>
                <p class="text-stone-500 mb-6">Enviamos um código de confirmação para o WhatsApp <strong>{{ regData.phone }}</strong>.</p>
                
                <form (submit)="verifyAndCreateAccount($event)" class="max-w-xs mx-auto space-y-4">
                     <input 
                        name="verificationCode"
                        type="text" 
                        required
                        class="w-full text-center text-2xl tracking-widest py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        placeholder="0000"
                        maxLength="4"
                        [(ngModel)]="verificationCode"
                    />
                     <div *ngIf="error()" class="text-red-500 text-sm font-medium">
                        {{ error() }}
                    </div>
                    <button 
                        type="submit"
                        [disabled]="loading()"
                        class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin mr-2" size="20"></lucide-icon>
                        {{ loading() ? 'Confirmando...' : 'Confirmar e Acessar' }}
                    </button>
                    <button type="button" (click)="showVerification.set(false)" class="text-stone-400 hover:text-stone-600 text-sm mt-4">Voltar</button>
                </form>
            </div>
          </ng-template>

          <!-- Demo shortcuts -->
          <div *ngIf="!showVerification() && activeTab() === 'LOGIN'" class="mt-8 pt-6 border-t border-stone-100">
              <p class="text-xs text-stone-400 text-center mb-3">Acesso Rápido (Demo)</p>
              <div class="flex justify-center gap-2">
                <button (click)="fillDemo('admin')" class="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Admin</button>
                <button (click)="fillDemo('doc')" class="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Profissional</button>
                <button (click)="fillDemo('patient')" class="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Paciente</button>
              </div>
          </div>
        </div>

        <!-- Right Side - Image -->
        <div class="hidden md:block w-1/2 bg-cover bg-center relative" style="background-image: url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop')">
          <div class="absolute inset-0 bg-primary-dark opacity-20 backdrop-blur-[2px]"></div>
          <div class="absolute bottom-10 left-10 right-10 text-white">
            <h2 class="text-3xl font-bold mb-4">Beleza que inspira confiança.</h2>
            <p class="text-white/90">Gerencie sua clínica com elegância e eficiência em uma única plataforma.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .bg-primary { background-color: var(--primary-color); }
    .bg-primary-dark { background-color: #db2777; }
    .text-primary-600 { color: var(--primary-color); }
    .text-primary-700 { color: #be185d; }
    .focus\\:ring-primary:focus { --tw-ring-color: var(--primary-color); }
    .focus\\:border-primary:focus { border-color: var(--primary-color); }
    .bg-primary-50 { background-color: #fdf2f8; }
    .border-primary { border-color: var(--primary-color); }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class LoginComponent {
  private mockDb = inject(MockDbService);
  private router = inject(Router);

  UserRole = UserRole;
  activeTab = signal<'LOGIN' | 'REGISTER'>('LOGIN');
  loading = signal(false);
  error = signal('');
  showVerification = signal(false);
  verificationCode = '';

  loginData = {
    email: '',
    password: ''
  };

  regData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.PATIENT
  };

  async handleLoginSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');
    this.loading.set(true);

    try {
      const user = await this.mockDb.login(this.loginData.email, this.loginData.password);
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('E-mail ou senha incorretos.');
      }
    } catch (err) {
      this.error.set('Erro ao conectar ao servidor.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleRegisterSubmit(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.showVerification.set(true);
    }, 1000);
  }

  async verifyAndCreateAccount(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    const isValid = await this.mockDb.verifyCode(this.verificationCode);
    
    if (isValid) {
      await this.mockDb.register(
        this.regData.name, 
        this.regData.email, 
        this.regData.phone, 
        this.regData.password, 
        this.regData.role
      );
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Código inválido. Tente 1234.');
      this.loading.set(false);
    }
  }

  handleGoogleLogin() {
    this.loading.set(true);
    setTimeout(async () => {
      await this.mockDb.login('julia@gmail.com', '123');
      this.router.navigate(['/dashboard']);
      this.loading.set(false);
    }, 1500);
  }

  fillDemo(role: 'admin' | 'doc' | 'patient') {
    this.activeTab.set('LOGIN');
    this.loginData.password = '123';
    if (role === 'admin') this.loginData.email = 'admin@lumina.com';
    if (role === 'doc') this.loginData.email = 'doc@lumina.com';
    if (role === 'patient') this.loginData.email = 'julia@gmail.com';
  }
}
