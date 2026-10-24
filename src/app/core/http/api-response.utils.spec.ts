import { describe, expect, it } from 'vitest';
import { normalizePage, unwrapApiData } from './api-response.utils';

describe('api response utilities', () => {
  it('unwraps a standard data envelope', () => {
    expect(unwrapApiData({ data: { id: 'ast-1' }, message: 'ok' })).toEqual({ id: 'ast-1' });
  });

  it('keeps a direct response unchanged', () => {
    expect(unwrapApiData({ id: 'ast-1' })).toEqual({ id: 'ast-1' });
  });

  it('normalizes a Spring-like page', () => {
    const result = normalizePage<{ id: string }>({
      content: [{ id: 'ast-1' }],
      page: 2,
      size: 20,
      totalElements: 41,
      totalPages: 3,
    });
    expect(result).toEqual({
      items: [{ id: 'ast-1' }],
      page: 2,
      size: 20,
      total: 41,
      totalPages: 3,
    });
  });

  it('normalizes an envelope with a nested page', () => {
    const result = normalizePage<number>({ data: { items: [1, 2], pageNumber: 0, pageSize: 10, total: 2 } });
    expect(result.items).toEqual([1, 2]);
    expect(result.totalPages).toBe(1);
  });
});
