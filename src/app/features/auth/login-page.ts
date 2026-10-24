import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SessionStore } from '../../core/auth/session.store';
import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { UserRole } from '../../shared/models/user.model';
import { AppIcon, AppIconName } from '../../shared/ui/app-icon/app-icon';

interface DemoRoleOption {
  readonly role: UserRole;
  readonly label: string;
  readonly description: string;
  readonly icon: AppIconName;
}

@Component({
  selector: 'af-login-page',
  imports: [ReactiveFormsModule, AppIcon],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly config = inject(RuntimeConfigService).snapshot();
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);
  protected readonly demoRoles: readonly DemoRoleOption[] = [
    { role: 'ADMIN', label: 'Administrador TI', description: 'Acceso completo', icon: 'shield-alert' },
    { role: 'SUPPORT', label: 'Soporte TI', description: 'Operación y soporte', icon: 'wrench' },
    { role: 'EMPLOYEE', label: 'Colaborador', description: 'Mis activos e incidencias', icon: 'user-check' },
  ];

  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@assetflow.pe', [Validators.required, Validators.email]],
    password: ['Demo123*', [Validators.required, Validators.minLength(6)]],
  });

  protected login(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (session) => this.completeLogin(session),
        error: (error: unknown) => this.errorMessage.set(error instanceof Error ? error.message : 'No fue posible iniciar sesión.'),
      });
  }

  protected loginAs(role: UserRole): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.auth
      .loginAsRole(role)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (session) => this.completeLogin(session),
        error: (error: unknown) => this.errorMessage.set(error instanceof Error ? error.message : 'No fue posible iniciar sesión.'),
      });
  }

  private completeLogin(session: Parameters<SessionStore['set']>[0]): void {
    this.session.set(session);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
    void this.router.navigateByUrl(returnUrl);
  }
}
