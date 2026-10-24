import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AppIconName =
  | 'dashboard'
  | 'assets'
  | 'user-check'
  | 'package-check'
  | 'wrench'
  | 'shield-alert'
  | 'archive'
  | 'key'
  | 'ticket'
  | 'bell'
  | 'users'
  | 'settings'
  | 'menu'
  | 'search'
  | 'plus'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-left'
  | 'log-out'
  | 'building'
  | 'calendar'
  | 'laptop'
  | 'smartphone'
  | 'monitor'
  | 'server'
  | 'box'
  | 'network'
  | 'cpu'
  | 'more'
  | 'edit'
  | 'map-pin'
  | 'hash'
  | 'qr-code'
  | 'file'
  | 'history'
  | 'check'
  | 'x'
  | 'alert-triangle'
  | 'info'
  | 'clock'
  | 'external-link'
  | 'eye'
  | 'filter'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'mail'
  | 'briefcase'
  | 'activity'
  | 'return'
  | 'trash';

@Component({
  selector: 'af-icon',
  templateUrl: './app-icon.html',
  styleUrl: './app-icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class AppIcon {
  readonly name = input.required<AppIconName>();
  readonly size = input(20);
  readonly strokeWidth = input(1.8);
}
