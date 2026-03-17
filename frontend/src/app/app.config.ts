import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { 
    LucideAngularModule, 
    LayoutDashboard, 
    Calendar, 
    DollarSign, 
    Users, 
    Package, 
    FileText, 
    Settings, 
    LogOut, 
    Sparkles, 
    Menu, 
    X, 
    Moon, 
    Sun, 
    Mail, 
    Plus, 
    Lock, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Check, 
    Search, 
    Trash, 
    User, 
    UserPlus, 
    Activity, 
    CreditCard, 
    ChevronRight, 
    ChevronLeft, 
    Filter, 
    MoreHorizontal, 
    MoreVertical, 
    Download, 
    Upload, 
    Video, 
    Bell, 
    Shield, 
    Eye, 
    EyeOff, 
    Save, 
    Trash2,
    Heart,
    Stethoscope,
    Phone,
    MapPin,
    Info,
    ArrowRight,
    ArrowLeft,
    PlusCircle,
    XCircle,
    Copy,
    Share2,
    FileSearch,
    Sticker,
    Clipboard,
    Zap
} from 'lucide-angular';

registerLocaleData(localePt);

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    importProvidersFrom(LucideAngularModule.pick({ 
        LayoutDashboard, Calendar, DollarSign, Users, Package, FileText, Settings, LogOut, Sparkles, Menu, X, Moon, Sun,
        Mail, Plus, Lock, CheckCircle, Clock, AlertCircle, Check, Search, Trash, User, UserPlus, Activity, CreditCard,
        ChevronRight, ChevronLeft, Filter, MoreHorizontal, MoreVertical, Download, Upload, Video, Bell, Shield,
        Eye, EyeOff, Save, Trash2, Heart, Stethoscope, Phone, MapPin, Info, ArrowRight, ArrowLeft, PlusCircle, XCircle,
        Copy, Share2, FileSearch, Sticker, Clipboard, Zap
    }))
  ]
};
