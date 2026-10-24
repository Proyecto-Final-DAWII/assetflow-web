import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { Incident, IncidentCreateRequest, IncidentStatus } from '../../shared/models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentsRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly Incident[]> {
    if (this.config.isMockMode()) return this.demoDb.listIncidents();
    return this.api
      .execute<readonly Incident[] | ApiEnvelope<readonly Incident[]>>('incidents.list')
      .pipe(map((response) => unwrapApiData(response)));
  }

  create(value: IncidentCreateRequest, reportedBy: string): Observable<Incident> {
    if (this.config.isMockMode()) return this.demoDb.createIncident(value, reportedBy);
    return this.api
      .execute<Incident | ApiEnvelope<Incident>, IncidentCreateRequest>('incidents.create', { body: value })
      .pipe(map((response) => unwrapApiData(response)));
  }

  updateStatus(id: string, status: IncidentStatus): Observable<Incident> {
    if (this.config.isMockMode()) return this.demoDb.updateIncidentStatus(id, status);
    return this.api
      .execute<Incident | ApiEnvelope<Incident>, { status: IncidentStatus }>('incidents.update', {
        pathParams: { id },
        body: { status },
      })
      .pipe(map((response) => unwrapApiData(response)));
  }
}
