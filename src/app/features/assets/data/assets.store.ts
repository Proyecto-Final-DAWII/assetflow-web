import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Asset, AssetFilters } from '../../../shared/models/asset.model';
import { PageResult } from '../../../shared/models/page.model';
import { AssetsRepository } from './assets.repository';

const INITIAL_FILTERS: AssetFilters = {
  search: '',
  status: '',
  category: '',
  page: 0,
  size: 10,
};

const EMPTY_PAGE: PageResult<Asset> = {
  items: [],
  page: 0,
  size: 10,
  total: 0,
  totalPages: 0,
};

@Injectable()
export class AssetsStore {
  private readonly repository = inject(AssetsRepository);
  private readonly filtersState = signal<AssetFilters>(INITIAL_FILTERS);
  private readonly pageState = signal<PageResult<Asset>>(EMPTY_PAGE);

  readonly filters = this.filtersState.asReadonly();
  readonly page = this.pageState.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .list(this.filtersState())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (page) => this.pageState.set(page),
        error: (error: unknown) => this.error.set(error instanceof Error ? error.message : 'No fue posible cargar los activos.'),
      });
  }

  patchFilters(filters: Partial<AssetFilters>, resetPage = true): void {
    this.filtersState.update((current) => ({
      ...current,
      ...filters,
      page: resetPage ? 0 : filters.page ?? current.page,
    }));
    this.load();
  }

  setPage(page: number): void {
    this.filtersState.update((current) => ({ ...current, page }));
    this.load();
  }

  clearFilters(): void {
    this.filtersState.set(INITIAL_FILTERS);
    this.load();
  }
}
