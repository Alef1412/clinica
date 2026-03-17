import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, LayoutDashboard, Calendar, DollarSign, Users, Package, FileText, Settings, LogOut, Sparkles, Menu, X, Moon, Sun } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    importProvidersFrom(LucideAngularModule.pick({ LayoutDashboard, Calendar, DollarSign, Users, Package, FileText, Settings, LogOut, Sparkles, Menu, X, Moon, Sun }))
  ]
};
