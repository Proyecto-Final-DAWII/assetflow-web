import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { ApiClientService } from '../../core/http/api-client.service';
import { SKIP_AUTH, SKIP_ERROR_TOAST, SKIP_GLOBAL_LOADING } from '../../core/http/http-context.tokens';
import { ToastStore } from '../../core/state/toast.store';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';

type HealthStatus = 'IDLE' | 'TESTING' | 'ONLINE' | 'OFFLINE';

@Component({
  selector: 'af-settings-page',
  imports: [AppIcon, PageHeader],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly api = inject(ApiClientService);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly config = this.runtimeConfig.snapshot();
  protected readonly clients = Object.entries(this.config.api.clients).map(([key, value]) => ({ key, ...value }));
  protected readonly endpoints = Object.entries(this.config.api.endpoints).map(([key, value]) => ({ key, ...value }));
  protected readonly features = Object.entries(this.config.features).map(([key, enabled]) => ({ key, enabled }));
  protected readonly healthStatus = signal<HealthStatus>('IDLE');
  protected readonly healthMessage = signal('Aun no se ha probado la conexion.');

  protected testConnection(): void {
    this.healthStatus.set('TESTING');
    this.healthMessage.set('Comprobando disponibilidad del servicio...');

    if (this.config.api.useMocks) {
      window.setTimeout(() => {
        this.healthStatus.set('ONLINE');
        this.healthMessage.set('El modo demo esta operativo. Desactiva useMocks para probar el backend real.');
      }, 450);
      return;
    }

    const context = new HttpContext()
      .set(SKIP_AUTH, true)
      .set(SKIP_ERROR_TOAST, true)
      .set(SKIP_GLOBAL_LOADING, true);
    this.api
      .execute<unknown>('health.check', { context })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.healthStatus() === 'TESTING') this.healthStatus.set('OFFLINE');
        }),
      )
      .subscribe({
        next: () => {
          this.healthStatus.set('ONLINE');
          this.healthMessage.set('El backend respondio correctamente.');
        },
        error: (error: unknown) => {
          this.healthStatus.set('OFFLINE');
          this.healthMessage.set(error instanceof Error ? error.message : 'No fue posible conectar con el backend.');
        },
      });
  }

  protected async copy(value: string, label: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        this.copyWithFallback(value);
      }
      this.toast.success('Copiado', `${label} fue copiado al portapapeles.`);
    } catch {
      this.toast.error('No se pudo copiar', 'Selecciona y copia el valor manualmente.');
    }
  }

  private copyWithFallback(value: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard unavailable');
  }

  protected featureLabel(key: string): string {
    const labels: Record<string, string> = { qr: 'Codigos QR', documents: 'Documentos adjuntos', audit: 'Auditoria', notifications: 'Notificaciones' };
    return labels[key] ?? key;
  }
}
