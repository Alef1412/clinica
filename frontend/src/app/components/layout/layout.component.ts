import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole } from '../../models/types';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  template: `
    <div [class.dark]="isDarkMode()" class="app-container d-flex">
      
      <!-- Mobile Header -->
      <header class="mobile-header d-md-none fixed-top d-flex align-items-center justify-content-between px-3">
        <div class="d-flex align-items-center gap-2">
           <div class="logo-box d-flex align-items-center justify-content-center">
            <lucide-icon name="sparkles" size="16"></lucide-icon>
          </div>
          <h1 class="logo-text">Lumina</h1>
        </div>
        <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="btn-toggle-mobile border-0 bg-transparent">
          <lucide-icon [name]="isSidebarOpen() ? 'x' : 'menu'" size="24"></lucide-icon>
        </button>
      </header>

      <!-- Backdrop for Mobile -->
      <div *ngIf="isSidebarOpen()" 
           class="sidebar-backdrop d-md-none"
           (click)="isSidebarOpen.set(false)">
      </div>

      <!-- Sidebar -->
      <aside [class.open]="isSidebarOpen()"
             class="main-sidebar d-flex flex-column transition-300">
        
        <div class="sidebar-header d-none d-md-flex align-items-center justify-content-between p-4">
          <div class="d-flex align-items-center gap-3">
             <div class="logo-box larger d-flex align-items-center justify-content-center">
              <lucide-icon name="sparkles" size="18"></lucide-icon>
            </div>
            <h1 class="logo-text larger">Lumina</h1>
          </div>
          
          <button (click)="toggleTheme()"
            class="theme-toggle"
            [title]="isDarkMode() ? 'Modo Claro' : 'Modo Escuro'">
            <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" size="20"></lucide-icon>
          </button>
        </div>
        
        <div class="d-md-none h-header-mobile"></div>

        <div class="sidebar-scroll px-3 py-4 flex-grow-1 overflow-auto">
          <div class="d-flex justify-content-between align-items-center px-2 mb-3">
            <div class="menu-label">Menu</div>
             <button (click)="toggleTheme()" class="d-md-none theme-toggle sm">
               <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" size="18"></lucide-icon>
            </button>
          </div>
          
          <nav class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
              <lucide-icon name="layout-dashboard" size="20"></lucide-icon>
              <span>Visão Geral</span>
            </a>
            <a routerLink="/schedule" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
              <lucide-icon name="calendar" size="20"></lucide-icon>
              <span>Agendamentos</span>
            </a>
            
            <ng-container *ngIf="user()?.role !== 'PATIENT'">
              <a routerLink="/financial" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="dollar-sign" size="20"></lucide-icon>
                <span>Financeiro</span>
              </a>
            </ng-container>

            <ng-container *ngIf="user()?.role === 'ADMIN' || user()?.role === 'PROFESSIONAL'">
              <a routerLink="/patients" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="users" size="20"></lucide-icon>
                <span>{{ user()?.role === 'ADMIN' ? 'Usuários' : 'Pacientes' }}</span>
              </a>
              <a routerLink="/products" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="package" size="20"></lucide-icon>
                <span>Serviços</span>
              </a>
            </ng-container>

            <ng-container *ngIf="user()?.role === 'PATIENT'">
              <a routerLink="/anamnesis" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="file-text" size="20"></lucide-icon>
                <span>Minha Ficha</span>
              </a>
            </ng-container>

            <div class="nav-divider">
              <a routerLink="/settings" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="settings" size="20"></lucide-icon>
                <span>Configurações</span>
              </a>
            </div>
          </nav>
        </div>

        <div class="sidebar-footer p-4 border-top">
          <div class="user-info-box d-flex align-items-center gap-3 mb-4" *ngIf="user() as u">
            <img [src]="u.avatar || 'https://via.placeholder.com/150'" [alt]="u.name" class="user-avatar" />
            <div class="flex-grow-1 min-w-0">
              <p class="user-name mb-0 truncate">{{ u.name }}</p>
              <p class="user-role mb-0 truncate text-capitalize">{{ u.role.toLowerCase() }}</p>
            </div>
          </div>
          <button (click)="logout()" class="btn-logout w-100 d-flex align-items-center gap-2">
            <lucide-icon name="log-out" size="16"></lucide-icon>
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content flex-grow-1 overflow-auto">
        <div class="container-fluid p-4 p-md-5">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      overflow: hidden;
      background-color: var(--surface-ground);
    }

    .mobile-header {
      height: 64px;
      background: var(--surface-section);
      border-bottom: 1px solid var(--surface-border);
      z-index: 1040;
      box-shadow: var(--shadow-sm);
    }

    .h-header-mobile { height: 64px; }

    .logo-box {
      width: 32px;
      height: 32px;
      background: var(--grad-primary);
      border-radius: 8px;
      color: white;
      &.larger { width: 40px; height: 40px; border-radius: 12px; }
    }

    .logo-text {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-color);
      margin: 0;
      &.larger { font-size: 1.5rem; letter-spacing: -0.025em; }
    }

    .btn-toggle-mobile {
      color: var(--text-color-secondary);
      padding: 8px;
    }

    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1045;
    }

    .main-sidebar {
      width: 280px;
      background: var(--surface-card);
      border-right: 1px solid var(--surface-border);
      z-index: 1050;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      
      &.open { transform: translateX(0); }
      
      @media (min-width: 768px) {
        position: relative;
        transform: translateX(0);
        box-shadow: none;
      }
    }

    .main-content {
      overflow-y: auto;
      background-color: var(--surface-ground);
      padding-top: 64px;
      @media (min-width: 768px) { padding-top: 0; }
    }

    .theme-toggle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 0;
      background: var(--surface-hover);
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:hover { color: var(--primary-color); background: var(--primary-light); }
      &.sm { width: 32px; height: 32px; }
    }

    .menu-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-color-secondary);
    }

    .nav-links {
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 12px;
        color: var(--text-color-secondary);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.9375rem;
        transition: all 0.2s;
        margin-bottom: 4px;

        &:hover {
          background: var(--surface-hover);
          color: var(--primary-color);
        }

        &.active {
          background: var(--grad-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);
        }
      }
    }

    .nav-divider {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border);
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      object-fit: cover;
    }

    .user-name { font-weight: 600; font-size: 0.9375rem; color: var(--text-color); }
    .user-role { font-size: 0.8125rem; color: var(--text-color-secondary); }

    .btn-logout {
      padding: 10px 16px;
      border-radius: 12px;
      border: 1px solid #fee2e2;
      background: #fef2f2;
      color: #ef4444;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
      &:hover { background: #fee2e2; transform: translateY(-1px); }
    }

    .transition-300 { transition: all 0.3s ease-in-out; }
  `]
})
export class LayoutComponent {
  private mockDb = inject(MockDbService);
  private router = inject(Router);

  isSidebarOpen = signal(false);
  isDarkMode = signal(false);
  user = signal<any>(null);

  constructor() {
    // For demo purposes, we'll just use the first user in the mock DB
    // In a real app, this would come from an AuthService
    this.user.set({
      id: '1',
      name: 'Ana Silva',
      role: UserRole.ADMIN,
      avatar: 'https://picsum.photos/id/64/200/200'
    });
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
