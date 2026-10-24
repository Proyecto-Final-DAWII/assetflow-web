export type IncidentStatus = 'OPEN' | 'IN_REVIEW' | 'IN_MAINTENANCE' | 'RESOLVED' | 'CLOSED';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  readonly id: string;
  readonly code: string;
  readonly assetId: string;
  readonly assetCode: string;
  readonly assetName: string;
  readonly reportedBy: string;
  readonly title: string;
  readonly description: string;
  readonly priority: IncidentPriority;
  readonly status: IncidentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly assignedTo?: string;
}

export interface IncidentCreateRequest {
  readonly assetId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: IncidentPriority;
}
