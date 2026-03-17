import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, AnamnesisForm, AnamnesisStatus } from '../../models/types';

@Component({
  selector: 'app-anamnesis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in pb-10">
      <!-- Loading State -->
      <div *ngIf="loading()" class="p-8 text-center text-stone-500 dark:text-stone-400">
         <lucide-icon name="loader-2" class="animate-spin inline mr-2"></lucide-icon> Carregando...
      </div>

      <ng-container *ngIf="!loading()">
         <!-- Not Found -->
         <div *ngIf="!targetPatientId()" class="p-8 text-stone-600 dark:text-stone-400 text-center">
            Paciente não encontrado.
         </div>

         <!-- READ ONLY MODE (Professional) -->
         <div *ngIf="isProfessional() && targetPatientId()" class="space-y-6">
            <button (click)="navigateBack()" class="flex items-center text-stone-500 hover:text-primary transition mb-4">
                <lucide-icon name="arrow-left" size="20" class="mr-2"></lucide-icon> Voltar para Pacientes
            </button>
            
            <div *ngIf="!formData().updatedAt" class="p-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 text-center text-stone-500">
               Este paciente ainda não preencheu a ficha.
            </div>

            <div *ngIf="formData().updatedAt" class="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
                <h2 class="text-2xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                    <lucide-icon name="check-circle" class="text-green-500"></lucide-icon>
                    Ficha de Anamnese
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div class="view-group">
                        <label class="view-label">Tipo Sanguíneo</label>
                        <p class="view-value">{{ formData().bloodType || '-' }}</p>
                     </div>
                     <div class="view-group">
                        <label class="view-label">Fumante</label>
                        <p class="view-value">{{ formData().smoker ? 'Sim' : 'Não' }}</p>
                     </div>
                     <div class="view-group">
                        <label class="view-label">Tipo de Pele</label>
                        <p class="view-value">{{ formData().skinType }}</p>
                     </div>
                     <div class="view-group">
                        <label class="view-label">Exposição Solar</label>
                        <p class="view-value">{{ formData().sunExposure }}</p>
                     </div>
                     <div class="col-span-full view-group bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label class="view-label">Alergias</label>
                        <p class="view-value">{{ formData().allergies || 'Nenhuma relatada.' }}</p>
                     </div>
                     <div class="col-span-full view-group bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label class="view-label">Medicamentos em Uso</label>
                        <p class="view-value">{{ formData().medications || 'Nenhum.' }}</p>
                     </div>
                     <div class="col-span-full view-group bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label class="view-label">Cirurgias Prévias</label>
                        <p class="view-value">{{ formData().surgeries || 'Nenhuma.' }}</p>
                     </div>
                     <div class="col-span-full view-group bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                        <label class="view-label">Observações Adicionais</label>
                        <p class="view-value">{{ formData().notes || '-' }}</p>
                     </div>
                </div>
            </div>
         </div>

         <!-- PATIENT MODE -->
         <ng-container *ngIf="!isProfessional()">
            <!-- No request -->
            <div *ngIf="anamnesisStatus() === 'NONE'" class="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                <div class="bg-stone-100 dark:bg-stone-800 p-4 rounded-full text-stone-400 mb-4">
                    <lucide-icon name="file-text" size="48"></lucide-icon>
                </div>
                <h2 class="text-xl font-bold text-stone-700 dark:text-stone-300">Nenhuma ficha solicitada</h2>
                <p class="text-stone-500 dark:text-stone-400 mt-2 max-w-md">
                    No momento, não há solicitações de preenchimento de ficha de anamnese pelo seu profissional.
                </p>
            </div>

            <!-- Completed -->
            <div *ngIf="anamnesisStatus() === 'COMPLETED'" class="max-w-2xl mx-auto text-center py-10">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6">
                    <lucide-icon name="check-circle" size="32"></lucide-icon>
                </div>
                <h2 class="text-2xl font-bold text-stone-800 dark:text-white mb-2">Ficha Enviada com Sucesso</h2>
                <p class="text-stone-500 dark:text-stone-400 mb-8">Suas informações já foram registradas em nosso sistema.</p>
                <button (click)="navigateTo('/dashboard')" class="text-primary font-medium hover:underline">
                    Voltar ao Dashboard
                </button>
            </div>

            <!-- Form Edit Mode -->
            <div *ngIf="anamnesisStatus() === 'REQUESTED'" class="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div class="bg-primary px-8 py-6 text-white">
                    <h2 class="text-2xl font-bold">Ficha de Anamnese</h2>
                    <p class="text-white/80 mt-1">Por favor, responda com atenção para garantirmos a segurança do seu procedimento.</p>
                </div>

                <form (submit)="handleSubmit($event)" class="p-8 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="form-label">Tipo Sanguíneo</label>
                            <select name="blood" [(ngModel)]="localFormData.bloodType" class="form-input">
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
                            <label class="form-label">Você fuma?</label>
                            <div class="flex gap-4 mt-3">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="smoker" [value]="true" [(ngModel)]="localFormData.smoker" class="w-5 h-5 accent-primary"/>
                                    <span class="text-stone-700 dark:text-stone-300">Sim</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="smoker" [value]="false" [(ngModel)]="localFormData.smoker" class="w-5 h-5 accent-primary"/>
                                    <span class="text-stone-700 dark:text-stone-300">Não</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">Tipo de Pele</label>
                            <select name="skin" [(ngModel)]="localFormData.skinType" class="form-input">
                                <option value="Normal">Normal</option>
                                <option value="Seca">Seca</option>
                                <option value="Oleosa">Oleosa</option>
                                <option value="Mista">Mista</option>
                            </select>
                        </div>

                        <div>
                            <label class="form-label">Exposição Solar</label>
                             <select name="sun" [(ngModel)]="localFormData.sunExposure" class="form-input">
                                <option value="Baixa">Baixa (Pouco sol)</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Alta">Alta (Diária/Intensa)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="form-label">Alergias</label>
                        <textarea name="allergies" rows="2" [(ngModel)]="localFormData.allergies" placeholder="Liste medicamentos, alimentos ou substâncias..." class="form-input h-auto resize-none"></textarea>
                    </div>

                    <div>
                        <label class="form-label">Medicamentos em uso</label>
                        <textarea name="meds" rows="2" [(ngModel)]="localFormData.medications" placeholder="Liste medicamentos contínuos..." class="form-input h-auto resize-none"></textarea>
                    </div>

                    <div>
                        <label class="form-label">Cirurgias Prévias</label>
                        <textarea name="surg" rows="2" [(ngModel)]="localFormData.surgeries" class="form-input h-auto resize-none"></textarea>
                    </div>

                    <div>
                        <label class="form-label">Observações Adicionais</label>
                        <textarea name="notes" rows="3" [(ngModel)]="localFormData.notes" class="form-input h-auto resize-none"></textarea>
                    </div>

                    <div class="pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                        <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            <lucide-icon name="save" size="20"></lucide-icon>
                            Enviar Ficha
                        </button>
                    </div>
                </form>
            </div>
         </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .bg-primary { background-color: var(--primary-color); }
    .bg-primary-dark { background-color: #db2777; }
    .text-primary { color: var(--primary-color); }
    
    .view-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .view-label { font-size: 0.75rem; font-weight: 600; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.05em; }
    .view-value { font-weight: 500; color: #1c1917; }
    :host-context(.dark) .view-value { color: #e7e5e4; }
    
    .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #44403c; margin-bottom: 0.25rem; }
    :host-context(.dark) .form-label { color: #d6d3d1; }
    .form-input { 
      width: 100%; border-radius: 0.75rem; border: 1px solid #e7e5e4; 
      background-color: #f5f5f4; padding: 0.75rem; outline: none; transition: all 0.2s;
    }
    :host-context(.dark) .form-input { background-color: #1c1917; border-color: #292524; color: white; }
    .form-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px var(--primary-color-50); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class AnamnesisComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockDb = inject(MockDbService);

  loading = signal(true);
  currentUser = signal<any>(null);
  targetPatientId = signal<string | null>(null);
  isProfessional = signal(false);
  anamnesisStatus = signal<string>(AnamnesisStatus.NONE);
  
  formData = signal<Partial<AnamnesisForm>>({});
  localFormData: Partial<AnamnesisForm> = {
    skinType: 'Normal',
    sunExposure: 'Baixa',
    smoker: false
  };

  ngOnInit() {
    // Mock current user
    this.currentUser.set({
      id: 'pat_1',
      role: UserRole.PATIENT,
      anamnesisStatus: AnamnesisStatus.REQUESTED
    });
    
    const idParam = this.route.snapshot.paramMap.get('id');
    const role = this.currentUser().role;
    this.isProfessional.set(role === UserRole.ADMIN || role === UserRole.PROFESSIONAL);
    this.targetPatientId.set(this.isProfessional() ? idParam : this.currentUser().id);
    this.anamnesisStatus.set(this.currentUser().anamnesisStatus);

    if (this.targetPatientId()) {
      this.loadAnamnesis(this.targetPatientId()!);
    } else {
      this.loading.set(false);
    }
  }

  async loadAnamnesis(pId: string) {
    this.loading.set(true);
    const data = await this.mockDb.getAnamnesis(pId);
    if (data) {
      this.formData.set(data);
      this.localFormData = { ...data };
    }
    this.loading.set(false);
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.targetPatientId()) return;
    
    await this.mockDb.saveAnamnesis({
      ...this.localFormData as AnamnesisForm,
      patientId: this.targetPatientId()!
    });
    
    this.anamnesisStatus.set(AnamnesisStatus.COMPLETED);
    this.router.navigate(['/dashboard']);
  }

  navigateBack() {
    this.router.navigate(['/patients']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
