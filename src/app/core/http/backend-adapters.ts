import { Asset, AssetCategory, AssetFormValue, AssetMovement, AssetStatus } from '../../shared/models/asset.model';
import { Assignment, AssignmentCreateRequest, AssignmentStatus } from '../../shared/models/assignment.model';
import { Maintenance, MaintenanceCreateRequest, MaintenancePriority, MaintenanceStatus, MaintenanceType } from '../../shared/models/maintenance.model';
import { User, UserCreateRequest, UserRole } from '../../shared/models/user.model';

export interface BackendAsset {
  readonly id: string;
  readonly serialNumber: string;
  readonly name: string;
  readonly category: string;
  readonly brand?: string;
  readonly model?: string;
  readonly acquisitionDate?: string;
  readonly warrantyExpiration?: string;
  readonly status: string;
  readonly location?: string;
  readonly area?: string;
  readonly purchasePrice?: number;
  readonly currency?: string;
  readonly notes?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface BackendAssignment {
  readonly id: number;
  readonly assetId: string;
  readonly userId: string;
  readonly assignmentDate: string;
  readonly returnDate?: string;
  readonly status: string;
}

export interface BackendMaintenance {
  readonly id: number;
  readonly assetId: string;
  readonly maintenanceType: string;
  readonly description: string;
  readonly priority: string;
  readonly startDate: string;
  readonly status: string;
}

export interface BackendUser {
  readonly id: string;
  readonly username: string;
  readonly fullName: string;
  readonly email: string;
  readonly role: string;
}

export interface BackendAudit {
  readonly id: number;
  readonly assetId: string;
  readonly userId?: string;
  readonly actionType: string;
  readonly details?: string;
  readonly timestamp: string;
}

const ASSET_STATUS_FROM_API: Readonly<Record<string, AssetStatus>> = {
  DISPONIBLE: 'AVAILABLE', ASIGNADO: 'ASSIGNED', EN_MANTENIMIENTO: 'MAINTENANCE',
  EN_REPARACION: 'REPAIR', EXTRAVIADO: 'LOST', DADO_DE_BAJA: 'RETIRED',
};

const ASSET_STATUS_TO_API: Readonly<Record<AssetStatus, string>> = {
  AVAILABLE: 'DISPONIBLE', ASSIGNED: 'ASIGNADO', MAINTENANCE: 'EN_MANTENIMIENTO',
  REPAIR: 'EN_REPARACION', LOST: 'EXTRAVIADO', RETIRED: 'DADO_DE_BAJA',
};

const ROLE_FROM_API: Readonly<Record<string, UserRole>> = {
  ADMINISTRADOR_TI: 'ADMIN', SOPORTE_TI: 'SUPPORT', COLABORADOR: 'EMPLOYEE',
};

const ROLE_TO_API: Readonly<Record<UserRole, string>> = {
  ADMIN: 'ADMINISTRADOR_TI', SUPPORT: 'SOPORTE_TI', EMPLOYEE: 'COLABORADOR',
};

const VALID_CATEGORIES = new Set<AssetCategory>([
  'LAPTOP', 'DESKTOP', 'MOBILE', 'MONITOR', 'SERVER', 'PERIPHERAL', 'NETWORK', 'OTHER',
]);

export function mapAssetFromApi(value: BackendAsset): Asset {
  const category = value.category.toUpperCase() as AssetCategory;
  const createdAt = value.createdAt ?? `${value.acquisitionDate ?? '1970-01-01'}T00:00:00`;
  return {
    id: value.id,
    code: value.id,
    name: value.name,
    category: VALID_CATEGORIES.has(category) ? category : 'OTHER',
    brand: value.brand ?? '',
    model: value.model ?? '',
    serialNumber: value.serialNumber,
    status: ASSET_STATUS_FROM_API[value.status] ?? (value.status as AssetStatus),
    location: value.location ?? 'Sin ubicación registrada',
    area: value.area,
    acquisitionDate: value.acquisitionDate ?? '',
    warrantyExpiresAt: value.warrantyExpiration,
    purchasePrice: value.purchasePrice,
    currency: value.currency ?? 'PEN',
    notes: value.notes,
    documentCount: 0,
    maintenanceCount: 0,
    createdAt,
    updatedAt: value.updatedAt ?? createdAt,
  };
}

export function mapAssetToApi(value: AssetFormValue): Record<string, unknown> {
  return {
    id: value.code,
    serialNumber: value.serialNumber,
    name: value.name,
    category: value.category,
    brand: value.brand,
    model: value.model,
    acquisitionDate: value.acquisitionDate,
    warrantyExpiration: value.warrantyExpiresAt,
    status: ASSET_STATUS_TO_API[value.status],
    location: value.location,
    area: value.area,
    purchasePrice: value.purchasePrice,
    currency: value.currency,
    notes: value.notes,
  };
}

export function mapUserFromApi(value: BackendUser): User {
  return {
    id: value.id,
    fullName: value.fullName,
    email: value.email,
    role: ROLE_FROM_API[value.role] ?? (value.role as UserRole),
    status: 'ACTIVE',
    area: 'Sin área registrada',
    position: value.username,
    assignedAssets: 0,
    createdAt: '1970-01-01T00:00:00',
  };
}

export function mapUserToApi(value: UserCreateRequest): Record<string, unknown> {
  return { username: value.email.split('@')[0], fullName: value.fullName, email: value.email, role: ROLE_TO_API[value.role] };
}

export function mapAssignmentFromApi(value: BackendAssignment): Assignment {
  const status: AssignmentStatus = value.status === 'DEVUELTO' ? 'RETURNED' : 'ACTIVE';
  return {
    id: String(value.id), assetId: value.assetId, assetCode: value.assetId, assetName: value.assetId,
    collaborator: { id: value.userId, fullName: value.userId, email: '', area: '' },
    assignedAt: value.assignmentDate, returnedAt: value.returnDate, status, deliveredBy: 'AssetFlow',
  };
}

export function mapAssignmentToApi(value: AssignmentCreateRequest): Record<string, string> {
  return { assetId: value.assetId, userId: value.userId };
}

export function mapMaintenanceFromApi(value: BackendMaintenance): Maintenance {
  const typeMap: Readonly<Record<string, MaintenanceType>> = { PREVENTIVO: 'PREVENTIVE', CORRECTIVO: 'CORRECTIVE' };
  const statusMap: Readonly<Record<string, MaintenanceStatus>> = {
    PROGRAMADO: 'SCHEDULED', EN_PROCESO: 'IN_PROGRESS', COMPLETADO: 'COMPLETED', CANCELADO: 'CANCELLED',
  };
  const priorityMap: Readonly<Record<string, MaintenancePriority>> = {
    BAJA: 'LOW', MEDIA: 'MEDIUM', ALTA: 'HIGH', CRITICA: 'CRITICAL',
  };
  return {
    id: String(value.id), assetId: value.assetId, assetCode: value.assetId, assetName: value.assetId,
    type: typeMap[value.maintenanceType] ?? (value.maintenanceType as MaintenanceType),
    status: statusMap[value.status] ?? (value.status as MaintenanceStatus),
    priority: priorityMap[value.priority] ?? (value.priority as MaintenancePriority),
    title: value.description, description: value.description, scheduledAt: value.startDate,
    startedAt: value.status === 'EN_PROCESO' ? value.startDate : undefined,
    completedAt: value.status === 'COMPLETADO' ? value.startDate : undefined,
    currency: 'PEN',
  };
}

export function mapMaintenanceToApi(value: MaintenanceCreateRequest): Record<string, unknown> {
  return {
    assetId: value.assetId,
    maintenanceType: value.type === 'PREVENTIVE' ? 'PREVENTIVO' : 'CORRECTIVO',
    description: value.title === value.description ? value.description : `${value.title}: ${value.description}`,
    priority: value.priority,
    startDate: value.scheduledAt,
    status: 'PROGRAMADO',
  };
}

export function mapAuditToMovement(value: BackendAudit): AssetMovement {
  const typeMap: Readonly<Record<string, AssetMovement['type']>> = {
    ACTIVO_REGISTRADO: 'REGISTERED', ASIGNACION_CREADA: 'ASSIGNED', ASIGNACION_DEVUELTA: 'RETURNED',
    MANTENIMIENTO_CREADO: 'MAINTENANCE_STARTED', MANTENIMIENTO_COMPLETADO: 'MAINTENANCE_COMPLETED',
  };
  return {
    id: String(value.id), assetId: value.assetId, type: typeMap[value.actionType] ?? 'STATUS_CHANGED',
    title: value.actionType.replaceAll('_', ' ').toLocaleLowerCase('es-PE'),
    description: value.details ?? 'Movimiento registrado por el sistema.', occurredAt: value.timestamp,
    actor: value.userId ?? 'AssetFlow',
  };
}
