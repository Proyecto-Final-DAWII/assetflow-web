export interface PageResult<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly size: number;
  readonly total: number;
  readonly totalPages: number;
}
