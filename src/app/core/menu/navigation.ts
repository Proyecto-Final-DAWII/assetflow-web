import { UserRole } from '../../shared/models/user.model';
import { AppIconName } from '../../shared/ui/app-icon/app-icon';

export interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: AppIconName;
  readonly roles: readonly UserRole[];
  readonly exact?: boolean;
}

const allRoles: readonly UserRole[] = ['ADMIN', 'SUPPORT', 'EMPLOYEE'];
const operationsRoles: readonly UserRole[] = ['ADMIN', 'SUPPORT'];

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', roles: allRoles },
  { label: 'Activos', route: '/assets', icon: 'assets', roles: allRoles },
  { label: 'Asignaciones', route: '/assignments', icon: 'user-check', roles: operationsRoles },
  { label: 'Mantenimientos', route: '/maintenance', icon: 'wrench', roles: operationsRoles },
  { label: 'Licencias', route: '/licenses', icon: 'key', roles: operationsRoles },
  { label: 'Incidencias', route: '/incidents', icon: 'ticket', roles: allRoles },
  { label: 'Alertas', route: '/alerts', icon: 'bell', roles: operationsRoles },
  { label: 'Usuarios y roles', route: '/users', icon: 'users', roles: ['ADMIN'] },
  { label: 'Configuración', route: '/settings', icon: 'settings', roles: ['ADMIN'] },
];
