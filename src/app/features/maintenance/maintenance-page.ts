import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ToastStore } from '../../core/state/toast.store';
import { Asset } from '../../shared/models/asset.model';
import {
  Maintenance,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceType,
} from '../../shared/models/maintenance.model';
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
} from '../../shared/models/domain-labels';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { AssetsRepository } from '../assets/data/assets.repository';
import { MaintenanceRepository } from './maintenance.repository';

@Component({
  selector: 'af-maintenance-page',
  imports: [ReactiveFormsModule, RouterLink, AppIcon, EmptyState, PageHeader, StatusBadge],
  templateUrl: './maintenance-page.html',
  styleUrl: './maintenance-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenancePage implements OnInit {
  protected readonly items = signal<readonly Maintenance[]>([]);
  protected readonly assets = signal<readonly Asset[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statusFilter = signal<MaintenanceStatus | ''>('');
  protected readonly statusLabels = MAINTENANCE_STATUS_LABELS;
  protected readonly typeLabels = MAINTENANCE_TYPE_LABELS;
  protected readonly priorityLabels = MAINTENANCE_PRIORITY_LABELS;
  protected readonly filteredItems = computed(() => {
    const status = this.statusFilter();
    return status ? this.items().filter((item) => item.status === status) : this.items();
  });
  protected readonly scheduledCount = computed(() => this.items().filter((item) => item.status === 'SCHEDULED').length);
  protected readonly inProgressCount = computed(() => this.items().filter((item) => item.status === 'IN_PROGRESS').length);
  protected readonly completedCount = computed(() => this.items().filter((item) => item.status === 'COMPLETED').length);
  protected readonly criticalCount = computed(() => this.items().filter((item) => item.priority === 'CRITICAL' && item.status !== 'COMPLETED').length);

  private readonly repository = inject(MaintenanceRepository);
  private readonly assetsRepository = inject(AssetsRepository);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastStore);

  protected readonly form = this.formBuilder.nonNullable.group({
    assetId: ['', Validators.required],
    type: ['PREVENTIVE' as MaintenanceType, Validators.required],
    priority: ['MEDIUM' as MaintenancePriority, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(700)]],
    scheduledAt: [new Date().toISOString().slice(0, 10), Validators.required],
    provider: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      maintenance: this.repository.list(),
      assetsPage: this.assetsRepository.list({ page: 0, size: 200, status: '', category: '', search: '' }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ maintenance, assetsPage }) => {
          this.items.set(maintenance);
          this.assets.set(assetsPage.items.filter((asset) => !['RETIRED', 'LOST'].includes(asset.status)));
        },
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No fue posible cargar los mantenimientos.'),
      });
  }

  protected changeFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as MaintenanceStatus | '');
  }

  protected create(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.repository
      .create({ ...raw, provider: raw.provider.trim() || undefined })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) => {
          this.toast.success('Mantenimiento programado', `${item.assetCode} quedó agendado para ${this.formatDate(item.scheduledAt)}.`);
          this.form.reset({
            assetId: '',
            type: 'PREVENTIVE',
            priority: 'MEDIUM',
            title: '',
            description: '',
            scheduledAt: new Date().toISOString().slice(0, 10),
            provider: '',
          });
          this.formOpen.set(false);
          this.load();
        },
      });
  }

  protected complete(item: Maintenance): void {
    this.repository.complete(item.id).subscribe({
      next: () => {
        this.toast.success('Mantenimiento completado', `${item.assetCode} quedó disponible para continuar su ciclo de vida.`);
        this.load();
      },
    });
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(value.length === 10 ? `${value}T12:00:00` : value),
    );
  }

  protected formatMoney(value?: number, currency = 'PEN'): string {
    return value === undefined
      ? 'Por definir'
      : new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);
  }
}
