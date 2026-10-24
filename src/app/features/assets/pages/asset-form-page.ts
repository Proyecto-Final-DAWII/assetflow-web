import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  AssetCategory,
  AssetFormValue,
  AssetStatus,
} from '../../../shared/models/asset.model';
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '../../../shared/models/domain-labels';
import { AppIcon } from '../../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { ToastStore } from '../../../core/state/toast.store';
import { AssetsRepository } from '../data/assets.repository';

@Component({
  selector: 'af-asset-form-page',
  imports: [ReactiveFormsModule, RouterLink, AppIcon, EmptyState, PageHeader],
  templateUrl: './asset-form-page.html',
  styleUrl: './asset-form-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetFormPage implements OnInit {
  protected readonly categories = ASSET_CATEGORIES;
  protected readonly statuses = ASSET_STATUSES;
  protected readonly categoryLabels = ASSET_CATEGORY_LABELS;
  protected readonly statusLabels = ASSET_STATUS_LABELS;
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);

  private readonly formBuilder = inject(FormBuilder);
  private readonly repository = inject(AssetsRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastStore);
  private readonly assetId = this.route.snapshot.paramMap.get('id');

  protected readonly isEdit = Boolean(this.assetId);
  protected readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(30)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['LAPTOP' as AssetCategory, Validators.required],
    brand: ['', [Validators.required, Validators.maxLength(60)]],
    model: ['', [Validators.required, Validators.maxLength(100)]],
    serialNumber: ['', [Validators.required, Validators.maxLength(80)]],
    status: ['AVAILABLE' as AssetStatus, Validators.required],
    location: ['', [Validators.required, Validators.maxLength(160)]],
    area: [''],
    acquisitionDate: ['', Validators.required],
    warrantyExpiresAt: [''],
    purchasePrice: [0, Validators.min(0)],
    currency: ['PEN', Validators.required],
    notes: ['', Validators.maxLength(800)],
  });

  ngOnInit(): void {
    if (this.assetId) {
      this.loadAsset(this.assetId);
    }
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      this.toast.warning('Revisa el formulario', 'Completa los campos obligatorios antes de continuar.');
      return;
    }

    const raw = this.form.getRawValue();
    const value: AssetFormValue = {
      ...raw,
      area: raw.area.trim() || undefined,
      warrantyExpiresAt: raw.warrantyExpiresAt || undefined,
      purchasePrice: raw.purchasePrice > 0 ? raw.purchasePrice : undefined,
      notes: raw.notes.trim() || undefined,
    };

    this.saving.set(true);
    const operation = this.assetId
      ? this.repository.update(this.assetId, value)
      : this.repository.create(value);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (asset) => {
        this.toast.success(this.isEdit ? 'Activo actualizado' : 'Activo registrado', `${asset.code} se guardó correctamente.`);
        void this.router.navigate(['/assets', asset.id]);
      },
    });
  }

  protected hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.invalid;
  }

  private loadAsset(id: string): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.repository
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (asset) =>
          this.form.patchValue({
            code: asset.code,
            name: asset.name,
            category: asset.category,
            brand: asset.brand,
            model: asset.model,
            serialNumber: asset.serialNumber,
            status: asset.status,
            location: asset.location,
            area: asset.area ?? '',
            acquisitionDate: asset.acquisitionDate,
            warrantyExpiresAt: asset.warrantyExpiresAt ?? '',
            purchasePrice: asset.purchasePrice ?? 0,
            currency: asset.currency,
            notes: asset.notes ?? '',
          }),
        error: (error: unknown) => this.loadError.set(error instanceof Error ? error.message : 'No fue posible cargar el activo.'),
      });
  }
}
