export type LicenseStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'SUSPENDED';

export interface SoftwareLicense {
  readonly id: string;
  readonly productName: string;
  readonly vendor: string;
  readonly type: 'SUBSCRIPTION' | 'PERPETUAL' | 'OEM';
  readonly status: LicenseStatus;
  readonly totalSeats: number;
  readonly assignedSeats: number;
  readonly availableSeats: number;
  readonly startsAt: string;
  readonly expiresAt?: string;
  readonly annualCost?: number;
  readonly currency: string;
  readonly ownerArea: string;
}
