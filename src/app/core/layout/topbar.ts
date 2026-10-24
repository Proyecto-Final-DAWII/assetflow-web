import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SessionStore } from '../auth/session.store';
import { DemoDatabaseService } from '../mocks/demo-database.service';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ToastStore } from '../state/toast.store';
import { RuntimeConfigService } from '../config/runtime-config.service';

@Component({
  selector: 'af-topbar',
  imports: [RouterLink, AppIcon],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  readonly menuRequested = output<void>();

  protected readonly session = inject(SessionStore);
  protected readonly demoDb = inject(DemoDatabaseService);
  protected readonly isMockMode = inject(RuntimeConfigService).isMockMode;
  protected readonly canSeeAlerts = computed(() => ['ADMIN', 'SUPPORT'].includes(this.session.user()?.role ?? ''));
  protected readonly profileOpen = signal(false);
  protected readonly loggingOut = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastStore);

  protected toggleProfile(): void {
    this.profileOpen.update((value) => !value);
  }

  protected search(event: Event): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const input = form.elements.namedItem('globalSearch') as HTMLInputElement | null;
    const query = input?.value.trim();
    if (query && input) {
      void this.router.navigate(['/assets'], { queryParams: { search: query } });
      input.value = '';
    }
  }

  protected logout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.auth
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({
        next: () => {
          this.session.clear();
          this.toast.info('Sesión cerrada');
          void this.router.navigate(['/login']);
        },
        error: () => {
          this.session.clear();
          void this.router.navigate(['/login']);
        },
      });
  }
}
