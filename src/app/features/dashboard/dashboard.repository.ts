import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { DashboardSummary } from '../../shared/models/dashboard.model';
import { AssetsRepository } from '../assets/data/assets.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { MaintenanceRepository } from '../maintenance/maintenance.repository';
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '../../shared/models/domain-labels';
import { AssetCategory, AssetStatus } from '../../shared/models/asset.model';

@Injectable({ providedIn: 'root' })
export class DashboardRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);
  private readonly assetsRepo = inject(AssetsRepository);
  private readonly assignmentsRepo = inject(AssignmentsRepository);
  private readonly maintenanceRepo = inject(MaintenanceRepository);

  getSummary(): Observable<DashboardSummary> {
    if (this.config.isMockMode()) {
      return this.demoDb.dashboard();
    }
    return this.api
      .execute<DashboardSummary | ApiEnvelope<DashboardSummary>>('dashboard.summary')
      .pipe(
        map((response) => unwrapApiData(response)),
        catchError(() => this.computeFromEntities()),
      );
  }

  private computeFromEntities(): Observable<DashboardSummary> {
    return forkJoin({
      assetsPage: this.assetsRepo.list({ page: 0, size: 500 }),
      assignments: this.assignmentsRepo.list().pipe(catchError(() => of([]))),
      maintenances: this.maintenanceRepo.list().pipe(catchError(() => of([]))),
    }).pipe(
      map(({ assetsPage, assignments, maintenances }) => {
        const assets = assetsPage.items;
        const total = assets.length || 1;
        const assigned = assets.filter((a) => a.status === 'ASSIGNED').length;
        const available = assets.filter((a) => a.status === 'AVAILABLE').length;
        const inMaint = assets.filter((a) => a.status === 'MAINTENANCE' || a.status === 'REPAIR').length;
        const retired = assets.filter((a) => a.status === 'RETIRED').length;

        const categoryCounts = new Map<AssetCategory, number>();
        const statusCounts = new Map<AssetStatus, number>();

        for (const a of assets) {
          categoryCounts.set(a.category, (categoryCounts.get(a.category) ?? 0) + 1);
          statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);
        }

        const assetsByCategory = [...categoryCounts.entries()].map(([k, count]) => ({
          key: k,
          label: ASSET_CATEGORY_LABELS[k] ?? k,
          value: count,
          percentage: Math.round((count / total) * 100),
        }));

        const assetsByStatus = [...statusCounts.entries()].map(([k, count]) => ({
          key: k,
          label: ASSET_STATUS_LABELS[k] ?? k,
          value: count,
          percentage: Math.round((count / total) * 100),
        }));

        const summary: DashboardSummary = {
          metrics: [
            { key: 'total', label: 'Activos totales', value: assets.length, icon: 'assets', tone: 'primary' },
            { key: 'assigned', label: 'Asignados', value: assigned, icon: 'user-check', tone: 'success' },
            { key: 'available', label: 'Disponibles', value: available, icon: 'package-check', tone: 'info' },
            { key: 'maintenance', label: 'En mantenimiento', value: inMaint, icon: 'wrench', tone: 'warning' },
            { key: 'warranty', label: 'Garantías por vencer', value: 0, helper: 'Próximos 30 días', icon: 'shield-alert', tone: 'danger' },
            { key: 'retired', label: 'Dados de baja', value: retired, icon: 'archive', tone: 'neutral' },
          ],
          assetsByCategory,
          assetsByStatus,
          recentMovements: [],
          upcomingAlerts: [],
          maintenanceByMonth: [
            { month: 'Oct 2026', total: maintenances.length },
          ],
        };
        return summary;
      }),
    );
  }
}
