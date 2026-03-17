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
    <div [class.dark]="isDarkMode()" class="flex h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden transition-colors duration-300">
      
      <!-- Mobile Header -->
      <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-stone-900 z-30 flex items-center px-4 border-b border-stone-100 dark:border-stone-800 shadow-sm justify-between">
        <div class="flex items-center gap-2">
           <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <lucide-icon name="sparkles" size="16"></lucide-icon>
          </div>
          <h1 class="text-lg font-bold text-stone-800 dark:text-white">Lumina</h1>
        </div>
        <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="p-2 text-stone-700 dark:text-stone-300">
          <lucide-icon [name]="isSidebarOpen() ? 'x' : 'menu'" size="24"></lucide-icon>
        </button>
      </div>

      <!-- Backdrop for Mobile -->
      <div *ngIf="isSidebarOpen()" 
           class="fixed inset-0 bg-stone-900/50 z-30 md:hidden backdrop-blur-sm"
           (click)="isSidebarOpen.set(false)">
      </div>

      <!-- Sidebar -->
      <aside [class.translate-x-0]="isSidebarOpen()" [class.-translate-x-full]="!isSidebarOpen()"
             class="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0">
        
        <div class="p-6 hidden md:flex items-center justify-between">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <lucide-icon name="sparkles" size="18"></lucide-icon>
            </div>
            <h1 class="text-xl font-bold text-stone-800 dark:text-white tracking-tight">Lumina</h1>
          </div>
          
          <button (click)="toggleTheme()"
            class="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 transition-colors"
            [title]="isDarkMode() ? 'Modo Claro' : 'Modo Escuro'">
            <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" size="20"></lucide-icon>
          </button>
        </div>
        
        <div class="md:hidden h-16"></div>

        <div class="flex-1 px-4 py-4 overflow-y-auto">
          <div class="flex justify-between items-center px-4 mb-4">
            <div class="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Menu</div>
             <button (click)="toggleTheme()" class="md:hidden p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400">
               <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" size="18"></lucide-icon>
            </button>
          </div>
          
          <nav>
            <a routerLink="/dashboard" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
              <lucide-icon name="layout-dashboard" size="20"></lucide-icon>
              <span class="font-medium text-sm">Visão Geral</span>
            </a>
            <a routerLink="/schedule" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
              <lucide-icon name="calendar" size="20"></lucide-icon>
              <span class="font-medium text-sm">Agendamentos</span>
            </a>
            
            <ng-container *ngIf="user()?.role !== 'PATIENT'">
              <a routerLink="/financial" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="dollar-sign" size="20"></lucide-icon>
                <span class="font-medium text-sm">Financeiro</span>
              </a>
            </ng-container>

            <ng-container *ngIf="user()?.role === 'ADMIN' || user()?.role === 'PROFESSIONAL'">
              <a routerLink="/patients" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="users" size="20"></lucide-icon>
                <span class="font-medium text-sm">{{ user()?.role === 'ADMIN' ? 'Usuários' : 'Pacientes' }}</span>
              </a>
              <a routerLink="/products" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="package" size="20"></lucide-icon>
                <span class="font-medium text-sm">Serviços</span>
              </a>
            </ng-container>

            <ng-container *ngIf="user()?.role === 'PATIENT'">
              <a routerLink="/anamnesis" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="file-text" size="20"></lucide-icon>
                <span class="font-medium text-sm">Minha Ficha</span>
              </a>
            </ng-container>

            <div class="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <a routerLink="/settings" routerLinkActive="active" (click)="isSidebarOpen.set(false)" class="nav-item">
                <lucide-icon name="settings" size="20"></lucide-icon>
                <span class="font-medium text-sm">Configurações</span>
              </a>
            </div>
          </nav>
        </div>

        <div class="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div class="flex items-center gap-3 mb-4 px-2" *ngIf="user() as u">
            <img [src]="u.avatar || 'https://via.placeholder.com/150'" [alt]="u.name" class="w-10 h-10 rounded-full border-2 border-primary object-cover" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">{{ u.name }}</p>
              <p class="text-xs text-stone-500 dark:text-stone-500 truncate capitalize">{{ u.role.toLowerCase() }}</p>
            </div>
          </div>
          <button (click)="logout()"
            class="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">
            <lucide-icon name="log-out" size="16"></lucide-icon>
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-[#FAFAFA] dark:bg-stone-950 pt-16 md:pt-0">
        <div class="max-w-7xl mx-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .bg-primary { background-color: var(--primary-color); }
    .border-primary { border-color: var(--primary-color); }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
      margin-bottom: 0.5rem;
      text-decoration: none;
      color: var(--text-color);
      
      &:hover {
        background-color: var(--surface-hover);
        color: var(--primary-color);
      }
      
      &.active {
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        color: white;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
    }
    
    :host-context(.dark) .nav-item {
       color: #94a3b8;
       &:hover {
         background-color: #1e293b;
         color: var(--primary-color);
       }
       &.active {
         color: white;
       }
    }
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
