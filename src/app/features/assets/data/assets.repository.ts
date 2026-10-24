import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../../core/config/runtime-config.service';
import { ApiClientService } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/http/api.models';
import { normalizePage, unwrapApiData } from '../../../core/http/api-response.utils';
import {
  BackendAsset,
  BackendAudit,
  mapAssetFromApi,
  mapAssetToApi,
  mapAuditToMovement,
} from '../../../core/http/backend-adapters';
import { DemoDatabaseService } from '../../../core/mocks/demo-database.service';
import { Asset, AssetFilters, AssetFormValue, AssetMovement } from '../../../shared/models/asset.model';
import { PageResult } from '../../../shared/models/page.model';

@Injectable({ providedIn: 'root' })
export class AssetsRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(filters: AssetFilters): Observable<PageResult<Asset>> {
    if (this.config.isMockMode()) {
      return this.demoDb.listAssets(filters);
    }
    return this.api
      .execute<unknown>('assets.list', {
        query: {
          search: filters.search,
          status: filters.status ? this.statusToApi(filters.status) : '',
          category: filters.category,
          page: filters.page,
          size: filters.size,
        },
      })
      .pipe(
        map((response) => {
          const page = normalizePage<BackendAsset>(response, filters.page, filters.size);
          return {
            items: page.items.map(mapAssetFromApi),
            total: page.total,
            page: page.page,
            size: page.size,
            totalPages: page.totalPages,
          };
        }),
      );
  }

  getById(id: string): Observable<Asset> {
    if (this.config.isMockMode()) {
      return this.demoDb.getAsset(id);
    }
    return this.api
      .execute<BackendAsset | ApiEnvelope<BackendAsset>>('assets.detail', { pathParams: { id } })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapAssetFromApi),
      );
  }

  history(id: string): Observable<readonly AssetMovement[]> {
    if (this.config.isMockMode()) {
      return this.demoDb.getAssetHistory(id);
    }
    return this.api
      .execute<readonly BackendAudit[] | ApiEnvelope<readonly BackendAudit[]>>('assets.history', {
        pathParams: { id },
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map((items) => (Array.isArray(items) ? items.map(mapAuditToMovement) : [])),
      );
  }

  create(value: AssetFormValue): Observable<Asset> {
    if (this.config.isMockMode()) {
      return this.demoDb.createAsset(value);
    }
    return this.api
      .execute<BackendAsset | ApiEnvelope<BackendAsset>, Record<string, unknown>>('assets.create', {
        body: mapAssetToApi(value),
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapAssetFromApi),
      );
  }

  update(id: string, value: AssetFormValue): Observable<Asset> {
    if (this.config.isMockMode()) {
      return this.demoDb.updateAsset(id, value);
    }
    return this.api
      .execute<BackendAsset | ApiEnvelope<BackendAsset>, Record<string, unknown>>('assets.update', {
        pathParams: { id },
        body: mapAssetToApi(value),
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapAssetFromApi),
      );
  }

  availableAssets(): Observable<readonly Asset[]> {
    if (this.config.isMockMode()) {
      return new Observable((subscriber) => {
        subscriber.next(this.demoDb.availableAssets());
        subscriber.complete();
      });
    }
    return this.list({ status: 'AVAILABLE', page: 0, size: 200 }).pipe(map((page) => page.items));
  }

  private statusToApi(status: AssetFilters['status']): string {
    const statusMap: Record<string, string> = {
      AVAILABLE: 'DISPONIBLE',
      ASSIGNED: 'ASIGNADO',
      MAINTENANCE: 'EN_MANTENIMIENTO',
      REPAIR: 'EN_REPARACION',
      LOST: 'EXTRAVIADO',
      RETIRED: 'DADO_DE_BAJA',
    };
    return statusMap[status ?? ''] ?? '';
  }
}
