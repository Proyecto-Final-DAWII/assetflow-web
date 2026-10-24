export type AlertType = 'WARRANTY' | 'MAINTENANCE' | 'LICENSE' | 'INCIDENT' | 'SYSTEM';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertItem {
  readonly id: string;
  readonly type: AlertType;
  readonly severity: AlertSeverity;
  readonly title: string;
  readonly message: string;
  readonly dueAt?: string;
  readonly read: boolean;
  readonly createdAt: string;
  readonly route?: string;
}
