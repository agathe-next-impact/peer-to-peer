import type { StrapiResponse, StrapiSingleResponse } from '@pairemancipation/shared-types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
}

export async function strapiApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', headers = {}, body, token, cache, revalidate } = options;

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers: fetchHeaders,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const response = await fetch(`${STRAPI_URL}/api${path}`, fetchOptions);

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function strapiFind<T>(
  contentType: string,
  params?: Record<string, string>,
  options?: FetchOptions,
): Promise<StrapiResponse<T[]>> {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return strapiApi<StrapiResponse<T[]>>(`/${contentType}${query}`, options);
}

export async function strapiFindOne<T>(
  contentType: string,
  id: number | string,
  params?: Record<string, string>,
  options?: FetchOptions,
): Promise<StrapiSingleResponse<T>> {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return strapiApi<StrapiSingleResponse<T>>(`/${contentType}/${id}${query}`, options);
}
