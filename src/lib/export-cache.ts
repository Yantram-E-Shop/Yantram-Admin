const CACHE_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 300;

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

type PaginatedResponse<T> = {
  data?: {
    data?: T[];
    pagination?: {
      totalPages?: number;
    };
  };
};

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;

export const createExportCacheKey = (
  token: string | null | undefined,
  resource: string,
  filters = ""
) => `${token ?? "anonymous"}:${resource}:${filters}`;

export function getCachedExportValueIfFresh<T>(key: string): T | undefined {
  const cached = cache.get(key);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return cached.value as T;
}

export function invalidateProductExportCache(token: string | null | undefined) {
  const prefixes = [
    `${createExportCacheKey(token, "products")}`,
    `${createExportCacheKey(token, "product-by-id")}`,
  ];

  cacheGeneration += 1;
  for (const key of Array.from(cache.keys())) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) cache.delete(key);
  }
  for (const key of Array.from(pendingRequests.keys())) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) pendingRequests.delete(key);
  }
}

export async function getCachedExportValue<T>(
  key: string,
  load: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }
  if (cached) cache.delete(key);

  const pending = pendingRequests.get(key);
  if (pending) return pending as Promise<T>;

  const requestGeneration = cacheGeneration;
  const request = load().then((value) => {
    if (requestGeneration === cacheGeneration) {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      while (cache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey === undefined) break;
        cache.delete(oldestKey);
      }
    }
    return value;
  }).finally(() => {
    if (pendingRequests.get(key) === request) pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapItem: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await mapItem(items[index]);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

export async function fetchAllCachedPages<T>(
  cacheKey: string,
  fetchPage: (page: number) => Promise<PaginatedResponse<T>>
): Promise<T[]> {
  return getCachedExportValue(`${cacheKey}:all`, async () => {
    const getPage = (page: number) =>
      getCachedExportValue(`${cacheKey}:page:${page}`, () => fetchPage(page));
    const firstPage = await getPage(1);
    const totalPages = Math.max(1, Number(firstPage.data?.pagination?.totalPages) || 1);
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
    const otherPages = await mapWithConcurrency(remainingPages, 4, getPage);

    return [firstPage, ...otherPages].flatMap((response) =>
      Array.isArray(response.data?.data) ? response.data.data : []
    );
  });
}