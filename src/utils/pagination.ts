export interface PaginationMeta {
  current_page?: number | string;
  last_page?: number | string;
  total?: number | string;
  per_page?: number | string;
  limit?: number | string;
  total_pages?: number | string;
  totalPages?: number | string;
}

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Prefer total/per_page when present. The API can leave last_page equal to a
 * requested out-of-range page while still returning the real total.
 */
export function resolveLastPage(meta: PaginationMeta | null | undefined): number {
  if (!meta) {
    return 0;
  }

  const total = toPositiveNumber(meta.total) ?? 0;
  const perPage = toPositiveNumber(meta.per_page ?? meta.limit) ?? 0;

  if (total > 0 && perPage > 0) {
    return Math.ceil(total / perPage);
  }

  return toPositiveNumber(meta.last_page ?? meta.total_pages ?? meta.totalPages) ?? 0;
}

export function getTotalPages(meta: PaginationMeta | null | undefined): number {
  return Math.max(resolveLastPage(meta), 1);
}

export function clampPage(page: number, meta: PaginationMeta | null | undefined): number {
  const totalPages = getTotalPages(meta);

  if (!Number.isFinite(page)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(page), 1), totalPages);
}

export function getCurrentPage(meta: PaginationMeta | null | undefined): number {
  return clampPage(toPositiveNumber(meta?.current_page) ?? 1, meta);
}
