import React, { useEffect, useState } from 'react';
import { User, UserRole, Appointment, Transaction, AppointmentStatus, AnamnesisStatus } from '../types';
import { dataService } from '../services/mockDb';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const apps = await dataService.getAppointments(user);
    const trans = await dataService.getTransactions(user);
    setAppointments(apps);
    setTransactions(trans);
  };

  const handleQuickConfirm = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await dataService.updateAppointmentStatus(id, AppointmentStatus.CONFIRMED);
    // Refresh all data as confirmation might affect finance projections
    loadData();
  };

  // Calculations
  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const upcomingAppointments = appointments.filter(a => new Date(a.date) > new Date() && a.status !== AppointmentStatus.CANCELLED).length;
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;

  const chartData = [
    { name: 'Seg', valor: 400 },
    { name: 'Ter', valor: 300 },
    { name: 'Qua', valor: 600 },
    { name: 'Qui', valor: 800 },
    { name: 'Sex', valor: 500 },
    { name: 'Sáb', valor: 900 },
    { name: 'Dom', valor: 100 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 dark:text-white">Olá, {user.name.split(' ')[0]}</h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Bem-vindo ao seu painel de controle.</p>
        </div>
        <div className="text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-full shadow-sm border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Patient Action Required Notification */}
      {user.role === UserRole.PATIENT && user.anamnesisStatus === AnamnesisStatus.REQUESTED && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-lg text-amber-600 dark:text-amber-200 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-amber-800 dark:text-amber-200 font-bold text-lg">Ficha de Anamnese Pendente</h3>
            <p className="text-amber-700 dark:text-amber-300 mt-1 mb-4">Seu profissional solicitou o preenchimento da sua ficha de saúde para melhor atendê-lo.</p>
            <button 
              onClick={() => navigate('/anamnesis')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-md shadow-amber-200 dark:shadow-none"
            >
              Preencher Agora
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Agendamentos Futuros" 
          value={upcomingAppointments} 
          icon={Calendar} 
          color="bg-primary-400" 
        />
        {user.role !== UserRole.PATIENT && (
          <StatCard 
            title="Receita Total" 
            value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} 
            icon={DollarSign} 
            color="bg-emerald-400" 
          />
        )}
        <StatCard 
          title="Atendimentos Realizados" 
          value={completedAppointments} 
          icon={CheckCircle} 
          color="bg-blue-400" 
        />
         <StatCard 
          title="Horas Pendentes" 
          value="12h" 
          icon={Clock} 
          color="bg-orange-400" 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Chart (Only for Admins/Pros) */}
        {user.role !== UserRole.PATIENT ? (
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
            <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-6">Performance Semanal</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#57534e" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1c1917', color: '#fff'}} 
                    itemStyle={{color: '#fff'}}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-700 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
             <h3 className="text-2xl font-bold mb-4 relative z-10">Cuidar de você é o nosso propósito.</h3>
             <p className="text-primary-100 mb-8 max-w-md relative z-10">Agende seu próximo procedimento e descubra o poder da sua melhor versão.</p>
             <button 
                onClick={() => navigate('/schedule')}
                className="bg-white text-primary-600 font-bold py-3 px-6 rounded-xl w-max hover:bg-primary-50 transition shadow-lg relative z-10"
             >
               Agendar Agora
             </button>
          </div>
        )}

        {/* Right Col - Recent Activity */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-6">Próximos Agendamentos</h3>
          <div className="space-y-4">
            {appointments.filter(a => a.status !== AppointmentStatus.CANCELLED).slice(0, 4).map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-transparent hover:border-stone-100 dark:hover:border-stone-700 group">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm shrink-0">
                  {new Date(apt.date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{apt.serviceName}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user.role === UserRole.PATIENT ? apt.professionalName : apt.patientName}</p>
                </div>
                
                {/* Actions */}
                {apt.status === AppointmentStatus.PENDING && (user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) ? (
                    <button 
                        onClick={(e) => handleQuickConfirm(e, apt.id)}
                        className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition"
                        title="Confirmar Agendamento"
                    >
                        <Check size={16} />
                    </button>
                ) : (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0
                    ${apt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        apt.status === AppointmentStatus.PENDING ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                    {apt.status === AppointmentStatus.CONFIRMED ? 'Confirmado' : 'Pendente'}
                    </span>
                )}
              </div>
            ))}
            {appointments.filter(a => a.status !== AppointmentStatus.CANCELLED).length === 0 && (
              <p className="text-stone-400 dark:text-stone-600 text-center py-4 text-sm">Nenhum agendamento futuro.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;