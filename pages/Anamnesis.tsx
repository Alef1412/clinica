import React, { useEffect, useState } from 'react';
import { User, UserRole, AnamnesisForm, AnamnesisStatus } from '../types';
import { dataService } from '../services/mockDb';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle, ArrowLeft, FileText } from 'lucide-react';

interface AnamnesisProps {
  user: User;
}

const Anamnesis: React.FC<AnamnesisProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>(); // Patient ID if professional is viewing
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<AnamnesisForm>>({
    bloodType: '',
    allergies: '',
    medications: '',
    surgeries: '',
    skinType: 'Normal',
    sunExposure: 'Baixa',
    smoker: false,
    notes: ''
  });

  const isProfessional = user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL;
  const targetPatientId = isProfessional ? id : user.id;

  useEffect(() => {
    if (targetPatientId) {
      loadAnamnesis(targetPatientId);
    }
  }, [targetPatientId]);

  const loadAnamnesis = async (pId: string) => {
    setLoading(true);
    const data = await dataService.getAnamnesis(pId);
    if (data) {
      setFormData(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatientId) return;
    
    await dataService.saveAnamnesis({
      ...formData as AnamnesisForm,
      patientId: targetPatientId
    });
    
    // Update local user state if it's the patient (in a real app, context or re-fetch would handle this)
    if (!isProfessional) {
        user.anamnesisStatus = AnamnesisStatus.COMPLETED;
    }
    
    navigate('/dashboard');
  };

  if (!targetPatientId) return <div className="p-8 text-stone-600 dark:text-stone-400">Paciente não encontrado.</div>;

  // READ ONLY MODE
  if (isProfessional) {
      if (loading) return <div className="p-8 text-stone-600 dark:text-stone-400">Carregando...</div>;
      if (!formData.updatedAt) return <div className="p-8 text-stone-600 dark:text-stone-400">Este paciente ainda não preencheu a ficha.</div>;

      return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate('/patients')} className="flex items-center text-stone-500 hover:text-primary-600 transition mb-4">
                <ArrowLeft size={20} className="mr-2"/> Voltar para Pacientes
            </button>
            <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                    <CheckCircle className="text-green-500" />
                    Ficha de Anamnese
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Tipo Sanguíneo</label>
                        <p className="text-stone-800 dark:text-stone-200 font-medium">{formData.bloodType || '-'}</p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Fumante</label>
                        <p className="text-stone-800 dark:text-stone-200 font-medium">{formData.smoker ? 'Sim' : 'Não'}</p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Tipo de Pele</label>
                        <p className="text-stone-800 dark:text-stone-200 font-medium">{formData.skinType}</p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Exposição Solar</label>
                        <p className="text-stone-800 dark:text-stone-200 font-medium">{formData.sunExposure}</p>
                     </div>
                     <div className="col-span-full space-y-1 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Alergias</label>
                        <p className="text-stone-800 dark:text-stone-200">{formData.allergies || 'Nenhuma relatada.'}</p>
                     </div>
                     <div className="col-span-full space-y-1 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Medicamentos em Uso</label>
                        <p className="text-stone-800 dark:text-stone-200">{formData.medications || 'Nenhum.'}</p>
                     </div>
                     <div className="col-span-full space-y-1 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Cirurgias Prévias</label>
                        <p className="text-stone-800 dark:text-stone-200">{formData.surgeries || 'Nenhuma.'}</p>
                     </div>
                     <div className="col-span-full space-y-1 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500">Observações Adicionais</label>
                        <p className="text-stone-800 dark:text-stone-200">{formData.notes || '-'}</p>
                     </div>
                </div>
            </div>
        </div>
      );
  }

  // PATIENT MODE
  if (user.anamnesisStatus === AnamnesisStatus.NONE) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
            <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-full text-stone-400 mb-4">
                <FileText size={48} />
            </div>
            <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300">Nenhuma ficha solicitada</h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-md">
                No momento, não há solicitações de preenchimento de ficha de anamnese pelo seu profissional.
            </p>
        </div>
      );
  }

  // If completed, show readonly or simple message.
  if (user.anamnesisStatus === AnamnesisStatus.COMPLETED) {
     return (
        <div className="max-w-2xl mx-auto text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6">
                <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">Ficha Enviada com Sucesso</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-8">Suas informações já foram registradas em nosso sistema.</p>
            <button onClick={() => navigate('/dashboard')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Voltar ao Dashboard
            </button>
        </div>
     );
  }

  // FORM EDIT MODE (REQUESTED)
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="bg-primary-600 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold">Ficha de Anamnese</h2>
            <p className="text-primary-100 mt-1">Por favor, responda com atenção para garantirmos a segurança do seu procedimento.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tipo Sanguíneo</label>
                    <select 
                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        value={formData.bloodType}
                        onChange={e => setFormData({...formData, bloodType: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Você fuma?</label>
                    <div className="flex gap-4 mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="smoker" checked={formData.smoker === true} onChange={() => setFormData({...formData, smoker: true})} className="accent-primary-600 w-5 h-5"/>
                            <span className="text-stone-700 dark:text-stone-300">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="smoker" checked={formData.smoker === false} onChange={() => setFormData({...formData, smoker: false})} className="accent-primary-600 w-5 h-5"/>
                            <span className="text-stone-700 dark:text-stone-300">Não</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tipo de Pele</label>
                    <select 
                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        value={formData.skinType}
                        onChange={e => setFormData({...formData, skinType: e.target.value})}
                    >
                        <option value="Normal">Normal</option>
                        <option value="Seca">Seca</option>
                        <option value="Oleosa">Oleosa</option>
                        <option value="Mista">Mista</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Exposição Solar</label>
                     <select 
                        className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        value={formData.sunExposure}
                        onChange={e => setFormData({...formData, sunExposure: e.target.value})}
                    >
                        <option value="Baixa">Baixa (Pouco sol)</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Alta">Alta (Diária/Intensa)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Alergias</label>
                <textarea 
                    rows={2}
                    placeholder="Liste medicamentos, alimentos ou substâncias..."
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors placeholder-stone-400"
                    value={formData.allergies}
                    onChange={e => setFormData({...formData, allergies: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Medicamentos em uso</label>
                <textarea 
                    rows={2}
                    placeholder="Liste medicamentos contínuos..."
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors placeholder-stone-400"
                    value={formData.medications}
                    onChange={e => setFormData({...formData, medications: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Cirurgias Prévias</label>
                <textarea 
                    rows={2}
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors"
                    value={formData.surgeries}
                    onChange={e => setFormData({...formData, surgeries: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Observações Adicionais</label>
                <textarea 
                    rows={3}
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white p-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button 
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all flex items-center gap-2"
                >
                    <Save size={20} />
                    Enviar Ficha
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Anamnesis;