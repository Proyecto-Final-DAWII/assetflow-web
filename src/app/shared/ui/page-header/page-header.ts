import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'af-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
