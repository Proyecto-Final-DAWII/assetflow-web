import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { SessionStore } from '../../core/auth/session.store';
import { ToastStore } from '../../core/state/toast.store';
import { Asset } from '../../shared/models/asset.model';
import { INCIDENT_PRIORITY_LABELS, INCIDENT_STATUS_LABELS } from '../../shared/models/domain-labels';
import { Incident, IncidentPriority, IncidentStatus } from '../../shared/models/incident.model';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { AssetsRepository } from '../assets/data/assets.repository';
import { IncidentsRepository } from './incidents.repository';

@Component({
  selector: 'af-incidents-page',
  imports: [AppIcon, EmptyState, PageHeader, ReactiveFormsModule, RouterLink, StatusBadge],
  templateUrl: './incidents-page.html',
  styleUrl: './incidents-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentsPage {
  private readonly repository = inject(IncidentsRepository);
  private readonly assetsRepository = inject(AssetsRepository);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly items = signal<readonly Incident[]>([]);
  protected readonly assets = signal<readonly Asset[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<IncidentStatus | ''>('');
  protected readonly priorityLabels = INCIDENT_PRIORITY_LABELS;
  protected readonly statusLabels = INCIDENT_STATUS_LABELS;
  protected readonly isManager = computed(() => {
    const role = this.session.user()?.role;
    return role === 'ADMIN' || role === 'SUPPORT';
  });

  protected readonly reportableAssets = computed(() => {
    const user = this.session.user();
    if (!user || this.isManager()) return this.assets();
    return this.assets().filter((asset) => asset.assignedTo?.id === user.id);
  });

  protected readonly visibleItems = computed(() => {
    const user = this.session.user();
    const search = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.items().filter((item) => {
      const canSee = this.isManager() || item.reportedBy === user?.fullName;
      const matchesSearch = !search || [item.code, item.assetCode, item.assetName, item.title, item.reportedBy]
        .join(' ')
        .toLowerCase()
        .includes(search);
      return canSee && matchesSearch && (!status || item.status === status);
    });
  });

  protected readonly openCount = computed(() => this.items().filter((item) => item.status === 'OPEN').length);
  protected readonly inProgressCount = computed(() => this.items().filter((item) => ['IN_REVIEW', 'IN_MAINTENANCE'].includes(item.status)).length);
  protected readonly criticalCount = computed(() => this.items().filter((item) => item.priority === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(item.status)).length);
  protected readonly resolvedCount = computed(() => this.items().filter((item) => ['RESOLVED', 'CLOSED'].includes(item.status)).length);

  protected readonly form = this.formBuilder.nonNullable.group({
    assetId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    priority: ['MEDIUM' as IncidentPriority, Validators.required],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      incidents: this.repository.list(),
      assetsPage: this.assetsRepository.list({ page: 0, size: 250 }),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ incidents, assetsPage }) => {
          this.items.set(incidents);
          this.assets.set(assetsPage.items);
        },
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las incidencias.'),
      });
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const userName = this.session.user()?.fullName ?? 'Usuario actual';
    this.repository
      .create(this.form.getRawValue(), userName)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (incident) => {
          this.items.update((items) => [incident, ...items]);
          this.form.reset({ assetId: '', title: '', description: '', priority: 'MEDIUM' });
          this.formOpen.set(false);
          this.toast.success('Incidencia registrada', `${incident.code} fue enviada al equipo de TI.`);
        },
        error: (error: unknown) => this.toast.error('No se pudo registrar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected changeStatus(item: Incident, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as IncidentStatus;
    if (status === item.status) return;
    this.repository
      .updateStatus(item.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.items.update((items) => items.map((candidate) => candidate.id === updated.id ? updated : candidate));
          this.toast.success('Estado actualizado', `${item.code} ahora esta ${this.statusLabels[status].toLowerCase()}.`);
        },
        error: (error: unknown) => this.toast.error('No se pudo actualizar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected updateFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as IncidentStatus | '');
  }

  protected formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}
