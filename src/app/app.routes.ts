import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { AppShell } from './core/layout/app-shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page').then((module) => module.LoginPage),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | AssetFlow',
        loadComponent: () => import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage),
      },
      {
        path: 'assets',
        title: 'Activos | AssetFlow',
        loadComponent: () => import('./features/assets/pages/assets-page').then((module) => module.AssetsPage),
      },
      {
        path: 'assets/new',
        title: 'Nuevo activo | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/assets/pages/asset-form-page').then((module) => module.AssetFormPage),
      },
      {
        path: 'assets/:id/edit',
        title: 'Editar activo | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/assets/pages/asset-form-page').then((module) => module.AssetFormPage),
      },
      {
        path: 'assets/:id',
        title: 'Detalle del activo | AssetFlow',
        loadComponent: () => import('./features/assets/pages/asset-detail-page').then((module) => module.AssetDetailPage),
      },
      {
        path: 'assignments',
        title: 'Asignaciones | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/assignments/assignments-page').then((module) => module.AssignmentsPage),
      },
      {
        path: 'maintenance',
        title: 'Mantenimientos | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/maintenance/maintenance-page').then((module) => module.MaintenancePage),
      },
      {
        path: 'licenses',
        title: 'Licencias | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/licenses/licenses-page').then((module) => module.LicensesPage),
      },
      {
        path: 'incidents',
        title: 'Incidencias | AssetFlow',
        loadComponent: () => import('./features/incidents/incidents-page').then((module) => module.IncidentsPage),
      },
      {
        path: 'alerts',
        title: 'Alertas | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/alerts/alerts-page').then((module) => module.AlertsPage),
      },
      {
        path: 'users',
        title: 'Usuarios y roles | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/users/users-page').then((module) => module.UsersPage),
      },
      {
        path: 'settings',
        title: 'Configuración | AssetFlow',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/settings/settings-page').then((module) => module.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
