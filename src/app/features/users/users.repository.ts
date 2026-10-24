import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import {
  BackendUser,
  mapUserFromApi,
  mapUserToApi,
} from '../../core/http/backend-adapters';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { User, UserCreateRequest } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly User[]> {
    if (this.config.isMockMode()) return this.demoDb.listUsers();
    return this.api
      .execute<readonly BackendUser[] | ApiEnvelope<readonly BackendUser[]>>('users.list')
      .pipe(
        map((response) => unwrapApiData(response)),
        map((items) => (Array.isArray(items) ? items.map(mapUserFromApi) : [])),
      );
  }

  create(value: UserCreateRequest): Observable<User> {
    if (this.config.isMockMode()) return this.demoDb.createUser(value);
    return this.api
      .execute<BackendUser | ApiEnvelope<BackendUser>, Record<string, unknown>>('users.create', {
        body: mapUserToApi(value),
      })
      .pipe(
        map((response) => unwrapApiData(response)),
        map(mapUserFromApi),
      );
  }
}
