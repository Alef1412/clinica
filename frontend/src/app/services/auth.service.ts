import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/types';
import { MockDbService } from './mock-db.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(this.getSavedUser());
  
  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(private db: MockDbService, private router: Router) {}

  async login(email: string, pass: string) {
    const user = await this.db.login(email, pass);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('lumina_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  async logout() {
    this.currentUser.set(null);
    localStorage.removeItem('lumina_user');
    this.router.navigate(['/login']);
  }

  private getSavedUser(): User | null {
    const saved = localStorage.getItem('lumina_user');
    return saved ? JSON.parse(saved) : null;
  }
}
