import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppIcon } from '../app-icon/app-icon';

@Component({
  selector: 'af-pagination',
  imports: [AppIcon],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input(0);
  readonly size = input(10);
  readonly total = input(0);
  readonly totalPages = input(0);
  readonly pageChange = output<number>();

  protected readonly rangeStart = computed(() => (this.total() === 0 ? 0 : this.page() * this.size() + 1));
  protected readonly rangeEnd = computed(() => Math.min((this.page() + 1) * this.size(), this.total()));
  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const start = Math.max(0, Math.min(current - 2, total - 5));
    return Array.from({ length: Math.min(5, total) }, (_item, index) => start + index);
  });

  protected goTo(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
