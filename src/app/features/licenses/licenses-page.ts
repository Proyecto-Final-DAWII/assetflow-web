import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LICENSE_STATUS_LABELS } from '../../shared/models/domain-labels';
import { LicenseStatus, SoftwareLicense } from '../../shared/models/license.model';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { LicensesRepository } from './licenses.repository';

@Component({
  selector: 'af-licenses-page',
  imports: [AppIcon, EmptyState, PageHeader, StatusBadge],
  templateUrl: './licenses-page.html',
  styleUrl: './licenses-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicensesPage {
  private readonly repository = inject(LicensesRepository);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly SoftwareLicense[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<LicenseStatus | ''>('');
  protected readonly statusLabels = LICENSE_STATUS_LABELS;

  protected readonly filteredItems = computed(() => {
    const search = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.items().filter((item) => {
      const matchesSearch = !search || [item.productName, item.vendor, item.ownerArea]
        .join(' ')
        .toLowerCase()
        .includes(search);
      return matchesSearch && (!status || item.status === status);
    });
  });

  protected readonly totalSeats = computed(() => this.items().reduce((total, item) => total + item.totalSeats, 0));
  protected readonly assignedSeats = computed(() => this.items().reduce((total, item) => total + item.assignedSeats, 0));
  protected readonly availableSeats = computed(() => this.items().reduce((total, item) => total + item.availableSeats, 0));
  protected readonly expiringCount = computed(() => this.items().filter((item) => item.status === 'EXPIRING').length);
  protected readonly annualCost = computed(() => this.items().reduce((total, item) => total + (item.annualCost ?? 0), 0));
  protected readonly utilization = computed(() => {
    const total = this.totalSeats();
    return total === 0 ? 0 : Math.round((this.assignedSeats() / total) * 100);
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (items) => this.items.set(items),
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las licencias.'),
      });
  }

  protected updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected updateStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as LicenseStatus | '');
  }

  protected seatPercentage(item: SoftwareLicense): number {
    return item.totalSeats === 0 ? 0 : Math.min(100, Math.round((item.assignedSeats / item.totalSeats) * 100));
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin vencimiento';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  protected formatMoney(value?: number, currency = 'PEN'): string {
    if (value === undefined) return 'No registrado';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  }

  protected licenseType(type: SoftwareLicense['type']): string {
    return { SUBSCRIPTION: 'Suscripcion', PERPETUAL: 'Perpetua', OEM: 'OEM' }[type];
  }
}
