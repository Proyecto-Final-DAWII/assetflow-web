import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SessionStore } from '../../core/auth/session.store';
import { DashboardSummary } from '../../shared/models/dashboard.model';
import { ASSET_STATUS_LABELS } from '../../shared/models/domain-labels';
import { AppIcon, AppIconName } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { DashboardRepository } from './dashboard.repository';

@Component({
  selector: 'af-dashboard-page',
  imports: [RouterLink, AppIcon, EmptyState, PageHeader, StatusBadge],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly maxMaintenance = computed(() =>
    Math.max(1, ...(this.summary()?.maintenanceByMonth.map((item) => item.total) ?? [1])),
  );
  protected readonly statusLabels = ASSET_STATUS_LABELS;

  private readonly repository = inject(DashboardRepository);
  private readonly session = inject(SessionStore);
  protected readonly canManage = computed(() => ['ADMIN', 'SUPPORT'].includes(this.session.user()?.role ?? ''));

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .getSummary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (value) => this.summary.set(value),
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No fue posible cargar el dashboard.'),
      });
  }

  protected icon(value: string): AppIconName {
    return value as AppIconName;
  }

  protected metricRoute(key: string): string {
    switch (key) {
      case 'assigned':
        return '/assignments';
      case 'maintenance':
        return '/maintenance';
      case 'warranty':
        return '/alerts';
      case 'total':
      case 'available':
      case 'retired':
      default:
        return '/assets';
    }
  }

  protected categoryIcon(category: string): AppIconName {
    const icons: Record<string, AppIconName> = {
      LAPTOP: 'laptop',
      DESKTOP: 'cpu',
      MOBILE: 'smartphone',
      MONITOR: 'monitor',
      SERVER: 'server',
      PERIPHERAL: 'box',
      NETWORK: 'network',
      OTHER: 'assets',
    };
    return icons[category] ?? 'assets';
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(value),
    );
  }

  protected formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
