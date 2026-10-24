export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Maintenance {
  readonly id: string;
  readonly assetId: string;
  readonly assetCode: string;
  readonly assetName: string;
  readonly type: MaintenanceType;
  readonly status: MaintenanceStatus;
  readonly priority: MaintenancePriority;
  readonly title: string;
  readonly description: string;
  readonly provider?: string;
  readonly technician?: string;
  readonly scheduledAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly cost?: number;
  readonly currency: string;
  readonly nextMaintenanceAt?: string;
}

export interface MaintenanceCreateRequest {
  readonly assetId: string;
  readonly type: MaintenanceType;
  readonly priority: MaintenancePriority;
  readonly title: string;
  readonly description: string;
  readonly scheduledAt: string;
  readonly provider?: string;
}
