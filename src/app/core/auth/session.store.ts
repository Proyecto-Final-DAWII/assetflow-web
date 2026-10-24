import { Injectable, computed, inject, signal } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { AuthSession } from '../../shared/models/user.model';
import { UserRole } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly sessionState = signal<AuthSession | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly accessToken = computed(() => this.sessionState()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.accessToken));

  constructor() {
    this.restore();
  }

  set(session: AuthSession): void {
    this.sessionState.set(session);
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(session));
    } catch {
      // La sesión sigue disponible en memoria aunque el navegador bloquee localStorage.
    }
  }

  clear(): void {
    this.sessionState.set(null);
    try {
      localStorage.removeItem(this.storageKey());
    } catch {
      // Sin acción adicional.
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) {
        return;
      }
      const candidate = this.normalizeSession(JSON.parse(raw) as AuthSession);
      const expiresAt = candidate?.expiresAt ? Date.parse(candidate.expiresAt) : Number.POSITIVE_INFINITY;
      if (candidate?.accessToken && candidate?.user?.id && expiresAt > Date.now()) {
        this.sessionState.set(candidate);
      } else {
        this.clear();
      }
    } catch {
      this.clear();
    }
  }

  private storageKey(): string {
    return this.runtimeConfig.snapshot().auth.storageKey;
  }

  private normalizeSession(candidate: AuthSession): AuthSession {
    const roleMap: Record<string, UserRole> = {
      ADMINISTRADOR_TI: 'ADMIN',
      SOPORTE_TI: 'SUPPORT',
      COLABORADOR: 'EMPLOYEE',
    };
    const role = roleMap[candidate?.user?.role] ?? candidate?.user?.role;
    return role && candidate?.user ? { ...candidate, user: { ...candidate.user, role } } : candidate;
  }
}
