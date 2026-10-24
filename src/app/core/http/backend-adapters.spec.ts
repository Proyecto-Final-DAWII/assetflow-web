import { describe, expect, it } from 'vitest';
import { mapAssetFromApi, mapAssetToApi, mapMaintenanceFromApi, mapUserFromApi } from './backend-adapters';

describe('backend adapters', () => {
  it('translates inventory values to the frontend domain', () => {
    const asset = mapAssetFromApi({ id: 'LAP-001', serialNumber: 'SN-1', name: 'Latitude', category: 'laptop', status: 'EN_MANTENIMIENTO' });
    expect(asset).toMatchObject({ code: 'LAP-001', category: 'LAPTOP', status: 'MAINTENANCE' });
  });

  it('translates an asset form to the inventory contract', () => {
    const request = mapAssetToApi({
      code: 'LAP-002', name: 'ThinkPad', category: 'LAPTOP', brand: 'Lenovo', model: 'T14',
      serialNumber: 'SN-2', status: 'AVAILABLE', location: 'Lima', acquisitionDate: '2026-01-10', currency: 'PEN',
    });
    expect(request).toMatchObject({ id: 'LAP-002', status: 'DISPONIBLE' });
  });

  it('translates backend roles to frontend roles', () => {
    const user = mapUserFromApi({ id: '1', username: 'soporte', fullName: 'Soporte TI', email: 's@x.pe', role: 'SOPORTE_TI' });
    expect(user.role).toBe('SUPPORT');
  });

  it('translates maintenance states', () => {
    const item = mapMaintenanceFromApi({
      id: 4, assetId: 'LAP-001', maintenanceType: 'PREVENTIVO', description: 'Limpieza', priority: 'ALTA',
      startDate: '2026-10-23', status: 'EN_PROCESO',
    });
    expect(item).toMatchObject({ type: 'PREVENTIVE', status: 'IN_PROGRESS', priority: 'HIGH' });
  });
});
