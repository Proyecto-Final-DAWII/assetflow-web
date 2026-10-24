import { UserSummary } from './user.model';

export type AssignmentStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Assignment {
  readonly id: string;
  readonly assetId: string;
  readonly assetCode: string;
  readonly assetName: string;
  readonly collaborator: UserSummary;
  readonly assignedAt: string;
  readonly expectedReturnAt?: string;
  readonly returnedAt?: string;
  readonly status: AssignmentStatus;
  readonly deliveredBy: string;
  readonly notes?: string;
}

export interface AssignmentCreateRequest {
  readonly assetId: string;
  readonly userId: string;
  readonly assignedAt: string;
  readonly expectedReturnAt?: string;
  readonly notes?: string;
}
