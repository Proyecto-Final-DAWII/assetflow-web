import { UserSummary } from './user.model';

export const ASSET_STATUSES = [
  'AVAILABLE',
  'ASSIGNED',
  'MAINTENANCE',
  'REPAIR',
  'LOST',
  'RETIRED',
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_CATEGORIES = [
  'LAPTOP',
  'DESKTOP',
  'MOBILE',
  'MONITOR',
  'SERVER',
  'PERIPHERAL',
  'NETWORK',
  'OTHER',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export interface Asset {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: AssetCategory;
  readonly brand: string;
  readonly model: string;
  readonly serialNumber: string;
  readonly status: AssetStatus;
  readonly location: string;
  readonly area?: string;
  readonly acquisitionDate: string;
  readonly warrantyExpiresAt?: string;
  readonly purchasePrice?: number;
  readonly currency: string;
  readonly assignedTo?: UserSummary;
  readonly assignmentId?: string;
  readonly notes?: string;
  readonly documentCount: number;
  readonly maintenanceCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AssetMovement {
  readonly id: string;
  readonly assetId: string;
  readonly type:
    | 'REGISTERED'
    | 'ASSIGNED'
    | 'RETURNED'
    | 'MAINTENANCE_STARTED'
    | 'MAINTENANCE_COMPLETED'
    | 'REASSIGNED'
    | 'STATUS_CHANGED'
    | 'RETIRED';
  readonly title: string;
  readonly description: string;
  readonly occurredAt: string;
  readonly actor: string;
}

export interface AssetFilters {
  readonly search?: string;
  readonly status?: AssetStatus | '';
  readonly category?: AssetCategory | '';
  readonly page: number;
  readonly size: number;
}

export interface AssetFormValue {
  readonly code: string;
  readonly name: string;
  readonly category: AssetCategory;
  readonly brand: string;
  readonly model: string;
  readonly serialNumber: string;
  readonly status: AssetStatus;
  readonly location: string;
  readonly area?: string;
  readonly acquisitionDate: string;
  readonly warrantyExpiresAt?: string;
  readonly purchasePrice?: number;
  readonly currency: string;
  readonly notes?: string;
}
