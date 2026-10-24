import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastStore } from '../../core/state/toast.store';
import { AlertItem, AlertSeverity, AlertType } from '../../shared/models/alert.model';
import { ALERT_SEVERITY_LABELS, ALERT_TYPE_LABELS } from '../../shared/models/domain-labels';
import { AppIcon, AppIconName } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { AlertsRepository } from './alerts.repository';

@Component({
  selector: 'af-alerts-page',
  imports: [AppIcon, EmptyState, PageHeader, RouterLink, StatusBadge],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPage {
  private readonly repository = inject(AlertsRepository);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly AlertItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly markingAll = signal(false);
  protected readonly processingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly typeFilter = signal<AlertType | ''>('');
  protected readonly severityFilter = signal<AlertSeverity | ''>('');
  protected readonly unreadOnly = signal(false);
  protected readonly typeLabels = ALERT_TYPE_LABELS;
  protected readonly severityLabels = ALERT_SEVERITY_LABELS;

  protected readonly filteredItems = computed(() => this.items().filter((item) => {
    const type = this.typeFilter();
    const severity = this.severityFilter();
    return (!type || item.type === type) && (!severity || item.severity === severity) && (!this.unreadOnly() || !item.read);
  }));
  protected readonly unreadCount = computed(() => this.items().filter((item) => !item.read).length);
  protected readonly criticalCount = computed(() => this.items().filter((item) => item.severity === 'CRITICAL' && !item.read).length);
  protected readonly warningCount = computed(() => this.items().filter((item) => item.severity === 'WARNING' && !item.read).length);
  protected readonly dueCount = computed(() => this.items().filter((item) => item.dueAt && !item.read).length);

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
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las alertas.'),
      });
  }

  protected markRead(item: AlertItem): void {
    if (item.read || this.processingId()) return;
    this.processingId.set(item.id);
    this.repository
      .markRead(item.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.processingId.set(null)),
      )
      .subscribe({
        next: () => this.items.update((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, read: true } : candidate)),
        error: (error: unknown) => this.toast.error('No se pudo actualizar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected markAllRead(): void {
    if (this.unreadCount() === 0 || this.markingAll()) return;
    this.markingAll.set(true);
    this.repository
      .markAllRead()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.markingAll.set(false)),
      )
      .subscribe({
        next: () => {
          this.items.update((items) => items.map((item) => ({ ...item, read: true })));
          this.toast.success('Alertas actualizadas', 'Todas las notificaciones fueron marcadas como leidas.');
        },
        error: (error: unknown) => this.toast.error('No se pudieron actualizar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected updateType(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value as AlertType | '');
  }

  protected updateSeverity(event: Event): void {
    this.severityFilter.set((event.target as HTMLSelectElement).value as AlertSeverity | '');
  }

  protected icon(type: AlertType): AppIconName {
    const icons: Record<AlertType, AppIconName> = {
      WARRANTY: 'shield-alert',
      MAINTENANCE: 'wrench',
      LICENSE: 'key',
      INCIDENT: 'ticket',
      SYSTEM: 'info',
    };
    return icons[type];
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha limite';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  }

  protected formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}
