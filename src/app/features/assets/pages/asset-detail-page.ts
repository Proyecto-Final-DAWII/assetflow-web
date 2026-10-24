import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { SessionStore } from '../../../core/auth/session.store';
import { ToastStore } from '../../../core/state/toast.store';
import { Asset, AssetCategory, AssetMovement } from '../../../shared/models/asset.model';
import { ASSET_CATEGORY_LABELS } from '../../../shared/models/domain-labels';
import { AssetDocument, AssetDocumentType } from '../../../shared/models/document.model';
import { AppIcon, AppIconName } from '../../../shared/ui/app-icon/app-icon';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { QrCode } from '../../../shared/ui/qr-code/qr-code';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { DocumentsRepository } from '../../documents/documents.repository';
import { AssetsRepository } from '../data/assets.repository';

@Component({
  selector: 'af-asset-detail-page',
  imports: [RouterLink, AppIcon, EmptyState, QrCode, StatusBadge],
  templateUrl: './asset-detail-page.html',
  styleUrl: './asset-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailPage implements OnInit {
  protected readonly asset = signal<Asset | null>(null);
  protected readonly history = signal<readonly AssetMovement[]>([]);
  protected readonly documents = signal<readonly AssetDocument[]>([]);
  protected readonly documentType = signal<AssetDocumentType>('OTHER');
  protected readonly uploadingDocument = signal(false);
  protected readonly deletingDocumentId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly canManage = computed(() => ['ADMIN', 'SUPPORT'].includes(this.session.user()?.role ?? ''));
  protected readonly qrValue = computed(() => {
    const asset = this.asset();
    return asset ? new URL(`assets/${asset.id}`, document.baseURI).toString() : document.baseURI;
  });
  protected readonly categoryLabels = ASSET_CATEGORY_LABELS;
  protected readonly qrCode = viewChild(QrCode);

  private readonly repository = inject(AssetsRepository);
  private readonly documentsRepository = inject(DocumentsRepository);
  private readonly toast = inject(ToastStore);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionStore);
  private readonly assetId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      asset: this.repository.getById(this.assetId),
      history: this.repository.history(this.assetId),
      documents: this.documentsRepository.list(this.assetId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ asset, history, documents }) => {
          this.asset.set(asset);
          this.history.set(history);
          this.documents.set(documents);
        },
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No fue posible cargar el activo.'),
      });
  }

  protected categoryIcon(category: AssetCategory): AppIconName {
    const icons: Record<AssetCategory, AppIconName> = {
      LAPTOP: 'laptop',
      DESKTOP: 'cpu',
      MOBILE: 'smartphone',
      MONITOR: 'monitor',
      SERVER: 'server',
      PERIPHERAL: 'box',
      NETWORK: 'network',
      OTHER: 'assets',
    };
    return icons[category];
  }

  protected formatDate(value?: string): string {
    if (!value) return 'No registrada';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(
      new Date(value.length === 10 ? `${value}T12:00:00` : value),
    );
  }

  protected formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected uploadDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.toast.warning('Archivo demasiado grande', 'El limite configurado en el frontend es de 10 MB.');
      input.value = '';
      return;
    }

    this.uploadingDocument.set(true);
    this.documentsRepository
      .upload(this.assetId, file, this.documentType())
      .pipe(finalize(() => {
        this.uploadingDocument.set(false);
        input.value = '';
      }))
      .subscribe({
        next: (document) => {
          this.documents.update((items) => [document, ...items]);
          this.asset.update((asset) => asset ? { ...asset, documentCount: asset.documentCount + 1 } : asset);
          this.toast.success('Documento adjuntado', file.name);
        },
        error: (error: unknown) => this.toast.error('No se pudo adjuntar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected deleteDocument(document: AssetDocument): void {
    if (this.deletingDocumentId()) return;
    this.deletingDocumentId.set(document.id);
    this.documentsRepository
      .delete(document.id)
      .pipe(finalize(() => this.deletingDocumentId.set(null)))
      .subscribe({
        next: () => {
          this.documents.update((items) => items.filter((item) => item.id !== document.id));
          this.asset.update((asset) => asset ? { ...asset, documentCount: Math.max(0, asset.documentCount - 1) } : asset);
          this.toast.success('Documento eliminado', document.fileName);
        },
        error: (error: unknown) => this.toast.error('No se pudo eliminar', error instanceof Error ? error.message : 'Intenta nuevamente.'),
      });
  }

  protected documentTypeLabel(type: AssetDocumentType): string {
    return { INVOICE: 'Factura', WARRANTY: 'Garantia', DELIVERY_ACT: 'Acta de entrega', PHOTO: 'Fotografia', OTHER: 'Otro' }[type];
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected updateDocumentType(event: Event): void {
    this.documentType.set((event.target as HTMLSelectElement).value as AssetDocumentType);
  }

  protected downloadQr(asset: Asset): void {
    this.qrCode()?.download(`${asset.code}-qr.png`);
  }

  protected formatMoney(value?: number, currency = 'PEN'): string {
    if (value === undefined) return 'No registrado';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  }
}
