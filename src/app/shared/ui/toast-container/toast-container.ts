import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastStore } from '../../../core/state/toast.store';
import { AppIcon, AppIconName } from '../app-icon/app-icon';

@Component({
  selector: 'af-toast-container',
  imports: [AppIcon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  protected readonly toast = inject(ToastStore);

  protected iconFor(tone: string): AppIconName {
    if (tone === 'success') return 'check';
    if (tone === 'error' || tone === 'warning') return 'alert-triangle';
    return 'info';
  }
}
