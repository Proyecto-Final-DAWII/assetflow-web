import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { SoftwareLicense } from '../../shared/models/license.model';

@Injectable({ providedIn: 'root' })
export class LicensesRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly SoftwareLicense[]> {
    if (this.config.isMockMode()) return this.demoDb.listLicenses();
    return this.api
      .execute<readonly SoftwareLicense[] | ApiEnvelope<readonly SoftwareLicense[]>>('licenses.list')
      .pipe(map((response) => unwrapApiData(response)));
  }
}
