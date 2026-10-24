import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingStore {
  private readonly activeRequests = signal(0);
  readonly isLoading = computed(() => this.activeRequests() > 0);

  begin(): void {
    this.activeRequests.update((value) => value + 1);
  }

  end(): void {
    this.activeRequests.update((value) => Math.max(0, value - 1));
  }
}
