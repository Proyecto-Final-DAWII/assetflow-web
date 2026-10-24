import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastStore } from '../../core/state/toast.store';
import { USER_ROLE_LABELS } from '../../shared/models/domain-labels';
import { User, UserRole } from '../../shared/models/user.model';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { UsersRepository } from './users.repository';

@Component({
  selector: 'af-users-page',
  imports: [AppIcon, EmptyState, PageHeader, ReactiveFormsModule, StatusBadge],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  private readonly repository = inject(UsersRepository);
  private readonly toast = inject(ToastStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly items = signal<readonly User[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly search = signal('');
  protected readonly roleFilter = signal<UserRole | ''>('');
  protected readonly roleLabels = USER_ROLE_LABELS;

  protected readonly filteredItems = computed(() => {
    const search = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.items().filter((item) => {
      const matchesSearch = !search || [item.fullName, item.email, item.area, item.position].join(' ').toLowerCase().includes(search);
      return matchesSearch && (!role || item.role === role);
    });
  });
  protected readonly activeCount = computed(() => this.items().filter((item) => item.status === 'ACTIVE').length);
  protected readonly adminCount = computed(() => this.items().filter((item) => item.role === 'ADMIN').length);
  protected readonly supportCount = computed(() => this.items().filter((item) => item.role === 'SUPPORT').length);
  protected readonly assignedAssets = computed(() => this.items().reduce((total, item) => total + item.assignedAssets, 0));

  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['EMPLOYEE' as UserRole, Validators.required],
    area: ['', [Validators.required, Validators.maxLength(80)]],
    position: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', Validators.maxLength(30)],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (items) => this.items.set(items),
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.'),
      });
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.repository
      .create(this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.items.update((items) => [user, ...items]);
          this.form.reset({ fullName: '', email: '', role: 'EMPLOYEE', area: '', position: '', phone: '' });
          this.formOpen.set(false);
          this.toast.success('Usuario creado', `${user.fullName} ya puede acceder a AssetFlow.`);
        },
        error: (error: unknown) => this.toast.error('No se pudo crear el usuario', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected updateRole(event: Event): void {
    this.roleFilter.set((event.target as HTMLSelectElement).value as UserRole | '');
  }

  protected initials(user: User): string {
    return user.fullName.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin registro';
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}
