import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import {
  BackendMaintenance,
  mapMaintenanceFromApi,
  mapMaintenanceToApi,
} from '../../core/http/backend-adapters';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { Maintenance, MaintenanceCreateRequest } from '../../shared/models/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly Maintenance[]> {
    if (this.config.isMockMode()) return this.demoDb.listMaintenance();
    return this.api
      .execute<readonly BackendMaintenance[] | ApiEnvelope<readonly BackendMaintenance[]>>('maintenance.list')
      .pipe(
        map((response) => unwrapApiData(response)),
        map((items) => (Array.isArray(items) ? items.map(mapMaintenanceFromApi) : [])),
      );
  }

  create(value: MaintenanceCreateRequest): Observable<Maintenance> {
    if (this.config.isMockMode()) return this.demoDb.createMaintenance(value);
    return this.api
      .execute<BackendMaintenance | ApiEnvelope<BackendMaintenance>, Record<string, unknown>>('maintenance.create', {
        body: mapMaintenanceToApi(value),
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapMaintenanceFromApi),
      );
  }

  complete(id: string): Observable<Maintenance> {
    if (this.config.isMockMode()) return this.demoDb.completeMaintenance(id);
    return this.api
      .execute<BackendMaintenance | ApiEnvelope<BackendMaintenance>>('maintenance.complete', { pathParams: { id } })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapMaintenanceFromApi),
      );
  }
}
