import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { FinancialComponent } from './pages/financial/financial.component';
import { ProductsComponent } from './pages/products/products.component';
import { AnamnesisComponent } from './pages/anamnesis/anamnesis.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'financial', component: FinancialComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'anamnesis/:id', component: AnamnesisComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
