import { ApiEnvelope, ApiPageEnvelope } from './api.models';
import { PageResult } from '../../shared/models/page.model';

export function unwrapApiData<T>(value: T | ApiEnvelope<T>): T {
  if (isRecord(value) && 'data' in value && Object.keys(value).some((key) => key === 'message' || key === 'data')) {
    return value['data'] as T;
  }
  return value as T;
}

export function normalizePage<T>(value: unknown, fallbackPage = 0, fallbackSize = 10): PageResult<T> {
  const payload = unwrapUnknownEnvelope(value);

  if (Array.isArray(payload)) {
    return {
      items: payload as readonly T[],
      page: fallbackPage,
      size: fallbackSize,
      total: payload.length,
      totalPages: payload.length === 0 ? 0 : Math.ceil(payload.length / fallbackSize),
    };
  }

  if (!isRecord(payload)) {
    return { items: [], page: fallbackPage, size: fallbackSize, total: 0, totalPages: 0 };
  }

  const page = payload as ApiPageEnvelope<T>;
  const items = page.content ?? page.items ?? page.data ?? [];
  const size = page.size ?? page.pageSize ?? fallbackSize;
  const total = page.totalElements ?? page.total ?? items.length;

  return {
    items,
    page: page.page ?? page.pageNumber ?? fallbackPage,
    size,
    total,
    totalPages: page.totalPages ?? (total === 0 ? 0 : Math.ceil(total / size)),
  };
}

function unwrapUnknownEnvelope(value: unknown): unknown {
  if (isRecord(value) && 'data' in value && !Array.isArray(value['data'])) {
    const nested = value['data'];
    if (isRecord(nested) && ('content' in nested || 'items' in nested || 'data' in nested)) {
      return nested;
    }
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
