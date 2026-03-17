import React, { useState } from 'react';
import { authService } from '../services/mockDb';
import { User, UserRole } from '../types';
import { Sparkles, Mail, Lock, Loader2, Info, Phone, User as UserIcon, MessageCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState(UserRole.PATIENT);
  
  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate sending a code
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setShowVerification(true);
      }, 1000);
  };

  const verifyAndCreateAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const isValid = await authService.verifyCode(verificationCode);
      
      if (isValid) {
          const user = await authService.register(regName, regEmail, regPhone, regPassword, regRole);
          onLogin(user);
      } else {
          setError('Código inválido. Tente 1234.');
          setLoading(false);
      }
  };

  const handleGoogleLogin = () => {
      setLoading(true);
      // Simulate OAuth delay
      setTimeout(async () => {
          // Mock a patient login via Google
          const user = await authService.login('julia@gmail.com', '123'); // Reusing existing user for demo
          if (user) onLogin(user);
          setLoading(false);
      }, 1500);
  };

  // Helper to fill form for demo purposes
  const fillDemo = (role: 'admin' | 'doc' | 'patient') => {
    setActiveTab('LOGIN');
    setPassword('123');
    if (role === 'admin') setEmail('admin@lumina.com');
    if (role === 'doc') setEmail('doc@lumina.com');
    if (role === 'patient') setEmail('julia@gmail.com');
  };

  return (
    <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[600px]">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <span className="text-xl font-bold text-stone-800">Lumina</span>
          </div>

          {!showVerification ? (
            <>
                {/* Tabs */}
                <div className="flex mb-8 border-b border-stone-100">
                    <button 
                        onClick={() => { setActiveTab('LOGIN'); setError(''); }}
                        className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'LOGIN' ? 'text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Entrar
                        {activeTab === 'LOGIN' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>}
                    </button>
                    <button 
                         onClick={() => { setActiveTab('REGISTER'); setError(''); }}
                        className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'REGISTER' ? 'text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Criar Conta
                        {activeTab === 'REGISTER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>}
                    </button>
                </div>

                {activeTab === 'LOGIN' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                        <h1 className="text-2xl font-bold text-stone-800">Bem-vindo de volta</h1>
                        <p className="text-stone-500 mb-4 text-sm">Insira suas credenciais para acessar.</p>
                        
                        <div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        </div>

                        <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        </div>

                        {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                            <Info size={16} />
                            {error}
                        </div>
                        )}

                        <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
                        </button>

                         <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-stone-400">Ou continue com</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                        <h1 className="text-2xl font-bold text-stone-800">Crie sua conta</h1>
                        <p className="text-stone-500 mb-4 text-sm">Preencha os dados abaixo.</p>

                         <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Qual o seu perfil?</label>
                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setRegRole(UserRole.PATIENT)}
                                    className={`flex-1 py-2 px-3 rounded-xl border font-medium text-sm transition-all ${regRole === UserRole.PATIENT ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}
                                >
                                    Sou Paciente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRegRole(UserRole.ADMIN)}
                                    className={`flex-1 py-2 px-3 rounded-xl border font-medium text-sm transition-all ${regRole === UserRole.ADMIN ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}
                                >
                                    Clínica / Prof.
                                </button>
                            </div>
                        </div>

                         <div>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input 
                                type="text" 
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                placeholder="Nome Completo"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                placeholder="E-mail"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                        </div>

                         <div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input 
                                type="tel" 
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                placeholder="WhatsApp / Celular"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input 
                                type="password" 
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                placeholder="Senha"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Cadastrar'}
                        </button>
                    </form>
                )}
            </>
          ) : (
            <div className="animate-fade-in text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <MessageCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Verifique seu número</h2>
                <p className="text-stone-500 mb-6">Enviamos um código de confirmação para o WhatsApp <strong>{regPhone}</strong>.</p>
                
                <form onSubmit={verifyAndCreateAccount} className="max-w-xs mx-auto space-y-4">
                     <input 
                        type="text" 
                        required
                        className="w-full text-center text-2xl tracking-widest py-3 rounded-xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                        placeholder="0000"
                        maxLength={4}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                     {error && (
                        <div className="text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Confirmar e Acessar'}
                    </button>
                    <button type="button" onClick={() => setShowVerification(false)} className="text-stone-400 hover:text-stone-600 text-sm">Voltar</button>
                </form>
            </div>
          )}

          {/* Demo shortcuts */}
          {!showVerification && activeTab === 'LOGIN' && (
            <div className="mt-8 pt-6 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center mb-3">Acesso Rápido (Demo)</p>
                <div className="flex justify-center gap-2">
                <button onClick={() => fillDemo('admin')} className="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Admin</button>
                <button onClick={() => fillDemo('doc')} className="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Profissional</button>
                <button onClick={() => fillDemo('patient')} className="text-xs bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-lg text-stone-600">Paciente</button>
                </div>
            </div>
          )}
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop")' }}>
          <div className="absolute inset-0 bg-primary-900/20 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="text-3xl font-bold mb-4">Beleza que inspira confiança.</h2>
            <p className="text-white/90">Gerencie sua clínica com elegância e eficiência em uma única plataforma.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;