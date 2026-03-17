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
    <div class="login-wrapper vh-100 d-flex align-items-center justify-content-center p-3 animate-fade-in">
      <div class="login-container shadow-lg d-flex overflow-hidden">
        
        <!-- Left Side - Form -->
        <div class="login-form-side d-flex flex-column justify-content-center p-4 p-md-5">
          <div class="d-flex align-items-center gap-2 mb-4">
            <div class="brand-logo-box d-flex align-items-center justify-content-center">
              <lucide-icon name="sparkles" size="16"></lucide-icon>
            </div>
            <span class="brand-name">Lumina</span>
          </div>

          <ng-container *ngIf="!showVerification(); else verificationTemplate">
            <!-- Tabs -->
            <div class="d-flex mb-5 login-tabs">
                <button 
                    (click)="activeTab.set('LOGIN'); error.set('')"
                    class="btn-tab flex-grow-1"
                    [class.active]="activeTab() === 'LOGIN'"
                >
                    Entrar
                </button>
                <button 
                    (click)="activeTab.set('REGISTER'); error.set('')"
                    class="btn-tab flex-grow-1"
                    [class.active]="activeTab() === 'REGISTER'"
                >
                    Criar Conta
                </button>
            </div>

            <div *ngIf="activeTab() === 'LOGIN'" class="animate-fade-in">
                <h1 class="login-title mb-1">Bem-vindo de volta</h1>
                <p class="login-subtitle mb-4">Insira suas credenciais para acessar.</p>
                
                <form (submit)="handleLoginSubmit($event)">
                    <div class="mb-3">
                        <div class="position-relative">
                            <lucide-icon name="mail" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="email"
                              type="email" 
                              [(ngModel)]="loginData.email"
                              required
                              class="form-control-premium with-icon"
                              placeholder="Seu e-mail"
                            />
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="position-relative">
                            <lucide-icon name="lock" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="password"
                              type="password" 
                              [(ngModel)]="loginData.password"
                              required
                              class="form-control-premium with-icon"
                              placeholder="Sua senha"
                            />
                        </div>
                    </div>

                    <div *ngIf="error()" class="error-alert d-flex align-items-center gap-2 mb-4 p-3 rounded-3">
                        <lucide-icon name="info" size="16"></lucide-icon>
                        {{ error() }}
                    </div>

                    <button 
                      type="submit"
                      [disabled]="loading()"
                      class="btn btn-primary-premium w-100 py-3 mb-4"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin" size="20"></lucide-icon>
                        {{ loading() ? 'Entrando...' : 'Entrar' }}
                    </button>
                </form>

                 <div class="position-relative my-4 text-center">
                    <hr class="m-0" />
                    <span class="divider-text bg-white px-3">Ou continue com</span>
                </div>

                <button
                    type="button"
                    (click)="handleGoogleLogin()"
                    [disabled]="loading()"
                    class="btn btn-google w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="google-icon" alt="Google" />
                    Google
                </button>
            </div>

            <div *ngIf="activeTab() === 'REGISTER'" class="animate-fade-in">
                <h1 class="login-title mb-1">Crie sua conta</h1>
                <p class="login-subtitle mb-4">Preencha os dados abaixo.</p>

                 <form (submit)="handleRegisterSubmit($event)">
                    <div class="mb-4">
                        <label class="form-label-premium text-center d-block mb-3">Qual o seu perfil?</label>
                        <div class="d-flex gap-3">
                            <button
                                type="button"
                                (click)="regData.role = UserRole.PATIENT"
                                class="btn btn-role-selector flex-grow-1"
                                [class.active]="regData.role === UserRole.PATIENT"
                            >
                                Sou Paciente
                            </button>
                            <button
                                type="button"
                                (click)="regData.role = UserRole.ADMIN"
                                class="btn btn-role-selector flex-grow-1"
                                [class.active]="regData.role === UserRole.ADMIN"
                            >
                                Clínica / Prof.
                            </button>
                        </div>
                    </div>

                     <div class="mb-3">
                        <div class="position-relative">
                            <lucide-icon name="user" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="regName"
                              type="text" 
                              [(ngModel)]="regData.name"
                              required
                              class="form-control-premium with-icon"
                              placeholder="Nome Completo"
                            />
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="position-relative">
                            <lucide-icon name="mail" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="regEmail"
                              type="email" 
                              [(ngModel)]="regData.email"
                              required
                              class="form-control-premium with-icon"
                              placeholder="E-mail"
                            />
                        </div>
                    </div>

                     <div class="mb-3">
                        <div class="position-relative">
                            <lucide-icon name="phone" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="regPhone"
                              type="tel" 
                              [(ngModel)]="regData.phone"
                              required
                              class="form-control-premium with-icon"
                              placeholder="WhatsApp / Celular"
                            />
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="position-relative">
                            <lucide-icon name="lock" class="input-icon" size="18"></lucide-icon>
                            <input 
                              name="regPassword"
                              type="password" 
                              [(ngModel)]="regData.password"
                              required
                              class="form-control-premium with-icon"
                              placeholder="Senha"
                            />
                        </div>
                    </div>

                    <button 
                      type="submit"
                      [disabled]="loading()"
                      class="btn btn-primary-premium w-100 py-3"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin" size="20"></lucide-icon>
                        {{ loading() ? 'Cadastrando...' : 'Cadastrar' }}
                    </button>
                </form>
            </div>
          </ng-container>

          <ng-template #verificationTemplate>
            <div class="animate-fade-in text-center">
                <div class="verification-icon-box d-flex align-items-center justify-content-center mx-auto mb-4">
                    <lucide-icon name="message-circle" size="32"></lucide-icon>
                </div>
                <h2 class="login-title mb-2">Verifique seu número</h2>
                <p class="login-subtitle mb-4">Enviamos um código para o WhatsApp <strong>{{ regData.phone }}</strong>.</p>
                
                <form (submit)="verifyAndCreateAccount($event)" class="mx-auto max-w-verification">
                     <input 
                        name="verificationCode"
                        type="text" 
                        required
                        class="form-control-premium text-center code-input mb-4"
                        placeholder="0000"
                        maxLength="4"
                        [(ngModel)]="verificationCode"
                    />
                     <div *ngIf="error()" class="error-text mb-3">
                        {{ error() }}
                    </div>
                    <button 
                        type="submit"
                        [disabled]="loading()"
                        class="btn btn-primary-premium w-100 py-3 mb-3 shadow"
                    >
                        <lucide-icon *ngIf="loading()" name="loader-2" class="animate-spin" size="20"></lucide-icon>
                        {{ loading() ? 'Confirmando...' : 'Confirmar e Acessar' }}
                    </button>
                    <button type="button" (click)="showVerification.set(false)" class="btn btn-link btn-back text-decoration-none">Voltar</button>
                </form>
            </div>
          </ng-template>

          <!-- Demo shortcuts -->
          <div *ngIf="!showVerification() && activeTab() === 'LOGIN'" class="mt-5 pt-4 border-top">
              <p class="demo-label text-center mb-3">Acesso Rápido (Demo)</p>
              <div class="d-flex justify-content-center gap-2">
                <button (click)="fillDemo('admin')" class="btn btn-demo-shortcut">Admin</button>
                <button (click)="fillDemo('doc')" class="btn btn-demo-shortcut">Profissional</button>
                <button (click)="fillDemo('patient')" class="btn btn-demo-shortcut">Paciente</button>
              </div>
          </div>
        </div>
 
        <!-- Right Side - Image -->
        <div class="login-image-side d-none d-md-block flex-grow-1 position-relative">
          <div class="image-overlay position-absolute inset-0"></div>
          <div class="image-content position-absolute bottom-0 start-0 p-5 w-100">
            <h2 class="image-title mb-3">Beleza que inspira confiança.</h2>
            <p class="image-subtitle">Gerencie sua clínica com elegância e eficiência em uma única plataforma.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { background: #fdf2f8; }
    .login-container { background: white; width: 100%; max-width: 900px; border-radius: 2rem; min-height: 600px; }
    
    .login-form-side { width: 100%; }
    @media (min-width: 768px) { .login-form-side { width: 450px; } }

    .brand-logo-box { width: 32px; height: 32px; background: var(--primary-color); border-radius: 8px; color: white; }
    .brand-name { font-size: 1.25rem; font-weight: 800; color: #1c1917; }

    .btn-tab {
      background: transparent; border: 0; border-bottom: 2px solid #f5f5f4;
      padding-bottom: 12px; font-size: 0.875rem; font-weight: 700; color: #a8a29e;
      transition: all 0.2s;
      &.active { border-color: var(--primary-color); color: var(--primary-color); }
      &:hover:not(.active) { color: #57534e; }
    }

    .login-title { font-size: 1.5rem; font-weight: 800; color: #1c1917; }
    .login-subtitle { font-size: 0.875rem; color: #78716c; }

    .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #a8a29e; }
    .form-control-premium.with-icon { padding-left: 48px; border-radius: 12px; padding-top: 12px; padding-bottom: 12px; background: #f5f5f4; border-color: transparent; &:focus { background: white; border-color: var(--primary-color); } }

    .error-alert { background: #fef2f2; color: #ef4444; font-size: 0.8125rem; font-weight: 600; }

    .btn-primary-premium {
      background: var(--grad-primary); border: 0; border-radius: 12px; color: white; font-weight: 700;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3); color: white; }
    }

    .divider-text { font-size: 0.6875rem; text-transform: uppercase; font-weight: 700; color: #a8a29e; position: relative; top: -10px; }
    
    .btn-google {
      background: white; border: 1px solid #e7e5e4; border-radius: 12px; font-weight: 600; color: #44403c;
      transition: all 0.2s; &:hover { background: #fdf2f8; border-color: var(--primary-color); }
    }
    .google-icon { width: 20px; height: 20px; }

    .btn-role-selector {
      background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 12px; padding: 10px;
      font-size: 0.8125rem; font-weight: 700; color: #57534e; transition: all 0.2s;
      &.active { background: #fdf2f8; border-color: var(--primary-color); color: var(--primary-color); }
      &:hover:not(.active) { background: #e7e5e4; }
    }

    .verification-icon-box { width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%; color: #22c55e; }
    .max-w-verification { max-width: 320px; }
    .code-input { font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: 800; }
    .error-text { color: #ef4444; font-size: 0.8125rem; font-weight: 600; }
    .btn-back { font-size: 0.875rem; color: #a8a29e; font-weight: 600; &:hover { color: #57534e; } }

    .demo-label { font-size: 0.6875rem; text-transform: uppercase; font-weight: 700; color: #a8a29e; }
    .btn-demo-shortcut { 
      font-size: 0.6875rem; background: #f5f5f4; border: 0; padding: 6px 12px; border-radius: 8px; 
      font-weight: 700; color: #78716c; transition: all 0.2s;
      &:hover { background: #e7e5e4; color: #44403c; }
    }

    .login-image-side { 
      background-image: url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop');
      background-size: cover; background-position: center; 
    }
    .image-overlay { background: linear-gradient(to bottom, rgba(190, 24, 93, 0.1), rgba(131, 24, 67, 0.4)); backdrop-filter: blur(1px); }
    .image-title { color: white; font-size: 1.75rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .image-subtitle { color: rgba(255,255,255,0.9); font-weight: 500; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
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
