import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ToastStore } from '../../core/state/toast.store';
import { Asset } from '../../shared/models/asset.model';
import { Assignment } from '../../shared/models/assignment.model';
import { User } from '../../shared/models/user.model';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { AssetsRepository } from '../assets/data/assets.repository';
import { UsersRepository } from '../users/users.repository';
import { AssignmentsRepository } from './assignments.repository';

@Component({
  selector: 'af-assignments-page',
  imports: [ReactiveFormsModule, RouterLink, AppIcon, EmptyState, PageHeader, StatusBadge],
  templateUrl: './assignments-page.html',
  styleUrl: './assignments-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsPage implements OnInit {
  protected readonly items = signal<readonly Assignment[]>([]);
  protected readonly availableAssets = signal<readonly Asset[]>([]);
  protected readonly users = signal<readonly User[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly activeCount = computed(() => this.items().filter((item) => item.status === 'ACTIVE').length);
  protected readonly returnedCount = computed(() => this.items().filter((item) => item.status === 'RETURNED').length);
  protected readonly overdueCount = computed(() => this.items().filter((item) => item.status === 'OVERDUE').length);

  private readonly repository = inject(AssignmentsRepository);
  private readonly assetsRepository = inject(AssetsRepository);
  private readonly usersRepository = inject(UsersRepository);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastStore);

  protected readonly form = this.formBuilder.nonNullable.group({
    assetId: ['', Validators.required],
    userId: ['', Validators.required],
    assignedAt: [new Date().toISOString().slice(0, 10), Validators.required],
    expectedReturnAt: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      assignments: this.repository.list(),
      assets: this.assetsRepository.availableAssets(),
      users: this.usersRepository.list(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ assignments, assets, users }) => {
          this.items.set(assignments);
          this.availableAssets.set(assets);
          this.users.set(users.filter((user) => user.status === 'ACTIVE'));
        },
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No fue posible cargar las asignaciones.'),
      });
  }

  protected create(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.repository
      .create({
        ...raw,
        expectedReturnAt: raw.expectedReturnAt || undefined,
        notes: raw.notes.trim() || undefined,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (assignment) => {
          this.toast.success('Asignación registrada', `${assignment.assetCode} fue asignado a ${assignment.collaborator.fullName}.`);
          this.form.reset({
            assetId: '',
            userId: '',
            assignedAt: new Date().toISOString().slice(0, 10),
            expectedReturnAt: '',
            notes: '',
          });
          this.formOpen.set(false);
          this.load();
        },
      });
  }

  protected returnAsset(assignment: Assignment): void {
    this.repository.returnAsset(assignment.id).subscribe({
      next: () => {
        this.toast.success('Devolución registrada', `${assignment.assetCode} volvió a estar disponible.`);
        this.load();
      },
    });
  }

  protected formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(value.length === 10 ? `${value}T12:00:00` : value),
    );
  }
}
