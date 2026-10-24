import { HttpContext, HttpHeaders } from '@angular/common/http';

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[];
export type QueryParams = Readonly<Record<string, QueryValue>>;
export type PathParams = Readonly<Record<string, string | number>>;

export interface ApiRequestOptions<TBody = unknown> {
  readonly body?: TBody;
  readonly pathParams?: PathParams;
  readonly query?: QueryParams;
  readonly headers?: HttpHeaders | Record<string, string | string[]>;
  readonly context?: HttpContext;
}

export interface ApiEnvelope<T> {
  readonly data: T;
  readonly message?: string;
}

export interface ApiPageEnvelope<T> {
  readonly content?: readonly T[];
  readonly items?: readonly T[];
  readonly data?: readonly T[];
  readonly page?: number;
  readonly pageNumber?: number;
  readonly size?: number;
  readonly pageSize?: number;
  readonly totalElements?: number;
  readonly total?: number;
  readonly totalPages?: number;
}
