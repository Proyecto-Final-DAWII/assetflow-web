import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  AssetCategory,
  AssetStatus,
} from '../../../shared/models/asset.model';
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '../../../shared/models/domain-labels';
import { SessionStore } from '../../../core/auth/session.store';
import { AppIcon, AppIconName } from '../../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { AssetsStore } from '../data/assets.store';
import { DashboardRepository } from '../../dashboard/dashboard.repository';
import { DashboardSummary } from '../../../shared/models/dashboard.model';

@Component({
  selector: 'af-assets-page',
  imports: [ReactiveFormsModule, RouterLink, AppIcon, EmptyState, PageHeader, Pagination, StatusBadge],
  providers: [AssetsStore],
  templateUrl: './assets-page.html',
  styleUrl: './assets-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsPage implements OnInit {
  protected readonly store = inject(AssetsStore);
  protected readonly session = inject(SessionStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statuses = ASSET_STATUSES;
  protected readonly categories = ASSET_CATEGORIES;
  protected readonly statusLabels = ASSET_STATUS_LABELS;
  protected readonly categoryLabels = ASSET_CATEGORY_LABELS;
  protected readonly canManage = computed(() => ['ADMIN', 'SUPPORT'].includes(this.session.user()?.role ?? ''));
  protected readonly dashboard = signal<DashboardSummary | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardRepository = inject(DashboardRepository);

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => this.store.patchFilters({ search }));
  }

  ngOnInit(): void {
    this.dashboardRepository.getSummary().subscribe({ next: (summary) => this.dashboard.set(summary) });
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const search = params.get('search') ?? '';
        this.searchControl.setValue(search, { emitEvent: false });
        this.store.patchFilters({ search });
      });
  }

  protected metricValue(key: string): number {
    return this.dashboard()?.metrics.find((metric) => metric.key === key)?.value ?? 0;
  }

  protected setStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AssetStatus | '';
    this.store.patchFilters({ status: value });
  }

  protected setCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AssetCategory | '';
    this.store.patchFilters({ category: value });
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.clearFilters();
  }

  protected categoryIcon(category: AssetCategory): AppIconName {
    const icons: Record<AssetCategory, AppIconName> = {
      LAPTOP: 'laptop',
      DESKTOP: 'cpu',
      MOBILE: 'smartphone',
      MONITOR: 'monitor',
      SERVER: 'server',
      PERIPHERAL: 'box',
      NETWORK: 'network',
      OTHER: 'assets',
    };
    return icons[category];
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(`${value}T12:00:00`),
    );
  }
}
