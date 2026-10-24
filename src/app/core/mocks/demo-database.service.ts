import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AlertItem } from '../../shared/models/alert.model';
import {
  Asset,
  AssetFilters,
  AssetFormValue,
  AssetMovement,
} from '../../shared/models/asset.model';
import { Assignment, AssignmentCreateRequest } from '../../shared/models/assignment.model';
import { AssetDocument, AssetDocumentType } from '../../shared/models/document.model';
import { DashboardSummary } from '../../shared/models/dashboard.model';
import { Incident, IncidentCreateRequest, IncidentStatus } from '../../shared/models/incident.model';
import { SoftwareLicense } from '../../shared/models/license.model';
import { Maintenance, MaintenanceCreateRequest } from '../../shared/models/maintenance.model';
import { PageResult } from '../../shared/models/page.model';
import { User, UserCreateRequest, UserRole } from '../../shared/models/user.model';
import {
  DEMO_ALERTS,
  DEMO_ASSETS,
  DEMO_ASSIGNMENTS,
  DEMO_DOCUMENTS,
  DEMO_INCIDENTS,
  DEMO_LICENSES,
  DEMO_MAINTENANCE,
  DEMO_MOVEMENTS,
  DEMO_USERS,
} from './demo-data';
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '../../shared/models/domain-labels';

@Injectable({ providedIn: 'root' })
export class DemoDatabaseService {
  private readonly assetsState = signal<Asset[]>([...DEMO_ASSETS]);
  private readonly assignmentsState = signal<Assignment[]>([...DEMO_ASSIGNMENTS]);
  private readonly documentsState = signal<AssetDocument[]>([...DEMO_DOCUMENTS]);
  private readonly maintenanceState = signal<Maintenance[]>([...DEMO_MAINTENANCE]);
  private readonly licensesState = signal<SoftwareLicense[]>([...DEMO_LICENSES]);
  private readonly incidentsState = signal<Incident[]>([...DEMO_INCIDENTS]);
  private readonly alertsState = signal<AlertItem[]>([...DEMO_ALERTS]);
  private readonly usersState = signal<User[]>([...DEMO_USERS]);
  private readonly movementsState = signal<AssetMovement[]>([...DEMO_MOVEMENTS]);

  readonly assets = this.assetsState.asReadonly();
  readonly assignments = this.assignmentsState.asReadonly();
  readonly documents = this.documentsState.asReadonly();
  readonly maintenance = this.maintenanceState.asReadonly();
  readonly licenses = this.licensesState.asReadonly();
  readonly incidents = this.incidentsState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly users = this.usersState.asReadonly();
  readonly movements = this.movementsState.asReadonly();
  readonly unreadAlerts = computed(() => this.alertsState().filter((item) => !item.read).length);

  loginAsRole(role: UserRole): User {
    const user = this.usersState().find((candidate) => candidate.role === role && candidate.status === 'ACTIVE');
    if (!user) {
      throw new Error(`No existe un usuario demo para el rol ${role}.`);
    }
    return user;
  }

  loginByEmail(email: string): User | undefined {
    return this.usersState().find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.status === 'ACTIVE',
    );
  }

  listAssets(filters: AssetFilters): Observable<PageResult<Asset>> {
    const search = filters.search?.trim().toLowerCase() ?? '';
    const filtered = this.assetsState().filter((asset) => {
      const matchesSearch =
        !search ||
        [asset.code, asset.name, asset.brand, asset.model, asset.serialNumber, asset.location]
          .join(' ')
          .toLowerCase()
          .includes(search);
      const matchesStatus = !filters.status || asset.status === filters.status;
      const matchesCategory = !filters.category || asset.category === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    const start = filters.page * filters.size;
    return this.simulate({
      items: filtered.slice(start, start + filters.size),
      page: filters.page,
      size: filters.size,
      total: filtered.length,
      totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / filters.size),
    });
  }

  getAsset(id: string): Observable<Asset> {
    const asset = this.assetsState().find((candidate) => candidate.id === id);
    return asset ? this.simulate(asset) : this.notFound('Activo');
  }

  getAssetHistory(id: string): Observable<readonly AssetMovement[]> {
    const items = this.movementsState()
      .filter((movement) => movement.assetId === id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return this.simulate(items);
  }

  createAsset(value: AssetFormValue): Observable<Asset> {
    const now = new Date().toISOString();
    const asset: Asset = {
      id: this.id('ast'),
      ...value,
      area: value.area || undefined,
      warrantyExpiresAt: value.warrantyExpiresAt || undefined,
      purchasePrice: value.purchasePrice || undefined,
      notes: value.notes || undefined,
      documentCount: 0,
      maintenanceCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.assetsState.update((items) => [asset, ...items]);
    this.movementsState.update((items) => [
      {
        id: this.id('mov'),
        assetId: asset.id,
        type: 'REGISTERED',
        title: 'Activo registrado',
        description: `${asset.name} incorporado al inventario.`,
        occurredAt: now,
        actor: 'Usuario actual',
      },
      ...items,
    ]);
    return this.simulate(asset);
  }

  updateAsset(id: string, value: AssetFormValue): Observable<Asset> {
    const current = this.assetsState().find((asset) => asset.id === id);
    if (!current) {
      return this.notFound('Activo');
    }

    const updated: Asset = {
      ...current,
      ...value,
      area: value.area || undefined,
      warrantyExpiresAt: value.warrantyExpiresAt || undefined,
      purchasePrice: value.purchasePrice || undefined,
      notes: value.notes || undefined,
      updatedAt: new Date().toISOString(),
    };
    this.assetsState.update((items) => items.map((item) => (item.id === id ? updated : item)));
    return this.simulate(updated);
  }

  listAssignments(): Observable<readonly Assignment[]> {
    return this.simulate([...this.assignmentsState()].sort((a, b) => b.assignedAt.localeCompare(a.assignedAt)));
  }

  createAssignment(value: AssignmentCreateRequest): Observable<Assignment> {
    const asset = this.assetsState().find((candidate) => candidate.id === value.assetId);
    const user = this.usersState().find((candidate) => candidate.id === value.userId);
    if (!asset || !user) {
      return this.notFound('Activo o colaborador');
    }
    if (asset.status !== 'AVAILABLE') {
      return throwError(() => new Error('El activo seleccionado no se encuentra disponible.'));
    }

    const collaborator = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      area: user.area,
    };
    const assignment: Assignment = {
      id: this.id('asg'),
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      collaborator,
      assignedAt: value.assignedAt,
      expectedReturnAt: value.expectedReturnAt || undefined,
      status: 'ACTIVE',
      deliveredBy: 'Usuario actual',
      notes: value.notes || undefined,
    };

    this.assignmentsState.update((items) => [assignment, ...items]);
    this.assetsState.update((items) =>
      items.map((item) =>
        item.id === asset.id
          ? {
              ...item,
              status: 'ASSIGNED',
              assignedTo: collaborator,
              assignmentId: assignment.id,
              area: collaborator.area,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    return this.simulate(assignment);
  }

  returnAssignment(id: string): Observable<Assignment> {
    const current = this.assignmentsState().find((assignment) => assignment.id === id);
    if (!current) {
      return this.notFound('Asignación');
    }
    const returned: Assignment = {
      ...current,
      status: 'RETURNED',
      returnedAt: new Date().toISOString().slice(0, 10),
    };
    this.assignmentsState.update((items) => items.map((item) => (item.id === id ? returned : item)));
    this.assetsState.update((items) =>
      items.map((item) =>
        item.id === current.assetId
          ? {
              ...item,
              status: 'AVAILABLE',
              assignedTo: undefined,
              assignmentId: undefined,
              area: undefined,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    return this.simulate(returned);
  }

  listMaintenance(): Observable<readonly Maintenance[]> {
    return this.simulate([...this.maintenanceState()].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)));
  }

  createMaintenance(value: MaintenanceCreateRequest): Observable<Maintenance> {
    const asset = this.assetsState().find((candidate) => candidate.id === value.assetId);
    if (!asset) {
      return this.notFound('Activo');
    }
    const item: Maintenance = {
      id: this.id('mnt'),
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      type: value.type,
      status: 'SCHEDULED',
      priority: value.priority,
      title: value.title,
      description: value.description,
      scheduledAt: value.scheduledAt,
      provider: value.provider || undefined,
      currency: asset.currency,
    };
    this.maintenanceState.update((items) => [item, ...items]);
    return this.simulate(item);
  }

  completeMaintenance(id: string): Observable<Maintenance> {
    const current = this.maintenanceState().find((item) => item.id === id);
    if (!current) {
      return this.notFound('Mantenimiento');
    }
    const completed: Maintenance = {
      ...current,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };
    this.maintenanceState.update((items) => items.map((item) => (item.id === id ? completed : item)));
    if (current.assetId) {
      this.assetsState.update((items) =>
        items.map((asset) =>
          asset.id === current.assetId && (asset.status === 'MAINTENANCE' || asset.status === 'REPAIR')
            ? { ...asset, status: 'AVAILABLE', updatedAt: new Date().toISOString() }
            : asset,
        ),
      );
    }
    return this.simulate(completed);
  }

  listLicenses(): Observable<readonly SoftwareLicense[]> {
    return this.simulate(this.licensesState());
  }

  listIncidents(): Observable<readonly Incident[]> {
    return this.simulate([...this.incidentsState()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  createIncident(value: IncidentCreateRequest, reportedBy: string): Observable<Incident> {
    const asset = this.assetsState().find((candidate) => candidate.id === value.assetId);
    if (!asset) {
      return this.notFound('Activo');
    }
    const now = new Date().toISOString();
    const incident: Incident = {
      id: this.id('inc'),
      code: `INC-${new Date().getFullYear()}-${String(this.incidentsState().length + 109).padStart(4, '0')}`,
      assetId: asset.id,
      assetCode: asset.code,
      assetName: asset.name,
      reportedBy,
      title: value.title,
      description: value.description,
      priority: value.priority,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };
    this.incidentsState.update((items) => [incident, ...items]);
    return this.simulate(incident);
  }

  updateIncidentStatus(id: string, status: IncidentStatus): Observable<Incident> {
    const current = this.incidentsState().find((incident) => incident.id === id);
    if (!current) {
      return this.notFound('Incidencia');
    }
    const updated = { ...current, status, updatedAt: new Date().toISOString() };
    this.incidentsState.update((items) => items.map((item) => (item.id === id ? updated : item)));
    return this.simulate(updated);
  }

  listAlerts(): Observable<readonly AlertItem[]> {
    return this.simulate([...this.alertsState()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  markAlertRead(id: string): Observable<void> {
    this.alertsState.update((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
    return this.simulate(undefined);
  }

  markAllAlertsRead(): Observable<void> {
    this.alertsState.update((items) => items.map((item) => ({ ...item, read: true })));
    return this.simulate(undefined);
  }

  listDocuments(assetId: string): Observable<readonly AssetDocument[]> {
    return this.simulate(
      this.documentsState()
        .filter((document) => document.assetId === assetId)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    );
  }

  uploadDocument(assetId: string, file: File, type: AssetDocumentType): Observable<AssetDocument> {
    const asset = this.assetsState().find((candidate) => candidate.id === assetId);
    if (!asset) return this.notFound('Activo');
    const document: AssetDocument = {
      id: this.id('doc'),
      assetId,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      size: file.size,
      type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Usuario actual',
    };
    this.documentsState.update((items) => [document, ...items]);
    this.assetsState.update((items) => items.map((item) => item.id === assetId
      ? { ...item, documentCount: item.documentCount + 1, updatedAt: new Date().toISOString() }
      : item));
    return this.simulate(document);
  }

  deleteDocument(documentId: string): Observable<void> {
    const document = this.documentsState().find((candidate) => candidate.id === documentId);
    if (!document) return this.notFound('Documento');
    this.documentsState.update((items) => items.filter((item) => item.id !== documentId));
    this.assetsState.update((items) => items.map((item) => item.id === document.assetId
      ? { ...item, documentCount: Math.max(0, item.documentCount - 1), updatedAt: new Date().toISOString() }
      : item));
    return this.simulate(undefined);
  }

  listUsers(): Observable<readonly User[]> {
    return this.simulate(this.usersState());
  }

  createUser(value: UserCreateRequest): Observable<User> {
    const exists = this.usersState().some((user) => user.email.toLowerCase() === value.email.trim().toLowerCase());
    if (exists) {
      return throwError(() => new Error('Ya existe un usuario con ese correo.'));
    }

    const user: User = {
      id: this.id('usr'),
      fullName: value.fullName.trim(),
      email: value.email.trim().toLowerCase(),
      role: value.role,
      status: 'ACTIVE',
      area: value.area.trim(),
      position: value.position.trim(),
      phone: value.phone?.trim() || undefined,
      assignedAssets: 0,
      createdAt: new Date().toISOString(),
    };
    this.usersState.update((items) => [user, ...items]);
    return this.simulate(user);
  }

  availableAssets(): readonly Asset[] {
    return this.assetsState().filter((asset) => asset.status === 'AVAILABLE');
  }

  activeUsers(): readonly User[] {
    return this.usersState().filter((user) => user.status === 'ACTIVE');
  }

  dashboard(): Observable<DashboardSummary> {
    const categoryTotals = new Map<string, number>();
    const statusTotals = new Map<string, number>();
    for (const asset of this.assetsState()) {
      categoryTotals.set(asset.category, (categoryTotals.get(asset.category) ?? 0) + 1);
      statusTotals.set(asset.status, (statusTotals.get(asset.status) ?? 0) + 1);
    }

    const assetsByCategory = [...categoryTotals.entries()].map(([key, value]) => ({
      key: key as Asset['category'],
      label: ASSET_CATEGORY_LABELS[key as Asset['category']],
      value,
      percentage: Math.round((value / this.assetsState().length) * 100),
    }));
    const assetsByStatus = [...statusTotals.entries()].map(([key, value]) => ({
      key: key as Asset['status'],
      label: ASSET_STATUS_LABELS[key as Asset['status']],
      value,
      percentage: Math.round((value / this.assetsState().length) * 100),
    }));

    return this.simulate({
      metrics: [
        { key: 'total', label: 'Activos totales', value: 1248, change: 4.8, helper: 'vs. mes anterior', icon: 'assets', tone: 'primary' },
        { key: 'assigned', label: 'Asignados', value: 932, change: 2.1, helper: '74.7% del inventario', icon: 'user-check', tone: 'success' },
        { key: 'available', label: 'Disponibles', value: 184, change: -1.4, helper: 'Listos para asignar', icon: 'package-check', tone: 'info' },
        { key: 'maintenance', label: 'En mantenimiento', value: 46, change: 8.3, helper: '12 críticos', icon: 'wrench', tone: 'warning' },
        { key: 'warranty', label: 'Garantías por vencer', value: 23, helper: 'Próximos 30 días', icon: 'shield-alert', tone: 'danger' },
        { key: 'retired', label: 'Dados de baja', value: 63, change: 1.7, helper: 'Durante 2026', icon: 'archive', tone: 'neutral' },
      ],
      assetsByCategory,
      assetsByStatus,
      recentMovements: [...this.movementsState()]
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
        .slice(0, 6),
      upcomingAlerts: this.alertsState().filter((item) => !item.read).slice(0, 5),
      maintenanceByMonth: [
        { month: 'May', total: 26 },
        { month: 'Jun', total: 31 },
        { month: 'Jul', total: 28 },
        { month: 'Ago', total: 39 },
        { month: 'Sep', total: 35 },
        { month: 'Oct', total: 46 },
      ],
    });
  }

  private simulate<T>(value: T): Observable<T> {
    return of(value).pipe(delay(180));
  }

  private notFound<T>(entity: string): Observable<T> {
    return throwError(() => new Error(`${entity} no encontrado.`));
  }

  private id(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
}
