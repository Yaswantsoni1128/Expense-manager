export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;

export function parsePagination(query: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number; offset: number } {
  const page = Math.max(1, Number(query.page) || 1);
  let limit = Number(query.limit) || DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  limit = Math.min(Math.floor(limit), MAX_LIMIT);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}
