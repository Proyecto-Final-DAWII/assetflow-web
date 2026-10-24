import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import {
  BackendAssignment,
  mapAssignmentFromApi,
  mapAssignmentToApi,
} from '../../core/http/backend-adapters';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { Assignment, AssignmentCreateRequest } from '../../shared/models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentsRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly Assignment[]> {
    if (this.config.isMockMode()) return this.demoDb.listAssignments();
    return this.api
      .execute<readonly BackendAssignment[] | ApiEnvelope<readonly BackendAssignment[]>>('assignments.list')
      .pipe(
        map((response) => unwrapApiData(response)),
        map((items) => (Array.isArray(items) ? items.map(mapAssignmentFromApi) : [])),
      );
  }

  create(value: AssignmentCreateRequest): Observable<Assignment> {
    if (this.config.isMockMode()) return this.demoDb.createAssignment(value);
    return this.api
      .execute<BackendAssignment | ApiEnvelope<BackendAssignment>, Record<string, string>>('assignments.create', {
        body: mapAssignmentToApi(value),
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapAssignmentFromApi),
      );
  }

  returnAsset(id: string): Observable<Assignment> {
    if (this.config.isMockMode()) return this.demoDb.returnAssignment(id);
    return this.api
      .execute<BackendAssignment | ApiEnvelope<BackendAssignment>>('assignments.return', { pathParams: { id } })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapAssignmentFromApi),
      );
  }
}
