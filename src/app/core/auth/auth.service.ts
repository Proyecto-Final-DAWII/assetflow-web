import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { ApiClientService } from '../http/api-client.service';
import { ApiEnvelope } from '../http/api.models';
import { unwrapApiData } from '../http/api-response.utils';
import { DemoDatabaseService } from '../mocks/demo-database.service';
import { AuthSession, LoginRequest, User, UserRole } from '../../shared/models/user.model';
import { BackendUser, mapUserFromApi } from '../http/backend-adapters';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly demoDb = inject(DemoDatabaseService);

  login(credentials: LoginRequest): Observable<AuthSession> {
    if (this.runtimeConfig.isMockMode()) {
      const user = this.demoDb.loginByEmail(credentials.email);
      if (!user || !credentials.password.trim()) {
        return throwError(() => new Error('Credenciales incorrectas. Usa una cuenta demo mostrada en pantalla.'));
      }
      return of(this.createDemoSession(user)).pipe(delay(350));
    }

    return this.api
      .execute<BackendAuthSession | ApiEnvelope<BackendAuthSession>, LoginRequest>('auth.login', { body: credentials })
      .pipe(map((response) => this.mapBackendSession(unwrapApiData(response))));
  }

  loginAsRole(role: UserRole): Observable<AuthSession> {
    if (!this.runtimeConfig.snapshot().auth.allowDemoRoleLogin) {
      return throwError(() => new Error('El acceso rápido por rol está deshabilitado.'));
    }
    return of(this.createDemoSession(this.demoDb.loginAsRole(role))).pipe(delay(220));
  }

  logout(): Observable<void> {
    if (this.runtimeConfig.isMockMode()) {
      return of(undefined).pipe(delay(120));
    }
    return this.api.execute<void>('auth.logout');
  }

  private createDemoSession(user: User): AuthSession {
    return {
      accessToken: `demo.${user.role.toLowerCase()}.${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      user,
    };
  }

  private mapBackendSession(session: BackendAuthSession): AuthSession {
    return {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      user: mapUserFromApi(session.user),
    };
  }
}

interface BackendAuthSession {
  readonly accessToken: string;
  readonly tokenType?: string;
  readonly expiresAt?: string;
  readonly user: BackendUser;
}
