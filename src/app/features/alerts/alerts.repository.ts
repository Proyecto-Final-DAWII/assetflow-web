import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { ApiEnvelope } from '../../core/http/api.models';
import { unwrapApiData } from '../../core/http/api-response.utils';
import { DemoDatabaseService } from '../../core/mocks/demo-database.service';
import { AlertItem } from '../../shared/models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertsRepository {
  private readonly config = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  list(): Observable<readonly AlertItem[]> {
    if (this.config.isMockMode()) return this.demoDb.listAlerts();
    return this.api
      .execute<readonly AlertItem[] | ApiEnvelope<readonly AlertItem[]>>('alerts.list')
      .pipe(map((response) => unwrapApiData(response)));
  }

  markRead(id: string): Observable<void> {
    if (this.config.isMockMode()) return this.demoDb.markAlertRead(id);
    return this.api.execute<void>('alerts.markRead', { pathParams: { id } });
  }

  markAllRead(): Observable<void> {
    if (this.config.isMockMode()) return this.demoDb.markAllAlertsRead();
    return this.api.execute<void>('alerts.markAllRead');
  }
}
