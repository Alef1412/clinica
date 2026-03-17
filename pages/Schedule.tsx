import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Appointment, Product, AppointmentStatus } from '../types';
import { dataService } from '../services/mockDb';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Check, Clock, User as UserIcon, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';

interface ScheduleProps {
  user: User;
}

// Reusable Mini Calendar Component
const MiniCalendar = ({ 
    selectedDate, 
    onSelect, 
    onClose 
}: { 
    selectedDate: Date, 
    onSelect: (d: Date) => void, 
    onClose: () => void 
}) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    const prevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(new Date(year, month - 1, 1));
    };
    const nextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(new Date(year, month + 1, 1));
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const isSelected = d.toDateString() === selectedDate.toDateString();
        const isToday = d.toDateString() === new Date().toDateString();
        
        days.push(
            <button
                type="button"
                key={i}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(d);
                }}
                className={`h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-primary-600 text-white font-bold' : 
                      isToday ? 'bg-stone-100 dark:bg-stone-700 text-primary-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'}
                `}
            >
                {i}
            </button>
        );
    }

    return (
        <div 
            className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-stone-800 p-4 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 w-64 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"><ChevronLeft size={16}/></button>
                <span className="font-bold text-sm text-stone-800 dark:text-white capitalize">
                    {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-300"><ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['D','S','T','Q','Q','S','S'].map(d => (
                    <div key={d} className="h-8 w-8 flex items-center justify-center text-xs font-bold text-stone-400">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
};

const Schedule: React.FC<ScheduleProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Google Sync State
  const [googleSynced, setGoogleSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHeaderCalendar, setShowHeaderCalendar] = useState(false);
  
  // Modal Form State
  const [showModalCalendar, setShowModalCalendar] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    loadData();
  }, [user, googleSynced]);

  const loadData = async () => {
    let apps = await dataService.getAppointments(user);
    
    // If synced, merge google events
    if (googleSynced) {
        const googleApps = await dataService.getGoogleEvents();
        apps = [...apps, ...googleApps];
    }
    
    const servs = await dataService.getProducts();
    setAppointments(apps);
    setServices(servs);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    const dateIso = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    await dataService.createAppointment({
      patientId: user.role === UserRole.PATIENT ? user.id : '1', 
      patientName: user.role === UserRole.PATIENT ? user.name : 'Walk-in Client',
      professionalId: '2', // Mock: always Dr. Lucas for now
      professionalName: 'Dr. Lucas',
      serviceId: service.id,
      serviceName: service.name,
      date: dateIso,
      price: service.price,
      source: 'LUMINA'
    });

    setIsModalOpen(false);
    loadData();
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleStatusChange = async (status: AppointmentStatus) => {
      if (!selectedAppointment) return;
      await dataService.updateAppointmentStatus(selectedAppointment.id, status);
      setSelectedAppointment(null);
      loadData();
  };

  const handleGoogleSync = () => {
    if (googleSynced) {
        // Disconnect
        if(confirm("Deseja desconectar sua conta do Google Calendar?")) {
            setGoogleSynced(false);
        }
        return;
    }

    // Connect Simulation
    setIsSyncing(true);
    // Simulate OAuth Popup duration
    setTimeout(() => {
        setIsSyncing(false);
        setGoogleSynced(true);
        // Alert to inform user (simulating the end of auth flow)
        // In a real app, this would happen after redirect
    }, 2000);
  };

  // Calendar Logic
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0,0,0,0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === date.getDate() && 
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear() &&
             apt.status !== AppointmentStatus.CANCELLED;
    });
  };

  const getDuration = (apt: Appointment) => {
      if (apt.source === 'GOOGLE') return 60; // Default for external
      const service = services.find(s => s.id === apt.serviceId);
      return service ? service.durationMin : 60;
  };

  const onSlotClick = (date: Date, hour: number) => {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      setSelectedDate(dateStr);
      setSelectedTime(timeStr);
      setIsModalOpen(true);
  };

  const onEventClick = (e: React.MouseEvent, apt: Appointment) => {
      e.stopPropagation();
      setSelectedAppointment(apt);
  };

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL;

  return (
    <div className="space-y-6 h-full flex flex-col" onClick={() => { setShowHeaderCalendar(false); setShowModalCalendar(false); }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-white flex items-center gap-2">
             <CalendarIcon size={28} className="text-primary-600" />
             Agenda
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Gerencie suas consultas semanais.</p>
        </div>
        
        <div className="flex gap-3">
             <button 
                onClick={handleGoogleSync}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-xl font-medium border transition-all flex items-center gap-2 text-sm shadow-sm
                    ${googleSynced 
                        ? 'bg-white dark:bg-stone-800 text-green-600 border-green-200 dark:border-green-800 hover:border-red-200 hover:text-red-500' 
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'}`}
                title={googleSynced ? "Clique para desconectar" : "Sincronizar com Google"}
            >
                {isSyncing ? <Loader2 className="animate-spin" size={16}/> : 
                 googleSynced ? <div className="relative"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-4 h-4" alt="GCal"/><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div></div> : 
                 <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-4 h-4" alt="GCal"/>
                }
                {isSyncing ? 'Conectando...' : googleSynced ? 'Sincronizado' : 'Conectar Google'}
            </button>
            <button 
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary-200 dark:shadow-none flex items-center gap-2 transition-all text-sm"
            >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Agendamento</span>
            </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 relative z-20">
         <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); prevWeek(); }} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300">
                <ChevronLeft size={20} />
            </button>
            
            {/* Date Display with Mini Calendar Trigger */}
            <div className="relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowHeaderCalendar(!showHeaderCalendar);
                        setShowModalCalendar(false); // Close other if open
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border border-transparent
                        ${showHeaderCalendar ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-200 dark:hover:border-stone-700'}`}
                >
                    <CalendarIcon size={18} className={`${showHeaderCalendar ? 'text-primary-600' : 'text-stone-800'} dark:text-stone-200`}/>
                    <span className="font-semibold text-stone-800 dark:text-white">
                        {startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                </button>
                {showHeaderCalendar && (
                    <MiniCalendar 
                        selectedDate={currentDate} 
                        onSelect={(d) => {
                            setCurrentDate(d);
                            setShowHeaderCalendar(false);
                        }}
                        onClose={() => setShowHeaderCalendar(false)}
                    />
                )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); nextWeek(); }} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300">
                <ChevronRight size={20} />
            </button>
         </div>
         <div className="flex gap-4 px-4 text-xs font-medium">
             <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span className="text-stone-600 dark:text-stone-400">Dr. Lucas</span>
             </div>
             {googleSynced && (
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-red-500 bg-white"></div>
                    <span className="text-stone-600 dark:text-stone-400">Google Calendar</span>
                </div>
             )}
         </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-auto shadow-sm flex flex-col min-h-[600px]">
        {/* Header Row */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
            <div className="w-16 border-r border-stone-200 dark:border-stone-800 shrink-0"></div> {/* Time Col Header */}
            {weekDays.map((date, i) => {
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                    <div key={i} className="flex-1 py-3 text-center border-r border-stone-200 dark:border-stone-800 min-w-[100px]">
                        <p className={`text-xs uppercase font-semibold mb-1 ${isToday ? 'text-primary-600' : 'text-stone-600 dark:text-stone-400'}`}>
                            {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </p>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-lg font-bold ${isToday ? 'bg-primary-600 text-white' : 'text-stone-800 dark:text-stone-200'}`}>
                            {date.getDate()}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Time Grid */}
        <div className="flex flex-1 relative">
            {/* Time Axis */}
            <div className="w-16 shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">
                {hours.map(hour => (
                    <div key={hour} className="h-[60px] text-right pr-2 pt-2 text-xs text-stone-500 dark:text-stone-500 relative">
                        {hour}:00
                    </div>
                ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((date, dayIndex) => {
                 const dayApps = getAppointmentsForDay(date);
                 return (
                    <div key={dayIndex} className="flex-1 border-r border-stone-200 dark:border-stone-800 relative min-w-[100px]">
                        {/* Grid Lines */}
                        {hours.map(hour => (
                            <div 
                                key={hour} 
                                className="h-[60px] border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onSlotClick(date, hour); }}
                            ></div>
                        ))}

                        {/* Events */}
                        {dayApps.map(apt => {
                            const aptDate = new Date(apt.date);
                            const startHour = aptDate.getHours();
                            const startMin = aptDate.getMinutes();
                            
                            // Check if event is within viewable hours (8-20)
                            if (startHour < 8 || startHour > 20) return null;

                            const top = (startHour - 8) * 60 + startMin; // 60px per hour
                            const duration = getDuration(apt);
                            const height = duration; 
                            
                            const isExternal = apt.source === 'GOOGLE';
                            const isPending = apt.status === AppointmentStatus.PENDING;
                            
                            // Style logic
                            let bgColor, borderColor, textColor;
                            
                            if (isExternal) {
                                bgColor = '#ffffff'; // White bg
                                borderColor = '#ea4335'; // Google Red
                                textColor = '#333333';
                            } else if (isPending) {
                                bgColor = '#fef3c7'; // Amber 100
                                borderColor = '#f59e0b'; // Amber 500
                                textColor = '#92400e'; // Amber 800
                            } else {
                                const baseColor = user.role === UserRole.PATIENT ? '#10b981' : (apt.professionalColor || '#3b82f6');
                                bgColor = `${baseColor}20`; // Low opacity
                                borderColor = baseColor;
                                textColor = baseColor;
                            }

                            return (
                                <div
                                    key={apt.id}
                                    onClick={(e) => onEventClick(e, apt)}
                                    className={`absolute left-1 right-1 rounded-md p-1.5 text-xs shadow-sm border-l-4 overflow-hidden cursor-pointer hover:brightness-95 transition z-10 
                                        ${isPending ? 'border-dashed' : ''} 
                                        ${isExternal ? 'border border-l-[4px]' : ''}`}
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        backgroundColor: bgColor,
                                        borderLeftColor: borderColor,
                                        borderTopColor: isExternal ? borderColor : undefined, // Box border for external
                                        borderRightColor: isExternal ? borderColor : undefined,
                                        borderBottomColor: isExternal ? borderColor : undefined,
                                        color: isModalOpen || selectedAppointment ? 'transparent' : '',
                                    }}
                                    title={`${apt.serviceName} - ${apt.status}`}
                                >
                                    <div className={`font-bold truncate flex items-center gap-1`} style={{color: textColor}}>
                                        {isExternal && <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-3 h-3 inline" />}
                                        {isPending && "(Pendente)"} {apt.serviceName}
                                    </div>
                                    <div className={`truncate text-[10px] opacity-80`} style={{color: textColor}}>
                                        {user.role === UserRole.PATIENT ? apt.professionalName : apt.patientName}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 );
            })}
        </div>
      </div>

      {/* Create Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up border border-stone-200 dark:border-stone-700" onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBook} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Procedimento</label>
                <select 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Data</label>
                  
                  {/* Custom Date Input Trigger */}
                  <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowModalCalendar(!showModalCalendar);
                    }}
                    className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-2.5 outline-none transition-colors cursor-pointer flex items-center justify-between
                        ${showModalCalendar ? 'ring-2 ring-primary-500 border-primary-500' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}
                    `}
                  >
                     <span className={`${!selectedDate && 'text-stone-400'}`}>
                        {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecione...'}
                     </span>
                     <CalendarIcon size={18} className="text-stone-500"/>
                  </div>

                  {/* Calendar Popup */}
                  {showModalCalendar && (
                      <MiniCalendar 
                        selectedDate={selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date()}
                        onSelect={(d) => {
                            setSelectedDate(d.toISOString().split('T')[0]);
                            setShowModalCalendar(false);
                        }}
                        onClose={() => setShowModalCalendar(false)}
                      />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Hora</label>
                  <input 
                    type="time" 
                    required
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details/Confirm Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedAppointment(null)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-stone-200 dark:border-stone-700" onClick={(e) => e.stopPropagation()}>
            {/* Header matches source style */}
            <div className={`px-6 py-4 flex justify-between items-center 
                ${selectedAppointment.source === 'GOOGLE' ? 'bg-white border-b border-stone-200' : 
                  selectedAppointment.status === AppointmentStatus.PENDING ? 'bg-amber-500' : 'bg-stone-800'}`}>
              
              <h3 className={`font-bold text-lg flex items-center gap-2 ${selectedAppointment.source === 'GOOGLE' ? 'text-stone-800' : 'text-white'}`}>
                 {selectedAppointment.source === 'GOOGLE' ? <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-5 h-5"/> : 
                  selectedAppointment.status === AppointmentStatus.PENDING ? <AlertCircle size={20}/> : <CalendarIcon size={20}/>}
                 {selectedAppointment.source === 'GOOGLE' ? 'Evento Externo' : 'Detalhes do Agendamento'}
              </h3>
              <button onClick={() => setSelectedAppointment(null)} className={`${selectedAppointment.source === 'GOOGLE' ? 'text-stone-500 hover:text-stone-800' : 'text-white/80 hover:text-white'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               {selectedAppointment.source === 'GOOGLE' ? (
                   <div className="text-center p-4">
                       <p className="text-stone-600 dark:text-stone-300">Este evento foi importado do Google Calendar.</p>
                       <p className="text-sm text-stone-400 mt-2">Para editar, acesse sua conta Google.</p>
                   </div>
               ) : (
                <>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-800 dark:text-white">{selectedAppointment.patientName}</h4>
                            <p className="text-sm text-stone-500 dark:text-stone-400">Paciente</p>
                        </div>
                    </div>
                </>
               )}

               <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                        <CalendarIcon size={18} className="text-primary-500" />
                        <span className="font-medium">
                            {new Date(selectedAppointment.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                        <Clock size={18} className="text-primary-500" />
                        <span className="font-medium">
                            {new Date(selectedAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                        <Check size={18} className="text-primary-500" />
                        <span className="font-medium">{selectedAppointment.serviceName}</span>
                    </div>
                    {selectedAppointment.source !== 'GOOGLE' && (
                        <div className="pt-2 mt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                            <span className="text-xs font-semibold uppercase text-stone-400">Status</span>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold 
                                ${selectedAppointment.status === AppointmentStatus.PENDING ? 'bg-amber-100 text-amber-700' : 
                                selectedAppointment.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {selectedAppointment.status}
                            </span>
                        </div>
                    )}
               </div>

               {/* Actions for Professionals/Admins */}
               {canEdit && selectedAppointment.source !== 'GOOGLE' && (
                   <div className="grid grid-cols-2 gap-3 pt-2">
                       {selectedAppointment.status === AppointmentStatus.PENDING && (
                           <button 
                                onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
                                className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                           >
                               <Check size={18} /> Confirmar
                           </button>
                       )}
                       
                       <button 
                            onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition"
                        >
                           Cancelar
                       </button>
                       <button 
                            onClick={() => setSelectedAppointment(null)}
                            className="bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 font-semibold py-3 rounded-xl transition"
                        >
                           Fechar
                       </button>
                   </div>
               )}

               {/* Actions for Patients (Cancel only) */}
               {!canEdit && selectedAppointment.status !== AppointmentStatus.CANCELLED && selectedAppointment.source !== 'GOOGLE' && (
                    <button 
                        onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition mt-2"
                    >
                        Cancelar Agendamento
                    </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;