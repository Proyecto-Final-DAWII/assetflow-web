import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../shared/models/user.model';
import { SessionStore } from './session.store';

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as readonly UserRole[] | undefined) ?? [];
  const role = session.user()?.role;

  return role && (allowedRoles.length === 0 || allowedRoles.includes(role))
    ? true
    : router.createUrlTree(['/dashboard']);
};
