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
    <div class="anamnesis-wrapper mx-auto animate-fade-in pb-5">
      <!-- Loading State -->
      <div *ngIf="loading()" class="p-5 text-center text-muted">
         <lucide-icon name="loader-2" class="animate-spin me-2"></lucide-icon> Carregando...
      </div>

      <ng-container *ngIf="!loading()">
         <!-- Not Found -->
         <div *ngIf="!targetPatientId()" class="p-5 text-center text-muted">
            Paciente não encontrado.
         </div>

         <!-- READ ONLY MODE (Professional) -->
         <div *ngIf="isProfessional() && targetPatientId()" class="anamnesis-read-only">
            <button (click)="navigateBack()" class="btn btn-link btn-back text-decoration-none d-flex align-items-center mb-4 p-0">
                <lucide-icon name="arrow-left" size="20" class="me-2"></lucide-icon> Voltar para Pacientes
            </button>
            
            <div *ngIf="!formData().updatedAt" class="empty-anamnesis-card p-5 text-center">
               Este paciente ainda não preencheu a ficha.
            </div>

            <div *ngIf="formData().updatedAt" class="anamnesis-card-premium shadow-sm p-4 p-md-5">
                <h2 class="section-title mb-5 d-flex align-items-center gap-3">
                    <lucide-icon name="check-circle" class="text-success" size="32"></lucide-icon>
                    Ficha de Anamnese
                </h2>
                <div class="row g-4">
                      <div class="col-12 col-md-6">
                         <div class="view-group">
                            <label class="view-label">Tipo Sanguíneo</label>
                            <p class="view-value mb-0">{{ formData().bloodType || '-' }}</p>
                         </div>
                      </div>
                      <div class="col-12 col-md-6">
                         <div class="view-group">
                            <label class="view-label">Fumante</label>
                            <p class="view-value mb-0">{{ formData().smoker ? 'Sim' : 'Não' }}</p>
                         </div>
                      </div>
                      <div class="col-12 col-md-6">
                         <div class="view-group">
                            <label class="view-label">Tipo de Pele</label>
                            <p class="view-value mb-0">{{ formData().skinType }}</p>
                         </div>
                      </div>
                      <div class="col-12 col-md-6">
                         <div class="view-group">
                            <label class="view-label">Exposição Solar</label>
                            <p class="view-value mb-0">{{ formData().sunExposure }}</p>
                         </div>
                      </div>
                      <div class="col-12">
                         <div class="view-group-premium p-4 rounded-4">
                            <label class="view-label">Alergias</label>
                            <p class="view-value mb-0">{{ formData().allergies || 'Nenhuma relatada.' }}</p>
                         </div>
                      </div>
                      <div class="col-12">
                         <div class="view-group-premium p-4 rounded-4">
                            <label class="view-label">Medicamentos em Uso</label>
                            <p class="view-value mb-0">{{ formData().medications || 'Nenhum.' }}</p>
                         </div>
                      </div>
                      <div class="col-12">
                         <div class="view-group-premium p-4 rounded-4">
                            <label class="view-label">Cirurgias Prévias</label>
                            <p class="view-value mb-0">{{ formData().surgeries || 'Nenhuma.' }}</p>
                         </div>
                      </div>
                      <div class="col-12">
                         <div class="view-group-premium p-4 rounded-4">
                            <label class="view-label">Observações Adicionais</label>
                            <p class="view-value mb-0">{{ formData().notes || '-' }}</p>
                         </div>
                      </div>
                </div>
            </div>
         </div>

         <!-- PATIENT MODE -->
         <ng-container *ngIf="!isProfessional()">
            <!-- No request -->
            <div *ngIf="anamnesisStatus() === 'NONE'" class="d-flex flex-column align-items-center justify-content-center py-10 text-center px-4">
                <div class="empty-icon-box p-4 rounded-circle mb-4 d-flex align-items-center justify-content-center">
                    <lucide-icon name="file-text" size="48"></lucide-icon>
                </div>
                <h2 class="empty-title mb-2">Nenhuma ficha solicitada</h2>
                <p class="empty-desc mb-0 mx-auto max-w-400">
                    No momento, não há solicitações de preenchimento de ficha de anamnese pelo seu profissional.
                </p>
            </div>

            <!-- Completed -->
            <div *ngIf="anamnesisStatus() === 'COMPLETED'" class="completed-state text-center py-10">
                <div class="icon-box-success mx-auto d-flex align-items-center justify-content-center mb-4">
                    <lucide-icon name="check-circle" size="32"></lucide-icon>
                </div>
                <h2 class="section-title mb-2">Ficha Enviada com Sucesso</h2>
                <p class="section-subtitle mb-5">Suas informações já foram registradas em nosso sistema.</p>
                <button (click)="navigateTo('/dashboard')" class="btn btn-link text-primary font-weight-bold text-decoration-none">
                    Voltar ao Dashboard
                </button>
            </div>

            <!-- Form Edit Mode -->
            <div *ngIf="anamnesisStatus() === 'REQUESTED'" class="anamnesis-card-premium shadow-lg overflow-hidden border-0">
                <div class="card-header-premium bg-primary p-4 p-md-5 text-white">
                    <h2 class="mb-1 font-weight-bold">Ficha de Anamnese</h2>
                    <p class="mb-0 opacity-80">Por favor, responda com atenção para garantirmos a segurança do seu procedimento.</p>
                </div>

                <form (submit)="handleSubmit($event)" class="p-4 p-md-5">
                    <div class="row g-4 mb-4">
                        <div class="col-12 col-md-6">
                            <label class="form-label-premium">Tipo Sanguíneo</label>
                            <select name="blood" [(ngModel)]="localFormData.bloodType" class="form-select-premium">
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
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label-premium d-block mb-3">Você fuma?</label>
                            <div class="d-flex gap-4">
                                <div class="form-check custom-radio">
                                    <input class="form-check-input" type="radio" name="smoker" [value]="true" [(ngModel)]="localFormData.smoker" id="smokerYes">
                                    <label class="form-check-label" for="smokerYes">Sim</label>
                                </div>
                                <div class="form-check custom-radio">
                                    <input class="form-check-input" type="radio" name="smoker" [value]="false" [(ngModel)]="localFormData.smoker" id="smokerNo">
                                    <label class="form-check-label" for="smokerNo">Não</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label-premium">Tipo de Pele</label>
                            <select name="skin" [(ngModel)]="localFormData.skinType" class="form-select-premium">
                                <option value="Normal">Normal</option>
                                <option value="Seca">Seca</option>
                                <option value="Oleosa">Oleosa</option>
                                <option value="Mista">Mista</option>
                            </select>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label-premium">Exposição Solar</label>
                             <select name="sun" [(ngModel)]="localFormData.sunExposure" class="form-select-premium">
                                <option value="Baixa">Baixa (Pouco sol)</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Alta">Alta (Diária/Intensa)</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label-premium">Alergias</label>
                        <textarea name="allergies" rows="2" [(ngModel)]="localFormData.allergies" placeholder="Liste medicamentos, alimentos ou substâncias..." class="form-control-premium textarea-premium resize-none"></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="form-label-premium">Medicamentos em uso</label>
                        <textarea name="meds" rows="2" [(ngModel)]="localFormData.medications" placeholder="Liste medicamentos contínuos..." class="form-control-premium textarea-premium resize-none"></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="form-label-premium">Cirurgias Prévias</label>
                        <textarea name="surg" rows="2" [(ngModel)]="localFormData.surgeries" class="form-control-premium textarea-premium resize-none"></textarea>
                    </div>

                    <div class="mb-5">
                        <label class="form-label-premium">Observações Adicionais</label>
                        <textarea name="notes" rows="3" [(ngModel)]="localFormData.notes" class="form-control-premium textarea-premium resize-none"></textarea>
                    </div>

                    <div class="pt-4 border-top d-flex justify-content-end">
                        <button type="submit" class="btn btn-primary-premium px-5 py-3 d-flex align-items-center gap-2">
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
    .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .section-subtitle { font-size: 0.875rem; color: var(--text-color-secondary); }

    .btn-back { color: var(--text-color-secondary); font-weight: 700; transition: all 0.2s; &:hover { color: var(--primary-color); } }

    .anamnesis-card-premium {
      background: var(--surface-card); border-radius: 24px;
      border: 1px solid var(--surface-border);
    }

    .empty-anamnesis-card {
      background: var(--surface-hover); border-radius: 20px;
      border: 2px dashed var(--surface-border); color: var(--text-color-tertiary);
    }

    .view-group { display: flex; flex-direction: column; gap: 4px; }
    .view-label { font-size: 0.75rem; font-weight: 700; color: var(--text-color-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
    .view-value { font-weight: 600; color: var(--text-color); font-size: 1rem; }

    .view-group-premium { background: var(--surface-hover); border-left: 4px solid var(--primary-color); }

    /* Patient Mode Elements */
    .empty-icon-box { width: 96px; height: 96px; background: var(--surface-hover); color: var(--text-color-tertiary); }
    .empty-title { font-size: 1.25rem; font-weight: 800; color: var(--text-color); }
    .empty-desc { font-size: 0.9375rem; color: var(--text-color-secondary); line-height: 1.5; }

    .completed-state .icon-box-success { width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; }

    .card-header-premium { background: var(--grad-primary) !important; }

    .form-label-premium { font-size: 0.8125rem; font-weight: 700; color: var(--text-color-secondary); margin-bottom: 8px; text-transform: uppercase; }
    .form-control-premium, .form-select-premium {
      border-radius: 12px; padding: 12px; border: 1px solid var(--surface-border);
      background: var(--surface-hover); color: var(--text-color); font-size: 0.9375rem;
      transition: all 0.2s;
      &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); outline: none; }
    }
    .textarea-premium { min-height: 80px; }

    .custom-radio .form-check-input {
      width: 20px; height: 20px; cursor: pointer;
      &:checked { background-color: var(--primary-color); border-color: var(--primary-color); }
      &:focus { border-color: var(--primary-color); box-shadow: 0 0 0 0.25rem rgba(244, 63, 94, 0.1); }
    }
    .custom-radio .form-check-label { font-weight: 600; color: var(--text-color); cursor: pointer; padding-left: 4px; }

    .btn-primary-premium {
      background: var(--grad-primary); border: 0; border-radius: 12px; color: white; font-weight: 700;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3); color: white; }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
