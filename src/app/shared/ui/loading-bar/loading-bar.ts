import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingStore } from '../../../core/state/loading.store';

@Component({
  selector: 'af-loading-bar',
  template: `@if (loading.isLoading()) { <span class="loading-bar" aria-label="Cargando"></span> }`,
  styles: `
    :host { position: fixed; z-index: 1300; top: 0; right: 0; left: 0; height: 3px; pointer-events: none; }
    .loading-bar { display: block; width: 35%; height: 100%; border-radius: 0 3px 3px 0; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); animation: loading 1.1s ease-in-out infinite; }
    @keyframes loading { 0% { transform: translateX(-110%); } 100% { transform: translateX(390%); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingBar {
  protected readonly loading = inject(LoadingStore);
}
