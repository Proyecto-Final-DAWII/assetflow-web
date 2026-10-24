import { AlertSeverity, AlertType } from './alert.model';
import { AssetCategory, AssetStatus } from './asset.model';
import { AssignmentStatus } from './assignment.model';
import { IncidentPriority, IncidentStatus } from './incident.model';
import { LicenseStatus } from './license.model';
import { MaintenancePriority, MaintenanceStatus, MaintenanceType } from './maintenance.model';
import { UserRole, UserStatus } from './user.model';

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED: 'Asignado',
  MAINTENANCE: 'En mantenimiento',
  REPAIR: 'En reparación',
  LOST: 'Extraviado',
  RETIRED: 'Dado de baja',
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Computadora',
  MOBILE: 'Celular',
  MONITOR: 'Monitor',
  SERVER: 'Servidor',
  PERIPHERAL: 'Periférico',
  NETWORK: 'Redes',
  OTHER: 'Otro',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ACTIVE: 'Activa',
  RETURNED: 'Devuelta',
  OVERDUE: 'Vencida',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  PREVENTIVE: 'Preventivo',
  CORRECTIVE: 'Correctivo',
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  ACTIVE: 'Activa',
  EXPIRING: 'Por vencer',
  EXPIRED: 'Vencida',
  SUSPENDED: 'Suspendida',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Abierto',
  IN_REVIEW: 'En revisión',
  IN_MAINTENANCE: 'En mantenimiento',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

export const INCIDENT_PRIORITY_LABELS: Record<IncidentPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador TI',
  SUPPORT: 'Soporte TI',
  EMPLOYEE: 'Colaborador',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  WARRANTY: 'Garantía',
  MAINTENANCE: 'Mantenimiento',
  LICENSE: 'Licencia',
  INCIDENT: 'Incidencia',
  SYSTEM: 'Sistema',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  INFO: 'Información',
  WARNING: 'Atención',
  CRITICAL: 'Crítica',
};
