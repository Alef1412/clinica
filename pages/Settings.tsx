import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { dataService } from '../services/mockDb';
import { User as UserIcon, Lock, Bell, Save, Check } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Profile Form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phoneNumber || '');

  // Password Form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Notif Form
  const [whatsappEnabled, setWhatsappEnabled] = useState(user.whatsappEnabled || false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
        const updated = await dataService.updateUserProfile(user.id, { name, email, phoneNumber: phone });
        if (updated) {
            onUpdateUser(updated);
            setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        }
    } catch (e) {
        setMsg({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (newPass !== confirmPass) {
        setMsg({ type: 'error', text: 'As novas senhas não coincidem.' });
        setLoading(false);
        return;
    }

    // In a real app we would verify currentPass on backend
    await dataService.updateUserPassword(user.id, newPass);
    setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
    setLoading(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleNotifUpdate = async () => {
      setLoading(true);
      const updated = await dataService.updateUserProfile(user.id, { whatsappEnabled });
      if (updated) {
          onUpdateUser(updated);
          setMsg({ type: 'success', text: 'Configurações de notificação salvas.' });
      }
      setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Configurações da Conta</h2>
        <p className="text-stone-500 dark:text-stone-400">Gerencie seus dados pessoais e preferências.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
            <button 
                onClick={() => { setActiveTab('PROFILE'); setMsg(null); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left
                ${activeTab === 'PROFILE' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <UserIcon size={18} />
                Meu Perfil
            </button>
            <button 
                onClick={() => { setActiveTab('SECURITY'); setMsg(null); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left
                ${activeTab === 'SECURITY' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
                <Lock size={18} />
                Segurança
            </button>
            {user.role !== UserRole.PATIENT && (
                 <button 
                    onClick={() => { setActiveTab('NOTIFICATIONS'); setMsg(null); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left
                    ${activeTab === 'NOTIFICATIONS' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                >
                    <Bell size={18} />
                    Notificações
                </button>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
            {msg && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {msg.type === 'success' ? <Check size={16} /> : <Lock size={16} />}
                    {msg.text}
                </div>
            )}

            {activeTab === 'PROFILE' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4">Dados Pessoais</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nome Completo</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">E-mail</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">WhatsApp / Telefone</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="(00) 00000-0000" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center gap-2">
                            <Save size={18} /> Salvar Alterações
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'SECURITY' && (
                 <form onSubmit={handlePasswordUpdate} className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4">Alterar Senha</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Senha Atual</label>
                        <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nova Senha</label>
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Confirmar Nova Senha</label>
                        <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" required />
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="bg-stone-800 hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center gap-2">
                            <Lock size={18} /> Atualizar Senha
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'NOTIFICATIONS' && user.role !== UserRole.PATIENT && (
                 <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4">Automação de Mensagens</h3>
                    
                    <div className="flex items-start gap-4 p-4 border border-stone-100 dark:border-stone-800 rounded-xl bg-stone-50 dark:bg-stone-800/50">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <Bell size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-stone-800 dark:text-white">Lembretes de Agendamento (WhatsApp)</h4>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                O sistema enviará automaticamente uma mensagem para o paciente 2 dias antes da consulta confirmada.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={whatsappEnabled} onChange={e => setWhatsappEnabled(e.target.checked)} />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    <div className="pt-4">
                        <button onClick={handleNotifUpdate} disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center gap-2">
                            <Save size={18} /> Salvar Preferências
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;