import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, AnamnesisForm, AnamnesisStatus } from '../../models/types';

// PrimeNG v18 standalone imports
import { ButtonModule } from 'primeng/button';
import { Tabs } from 'primeng/tabs';
import { TabList } from 'primeng/tabs';
import { Tab } from 'primeng/tabs';
import { TabPanel } from 'primeng/tabs';
import { TabPanels } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-anamnesis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    TagModule,
    DividerModule,
    ProgressSpinnerModule,
    CardModule
  ],
  template: `
    <div class="anamnesis-page animate-fade-in">

      <!-- Loading -->
      <div *ngIf="loading()" class="loading-overlay d-flex flex-column align-items-center justify-content-center gap-3">
        <p-progressSpinner strokeWidth="4" animationDuration=".8s" styleClass="lumina-spinner" />
        <p class="text-muted fw-semibold">Carregando ficha...</p>
      </div>

      <ng-container *ngIf="!loading()">

        <!-- ─── PROFESSIONAL / READ-ONLY VIEW ─── -->
        <ng-container *ngIf="isProfessional() && targetPatientId()">
          <div class="page-header d-flex align-items-center justify-content-between mb-5">
            <div class="d-flex align-items-center gap-3">
              <button pButton type="button" icon="pi pi-arrow-left" label="Voltar" severity="secondary" outlined (click)="navigateBack()"></button>
              <div>
                <h2 class="page-title mb-0">Ficha de Anamnese</h2>
                <p class="page-subtitle mb-0">Informações registradas pelo paciente</p>
              </div>
            </div>
            <p-tag *ngIf="formData().updatedAt" value="Ficha Completa" severity="success" icon="pi pi-check-circle" styleClass="px-3 py-2" />
            <p-tag *ngIf="!formData().updatedAt" value="Não Preenchida" severity="warn" icon="pi pi-clock" styleClass="px-3 py-2" />
          </div>

          <!-- Empty state -->
          <div *ngIf="!formData().updatedAt" class="empty-state d-flex flex-column align-items-center justify-content-center text-center py-5 gap-4">
            <div class="empty-icon-ring d-flex align-items-center justify-content-center">
              <i class="pi pi-file-edit" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
            </div>
            <div>
              <h3 class="fw-bold mb-1" style="color:var(--text-color)">Nenhuma ficha registrada ainda</h3>
              <p class="text-muted mb-0">O paciente ainda não preencheu sua anamnese.</p>
            </div>
          </div>

          <!-- Filled data -->
          <div *ngIf="formData().updatedAt">
            <p-card styleClass="info-card mb-4">
              <ng-template pTemplate="header">
                <div class="card-section-header d-flex align-items-center gap-2 px-4 pt-4">
                  <i class="pi pi-user-circle" style="font-size:1.25rem; color: var(--primary-color)"></i>
                  <span class="card-section-title">Dados Gerais</span>
                </div>
              </ng-template>
              <div class="row g-4 px-2">
                <div class="col-6 col-md-3">
                  <div class="info-field">
                    <span class="info-label">Tipo Sanguíneo</span>
                    <span class="info-value">{{ formData().bloodType || '—' }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="info-field">
                    <span class="info-label">Fumante</span>
                    <span class="info-value">{{ formData().smoker ? 'Sim' : 'Não' }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="info-field">
                    <span class="info-label">Tipo de Pele</span>
                    <span class="info-value">{{ formData().skinType || '—' }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="info-field">
                    <span class="info-label">Exposição Solar</span>
                    <span class="info-value">{{ formData().sunExposure || '—' }}</span>
                  </div>
                </div>
              </div>
            </p-card>

            <div class="row g-4">
              <div class="col-12 col-lg-4">
                <p-card styleClass="info-card h-100">
                  <ng-template pTemplate="header">
                    <div class="card-section-header d-flex align-items-center gap-2 px-4 pt-4">
                      <i class="pi pi-heart" style="font-size:1.25rem; color:#ef4444"></i>
                      <span class="card-section-title">Alergias</span>
                    </div>
                  </ng-template>
                  <p class="info-text mb-0">{{ formData().allergies || 'Nenhuma relatada.' }}</p>
                </p-card>
              </div>
              <div class="col-12 col-lg-4">
                <p-card styleClass="info-card h-100">
                  <ng-template pTemplate="header">
                    <div class="card-section-header d-flex align-items-center gap-2 px-4 pt-4">
                      <i class="pi pi-tablets" style="font-size:1.25rem; color:#f59e0b"></i>
                      <span class="card-section-title">Medicamentos</span>
                    </div>
                  </ng-template>
                  <p class="info-text mb-0">{{ formData().medications || 'Nenhum em uso.' }}</p>
                </p-card>
              </div>
              <div class="col-12 col-lg-4">
                <p-card styleClass="info-card h-100">
                  <ng-template pTemplate="header">
                    <div class="card-section-header d-flex align-items-center gap-2 px-4 pt-4">
                      <i class="pi pi-shield" style="font-size:1.25rem; color:#3b82f6"></i>
                      <span class="card-section-title">Cirurgias Prévias</span>
                    </div>
                  </ng-template>
                  <p class="info-text mb-0">{{ formData().surgeries || 'Nenhuma.' }}</p>
                </p-card>
              </div>
              <div class="col-12" *ngIf="formData().notes">
                <p-card styleClass="info-card">
                  <ng-template pTemplate="header">
                    <div class="card-section-header d-flex align-items-center gap-2 px-4 pt-4">
                      <i class="pi pi-comment" style="font-size:1.25rem; color: var(--text-color-secondary)"></i>
                      <span class="card-section-title">Observações Adicionais</span>
                    </div>
                  </ng-template>
                  <p class="info-text mb-0">{{ formData().notes }}</p>
                </p-card>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ─── PATIENT VIEW ─── -->
        <ng-container *ngIf="!isProfessional()">

          <!-- No request -->
          <div *ngIf="anamnesisStatus() === 'NONE'" class="empty-state d-flex flex-column align-items-center justify-content-center text-center py-5 gap-4">
            <div class="empty-icon-ring d-flex align-items-center justify-content-center">
              <i class="pi pi-file-edit" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
            </div>
            <div>
              <h3 class="fw-bold mb-1" style="color:var(--text-color)">Nenhuma ficha solicitada</h3>
              <p class="text-muted mb-0 mx-auto" style="max-width:360px">
                Quando seu profissional solicitar o preenchimento, ela aparecerá aqui.
              </p>
            </div>
          </div>

          <!-- Completed -->
          <div *ngIf="anamnesisStatus() === 'COMPLETED'" class="empty-state d-flex flex-column align-items-center justify-content-center text-center py-5 gap-4">
            <div class="success-icon-ring d-flex align-items-center justify-content-center">
              <i class="pi pi-check-circle" style="font-size: 3rem; color: #16a34a"></i>
            </div>
            <div>
              <h3 class="fw-bold mb-2" style="color:var(--text-color)">Ficha enviada com sucesso!</h3>
              <p class="text-muted mb-4">Suas informações foram registradas com segurança.</p>
              <button pButton label="Voltar ao Dashboard" icon="pi pi-home" (click)="navigateTo('/dashboard')"></button>
            </div>
          </div>

          <!-- Form -->
          <div *ngIf="anamnesisStatus() === 'REQUESTED'" class="fill-form-container">
            <div class="page-header d-flex align-items-center gap-3 mb-5">
              <div class="form-icon-box d-flex align-items-center justify-content-center">
                <i class="pi pi-file-edit" style="font-size:1.5rem; color:white"></i>
              </div>
              <div>
                <h2 class="page-title mb-0">Ficha de Anamnese</h2>
                <p class="page-subtitle mb-0">Responda com atenção para garantir a segurança do seu procedimento</p>
              </div>
            </div>

            <form (submit)="handleSubmit($event)">
              <p-tabs [(value)]="activeTab" styleClass="anamnesis-tabs">
                <p-tablist>
                  <p-tab value="0">
                    <i class="pi pi-user me-2"></i> Dados Pessoais
                  </p-tab>
                  <p-tab value="1">
                    <i class="pi pi-heart me-2"></i> Histórico de Saúde
                  </p-tab>
                  <p-tab value="2">
                    <i class="pi pi-comment me-2"></i> Observações
                  </p-tab>
                </p-tablist>

                <p-tabpanels>
                  <!-- TAB 1 -->
                  <p-tabpanel value="0">
                    <div class="tab-content-wide">
                      <div class="row g-4">
                        <div class="col-12 col-md-6 col-xl-4">
                          <label class="form-label-lumina">Tipo Sanguíneo</label>
                          <p-select
                            name="blood"
                            [(ngModel)]="localFormData.bloodType"
                            [options]="bloodTypeOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione..."
                            [style]="{'width':'100%'}"
                          />
                        </div>
                        <div class="col-12 col-md-6 col-xl-4">
                          <label class="form-label-lumina">Tipo de Pele</label>
                          <p-select
                            name="skin"
                            [(ngModel)]="localFormData.skinType"
                            [options]="skinTypeOptions"
                            optionLabel="label"
                            optionValue="value"
                            [style]="{'width':'100%'}"
                          />
                        </div>
                        <div class="col-12 col-md-6 col-xl-4">
                          <label class="form-label-lumina">Exposição Solar</label>
                          <p-select
                            name="sun"
                            [(ngModel)]="localFormData.sunExposure"
                            [options]="sunExposureOptions"
                            optionLabel="label"
                            optionValue="value"
                            [style]="{'width':'100%'}"
                          />
                        </div>
                        <div class="col-12 col-md-6 col-xl-4">
                          <label class="form-label-lumina d-block mb-3">Você fuma?</label>
                          <div class="d-flex gap-4">
                            <div class="d-flex align-items-center gap-2">
                              <p-radioButton name="smoker" [value]="true" [(ngModel)]="localFormData.smoker" inputId="smokerYes" />
                              <label for="smokerYes" class="radio-label">Sim</label>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                              <p-radioButton name="smoker" [value]="false" [(ngModel)]="localFormData.smoker" inputId="smokerNo" />
                              <label for="smokerNo" class="radio-label">Não</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  <!-- TAB 2 -->
                  <p-tabpanel value="1">
                    <div class="tab-content-wide">
                      <div class="row g-4">
                        <div class="col-12 col-lg-6">
                          <label class="form-label-lumina">Alergias</label>
                          <p class="form-hint mb-2">Medicamentos, alimentos ou substâncias que causam reação</p>
                          <textarea
                            pTextarea
                            name="allergies"
                            [(ngModel)]="localFormData.allergies"
                            rows="5"
                            placeholder="Ex: dipirona, amendoim, látex..."
                            class="w-100 textarea-lumina"
                          ></textarea>
                        </div>
                        <div class="col-12 col-lg-6">
                          <label class="form-label-lumina">Medicamentos em Uso Contínuo</label>
                          <p class="form-hint mb-2">Liste todos os medicamentos que você usa regularmente</p>
                          <textarea
                            pTextarea
                            name="meds"
                            [(ngModel)]="localFormData.medications"
                            rows="5"
                            placeholder="Ex: Losartana 50mg..."
                            class="w-100 textarea-lumina"
                          ></textarea>
                        </div>
                        <div class="col-12">
                          <label class="form-label-lumina">Cirurgias Anteriores</label>
                          <p class="form-hint mb-2">Inclua o tipo e o ano aproximado</p>
                          <textarea
                            pTextarea
                            name="surgeries"
                            [(ngModel)]="localFormData.surgeries"
                            rows="3"
                            placeholder="Ex: Apendicectomia (2015)..."
                            class="w-100 textarea-lumina"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </p-tabpanel>

                  <!-- TAB 3 -->
                  <p-tabpanel value="2">
                    <div class="tab-content-wide">
                      <label class="form-label-lumina">Observações Adicionais</label>
                      <p class="form-hint mb-3">Compartilhe qualquer informação que considere relevante</p>
                      <textarea
                        pTextarea
                        name="notes"
                        [(ngModel)]="localFormData.notes"
                        rows="10"
                        placeholder="Escreva aqui qualquer informação adicional..."
                        class="w-100 textarea-lumina"
                      ></textarea>
                    </div>
                  </p-tabpanel>
                </p-tabpanels>
              </p-tabs>

              <!-- Actions -->
              <div class="form-actions d-flex justify-content-end gap-3 mt-4 pt-4 border-top">
                <button pButton type="button" label="Cancelar" severity="secondary" outlined (click)="navigateTo('/dashboard')"></button>
                <button pButton type="submit" label="Enviar Ficha" icon="pi pi-send"></button>
              </div>
            </form>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .anamnesis-page { animation: fadeIn 0.4s ease forwards; }
    .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-color); }
    .page-subtitle { font-size: 0.9rem; color: var(--text-color-secondary); }

    .loading-overlay { min-height: 60vh; }
    :host ::ng-deep .lumina-spinner { width: 48px; height: 48px; }
    :host ::ng-deep .lumina-spinner .p-progressspinner-circle { stroke: var(--primary-color) !important; }

    .form-icon-box {
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--grad-primary); flex-shrink: 0;
    }

    /* ─── Read-Only Cards ─── */
    :host ::ng-deep .info-card { border-radius: 20px; border: 1px solid var(--surface-border); box-shadow: var(--shadow-sm); overflow: hidden; }
    :host ::ng-deep .info-card .p-card-body { padding: 1.25rem 1.5rem; }
    .card-section-header { border-bottom: 1px solid var(--surface-border); padding-bottom: 1rem; margin-bottom: 0.5rem; }
    .card-section-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-color); }
    .info-field { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-color-secondary); }
    .info-value { font-size: 1.0625rem; font-weight: 700; color: var(--text-color); }
    .info-text { font-size: 0.9375rem; color: var(--text-color); line-height: 1.6; }

    /* ─── States ─── */
    .empty-state { min-height: 55vh; }
    .empty-icon-ring { width: 96px; height: 96px; border-radius: 50%; background: var(--surface-hover); border: 2px dashed var(--surface-border); }
    .success-icon-ring { width: 96px; height: 96px; border-radius: 50%; background: #f0fdf4; }

    /* ─── Form ─── */
    .form-label-lumina { display: block; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-color-secondary); margin-bottom: 8px; }
    .form-hint { font-size: 0.8125rem; color: var(--text-color-secondary); margin: 0; }
    .radio-label { font-size: 0.9375rem; font-weight: 600; color: var(--text-color); cursor: pointer; }
    .textarea-lumina {
      border: 1px solid var(--surface-border); border-radius: 12px; padding: 12px;
      background: var(--surface-hover); color: var(--text-color);
      font-size: 0.9375rem; font-family: var(--font-family); resize: vertical;
      transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
      &:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(244,63,94,0.1); }
    }

    /* ─── Tabs ─── */
    :host ::ng-deep .anamnesis-tabs .p-tabs-nav {
      border-bottom: 2px solid var(--surface-border);
      background: transparent;
    }
    :host ::ng-deep .anamnesis-tabs .p-tab {
      border: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
      padding: 12px 20px; font-weight: 600; color: var(--text-color-secondary);
      background: transparent; border-radius: 0; cursor: pointer; transition: all 0.2s;
      &:hover { color: var(--primary-color); }
    }
    :host ::ng-deep .anamnesis-tabs .p-tab-active {
      border-bottom-color: var(--primary-color); color: var(--primary-color);
    }
    :host ::ng-deep .anamnesis-tabs .p-tabpanels { padding: 0; background: transparent; }
    .tab-content-wide { padding: 2rem 0; }

    /* ─── PrimeNG Select ─── */
    :host ::ng-deep .p-select { border: 1px solid var(--surface-border) !important; border-radius: 12px !important; background: var(--surface-hover) !important; }
    :host ::ng-deep .p-select.p-focus { border-color: var(--primary-color) !important; box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important; }

    /* ─── RadioButton ─── */
    :host ::ng-deep .p-radiobutton.p-highlight .p-radiobutton-box { border-color: var(--primary-color); background: var(--primary-color); }

    .form-actions { flex-wrap: wrap; }

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
  activeTab = signal('0');

  formData = signal<Partial<AnamnesisForm>>({});
  localFormData: Partial<AnamnesisForm> = {
    skinType: 'Normal',
    sunExposure: 'Baixa',
    smoker: false
  };

  bloodTypeOptions = [
    { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' }
  ];
  skinTypeOptions = [
    { label: 'Normal', value: 'Normal' }, { label: 'Seca', value: 'Seca' },
    { label: 'Oleosa', value: 'Oleosa' }, { label: 'Mista', value: 'Mista' }
  ];
  sunExposureOptions = [
    { label: 'Baixa (Pouco sol)', value: 'Baixa' },
    { label: 'Moderada', value: 'Moderada' },
    { label: 'Alta (Diária / Intensa)', value: 'Alta' }
  ];

  ngOnInit() {
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
    if (data) { this.formData.set(data); this.localFormData = { ...data }; }
    this.loading.set(false);
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.targetPatientId()) return;
    await this.mockDb.saveAnamnesis({ ...this.localFormData as AnamnesisForm, patientId: this.targetPatientId()! });
    this.anamnesisStatus.set(AnamnesisStatus.COMPLETED);
    this.router.navigate(['/dashboard']);
  }

  navigateBack() { this.router.navigate(['/patients']); }
  navigateTo(path: string) { this.router.navigate([path]); }
}
