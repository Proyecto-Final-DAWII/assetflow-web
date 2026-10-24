import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '../auth/session.store';
import { NAVIGATION_ITEMS } from '../menu/navigation';
import { USER_ROLE_LABELS } from '../../shared/models/domain-labels';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';

@Component({
  selector: 'af-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly open = input(false);
  readonly closeRequested = output<void>();

  protected readonly session = inject(SessionStore);
  protected readonly items = computed(() => {
    const role = this.session.user()?.role;
    return role ? NAVIGATION_ITEMS.filter((item) => item.roles.includes(role)) : [];
  });
  protected readonly roleLabel = computed(() => {
    const role = this.session.user()?.role;
    return role ? USER_ROLE_LABELS[role] : '';
  });

  protected closeOnMobile(): void {
    this.closeRequested.emit();
  }
}
