import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIcon, AppIconName } from '../app-icon/app-icon';

@Component({
  selector: 'af-empty-state',
  imports: [AppIcon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input<AppIconName>('search');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
