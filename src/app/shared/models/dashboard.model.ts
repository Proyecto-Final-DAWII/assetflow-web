import { AlertItem } from './alert.model';
import { AssetCategory, AssetMovement, AssetStatus } from './asset.model';

export interface DashboardMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly change?: number;
  readonly helper?: string;
  readonly icon: string;
  readonly tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface DistributionItem<T extends string = string> {
  readonly key: T;
  readonly label: string;
  readonly value: number;
  readonly percentage: number;
}

export interface DashboardSummary {
  readonly metrics: readonly DashboardMetric[];
  readonly assetsByCategory: readonly DistributionItem<AssetCategory>[];
  readonly assetsByStatus: readonly DistributionItem<AssetStatus>[];
  readonly recentMovements: readonly AssetMovement[];
  readonly upcomingAlerts: readonly AlertItem[];
  readonly maintenanceByMonth: readonly { readonly month: string; readonly total: number }[];
}
