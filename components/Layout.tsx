import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Sparkles,
  Package,
  Menu,
  X,
  FileText,
  Moon,
  Sun,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <button
      onClick={() => handleNavigation(path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2
        ${isActive(path) 
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-none' 
          : 'text-stone-700 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-primary-700 dark:hover:text-primary-400'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-stone-900 z-30 flex items-center px-4 border-b border-stone-100 dark:border-stone-800 shadow-sm justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <h1 className="text-lg font-bold text-stone-800 dark:text-white">Lumina</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-stone-700 dark:text-stone-300">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-white tracking-tight">Lumina</h1>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 transition-colors"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {/* Mobile menu header spacing adjustment */}
        <div className="md:hidden h-16"></div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="flex justify-between items-center px-4 mb-4">
            <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Menu</div>
             {/* Mobile Theme Toggle */}
             <button 
              onClick={toggleTheme}
              className="md:hidden p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem path="/schedule" icon={Calendar} label="Agendamentos" />
          
          {user.role !== UserRole.PATIENT && (
             <NavItem path="/financial" icon={DollarSign} label="Financeiro" />
          )}

          {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) && (
             <NavItem path="/patients" icon={Users} label="Pacientes" />
          )}
          
           {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) && (
             <NavItem path="/products" icon={Package} label="Serviços" />
          )}

          {user.role === UserRole.PATIENT && (
             <NavItem path="/anamnesis" icon={FileText} label="Minha Ficha" />
          )}

           <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
             <NavItem path="/settings" icon={Settings} label="Configurações" />
           </div>
        </div>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.name} className="w-10 h-10 rounded-full border-2 border-primary-100 object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">{user.name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#FAFAFA] dark:bg-stone-950 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;