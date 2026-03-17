import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockDbService } from '../../services/mock-db.service';
import { UserRole, AnamnesisForm, AnamnesisStatus } from '../../models/types';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Tabs } from 'primeng/tabs';
import { TabList } from 'primeng/tabs';
import { Tab } from 'primeng/tabs';
import { TabPanel } from 'primeng/tabs';
import { TabPanels } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-anamnesis',
  standalone: true,
  templateUrl: './anamnesis.html',
  styleUrl: './anamnesis.scss',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ButtonModule,
    DialogModule,
    Tabs, TabList, Tab, TabPanel, TabPanels,
    SelectModule,
    RadioButtonModule,
    TagModule,
    DividerModule,
    ProgressSpinnerModule,
    CardModule
  ],
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
  dialogVisible = false;

  formData = signal<Partial<AnamnesisForm>>({});
  localFormData: Partial<AnamnesisForm> = { skinType: 'Normal', sunExposure: 'Baixa', smoker: false };

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
    this.currentUser.set({ id: 'pat_1', role: UserRole.PATIENT, anamnesisStatus: AnamnesisStatus.REQUESTED });
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
    this.dialogVisible = false;
    this.anamnesisStatus.set(AnamnesisStatus.COMPLETED);
  }

  navigateBack() { this.router.navigate(['/patients']); }
  navigateTo(path: string) { this.router.navigate([path]); }
}
