import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { strapiApi, strapiFind, strapiFindOne } from '@/lib/strapi';

describe('strapiApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('makes GET request to correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    await strapiApi('/blog-articles');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:1337/api/blog-articles',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('includes Authorization header when token is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    await strapiApi('/users/me', { token: 'my-token' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(strapiApi('/users/me')).rejects.toThrow('Strapi API error: 401 Unauthorized');
  });

  it('sends POST body as JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    await strapiApi('/auth/local', {
      method: 'POST',
      body: { identifier: 'user', password: 'pass' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ identifier: 'user', password: 'pass' }),
      }),
    );
  });
});

describe('strapiFind', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('builds query string from params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], meta: {} }),
    });

    await strapiFind('blog-articles', {
      'sort[0]': 'publishedAt:desc',
      'pagination[pageSize]': '12',
    });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('sort%5B0%5D=publishedAt%3Adesc');
    expect(url).toContain('pagination%5BpageSize%5D=12');
  });
});

describe('strapiFindOne', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches single item by ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1, attributes: {} } }),
    });

    await strapiFindOne('blog-articles', 1);
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('/blog-articles/1');
  });
});
