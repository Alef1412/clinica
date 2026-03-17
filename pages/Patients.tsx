import React, { useEffect, useState } from 'react';
import { User, UserRole, AnamnesisStatus } from '../types';
import { dataService } from '../services/mockDb';
import { Mail, Search, User as UserIcon, Plus, X, FileText, Send, Clock, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientsProps {
  user: User;
}

const Patients: React.FC<PatientsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewRole, setViewRole] = useState<'PATIENTS' | 'PROFESSIONALS'>('PATIENTS');
  
  // Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>(UserRole.PROFESSIONAL);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, [user, viewRole]);

  const loadData = async () => {
    if (user.role === UserRole.PATIENT) return;

    if (viewRole === 'PATIENTS') {
        const data = await dataService.getPatients();
        setUsersList(data);
    } else {
        const data = await dataService.getProfessionals();
        setUsersList(data);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPatientName && newPatientEmail) {
      await dataService.createPatient(newPatientName, newPatientEmail);
      setIsRegisterModalOpen(false);
      setNewPatientName('');
      setNewPatientEmail('');
      loadData();
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberEmail) {
      await dataService.createProfessional(newMemberName, newMemberEmail, newMemberRole);
      setIsMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole(UserRole.PROFESSIONAL);
      loadData();
    }
  };

  const handleRequestAnamnesis = async (patientId: string) => {
    await dataService.requestAnamnesis(patientId);
    loadData();
  };

  const handleViewAnamnesis = (patientId: string) => {
    navigate(`/anamnesis/${patientId}`);
  };

  const openPasswordModal = (targetUser: User) => {
    setSelectedUserForPassword(targetUser);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUserForPassword && newPassword) {
          await dataService.updateUserPassword(selectedUserForPassword.id, newPassword);
          setIsPasswordModalOpen(false);
          alert(`Senha alterada com sucesso para ${selectedUserForPassword.name}`);
      }
  };

  if (user.role === UserRole.PATIENT) return <p>Acesso negado.</p>;

  const filteredUsers = usersList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-white">
            {isAdmin ? 'Gerenciar Usuários' : 'Pacientes'}
          </h2>
          <p className="text-stone-500 dark:text-stone-400">
            {isAdmin ? 'Controle total de pacientes e equipe.' : 'Gerencie a base de clientes da clínica.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* Admin View Toggle */}
            {isAdmin && (
                <div className="flex bg-white dark:bg-stone-900 rounded-xl p-1 border border-stone-200 dark:border-stone-800">
                    <button 
                        onClick={() => setViewRole('PATIENTS')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewRole === 'PATIENTS' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'}`}
                    >
                        Pacientes
                    </button>
                    <button 
                         onClick={() => setViewRole('PROFESSIONALS')}
                         className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewRole === 'PROFESSIONALS' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'}`}
                    >
                        Equipe
                    </button>
                </div>
            )}

            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                    type="text" 
                    placeholder={viewRole === 'PATIENTS' ? "Buscar paciente..." : "Buscar profissional..."}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {viewRole === 'PATIENTS' && (
                <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-primary-200 dark:shadow-none flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                >
                    <Plus size={18} />
                    Novo Paciente
                </button>
            )}
            
            {viewRole === 'PROFESSIONALS' && isAdmin && (
                <button 
                    onClick={() => setIsMemberModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-primary-200 dark:shadow-none flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                >
                    <Plus size={18} />
                    Novo Membro
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(listUser => (
          <div key={listUser.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center text-center transition hover:shadow-md relative group">
            
            {/* Password Edit Button (Top Right) */}
            <button 
                onClick={() => openPasswordModal(listUser)}
                className="absolute top-4 right-4 text-stone-300 hover:text-primary-500 dark:text-stone-600 dark:hover:text-primary-400 transition"
                title="Alterar Senha"
            >
                <Lock size={16} />
            </button>

            <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 mb-4 overflow-hidden border-4 border-primary-50 dark:border-stone-800 relative">
              {listUser.avatar ? (
                <img src={listUser.avatar} alt={listUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-600">
                  <UserIcon size={32} />
                </div>
              )}
            </div>
            <h3 className="font-bold text-lg text-stone-800 dark:text-white flex items-center gap-2">
                {listUser.name}
                {listUser.role === UserRole.ADMIN && (
                  <span title="Admin" className="flex items-center">
                    <Shield size={14} className="text-amber-500"/>
                  </span>
                )}
            </h3>
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 mt-1 mb-4 text-sm">
              <Mail size={14} />
              <span>{listUser.email}</span>
            </div>
            
            {/* Action Buttons - Only for Patients view */}
            {viewRole === 'PATIENTS' && (
                <div className="w-full pt-4 border-t border-stone-50 dark:border-stone-800 flex gap-2">
                    {listUser.anamnesisStatus === AnamnesisStatus.NONE && (
                        <button 
                            onClick={() => handleRequestAnamnesis(listUser.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium py-2 rounded-lg transition text-sm"
                            title="Solicitar Anamnese"
                        >
                            <Send size={16} />
                            Solicitar Ficha
                        </button>
                    )}
                    {listUser.anamnesisStatus === AnamnesisStatus.REQUESTED && (
                        <div className="flex-1 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium py-2 rounded-lg text-sm border border-amber-100 dark:border-amber-900/30">
                            <Clock size={16} /> (Pendente)
                        </div>
                    )}
                    {listUser.anamnesisStatus === AnamnesisStatus.COMPLETED && (
                        <button 
                            onClick={() => handleViewAnamnesis(listUser.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium py-2 rounded-lg transition text-sm"
                        >
                            <FileText size={16} />
                            Ver Ficha
                        </button>
                    )}
                </div>
            )}
            
            {/* Role Badge for Professionals view */}
            {viewRole === 'PROFESSIONALS' && (
                <div className="w-full pt-4 border-t border-stone-50 dark:border-stone-800">
                    <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-semibold rounded-full">
                        {listUser.role === UserRole.ADMIN ? 'Administrador' : 'Profissional'}
                    </span>
                </div>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-10 text-stone-400 dark:text-stone-600">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

       {/* Register Modal */}
       {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-stone-200 dark:border-stone-700">
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Cadastrar Paciente</h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterPatient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-stone-200 dark:border-stone-700">
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Cadastrar Membro na Equipe</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Perfil</label>
                <select 
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.PROFESSIONAL}>Profissional</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                >
                  Cadastrar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Edit Modal */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-stone-200 dark:border-stone-700">
            <div className="bg-stone-800 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lock size={18}/>
                Alterar Senha
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-sm text-stone-600 dark:text-stone-300 mb-2">
                  Editando senha para: <span className="font-bold text-stone-800 dark:text-white">{selectedUserForPassword.name}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  placeholder="Digite a nova senha"
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;