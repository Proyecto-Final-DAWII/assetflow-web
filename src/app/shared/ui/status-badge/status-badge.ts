import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface StatusPresentation {
  readonly label: string;
  readonly tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
}

const STATUS_PRESENTATIONS: Readonly<Record<string, StatusPresentation>> = {
  AVAILABLE: { label: 'Disponible', tone: 'success' },
  ASSIGNED: { label: 'Asignado', tone: 'primary' },
  MAINTENANCE: { label: 'En mantenimiento', tone: 'warning' },
  REPAIR: { label: 'En reparación', tone: 'warning' },
  LOST: { label: 'Extraviado', tone: 'danger' },
  RETIRED: { label: 'Dado de baja', tone: 'neutral' },
  ACTIVE: { label: 'Activo', tone: 'success' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
  RETURNED: { label: 'Devuelta', tone: 'neutral' },
  OVERDUE: { label: 'Vencida', tone: 'danger' },
  SCHEDULED: { label: 'Programado', tone: 'info' },
  IN_PROGRESS: { label: 'En curso', tone: 'warning' },
  COMPLETED: { label: 'Completado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'neutral' },
  EXPIRING: { label: 'Por vencer', tone: 'warning' },
  EXPIRED: { label: 'Vencida', tone: 'danger' },
  SUSPENDED: { label: 'Suspendida', tone: 'neutral' },
  OPEN: { label: 'Abierto', tone: 'danger' },
  IN_REVIEW: { label: 'En revisión', tone: 'warning' },
  IN_MAINTENANCE: { label: 'En mantenimiento', tone: 'info' },
  RESOLVED: { label: 'Resuelto', tone: 'success' },
  CLOSED: { label: 'Cerrado', tone: 'neutral' },
  LOW: { label: 'Baja', tone: 'neutral' },
  MEDIUM: { label: 'Media', tone: 'info' },
  HIGH: { label: 'Alta', tone: 'warning' },
  CRITICAL: { label: 'Crítica', tone: 'danger' },
  INFO: { label: 'Información', tone: 'info' },
  WARNING: { label: 'Atención', tone: 'warning' },
  ADMIN: { label: 'Administrador TI', tone: 'primary' },
  SUPPORT: { label: 'Soporte TI', tone: 'info' },
  EMPLOYEE: { label: 'Colaborador', tone: 'neutral' },
};

@Component({
  selector: 'af-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly label = input<string>();
  readonly dot = input(true);

  protected readonly presentation = computed<StatusPresentation>(() => {
    const defaultValue: StatusPresentation = {
      label: this.status().replaceAll('_', ' '),
      tone: 'neutral',
    };
    const configured = STATUS_PRESENTATIONS[this.status()] ?? defaultValue;
    return this.label() ? { ...configured, label: this.label()! } : configured;
  });
}
