import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the middleware factory
import isOwnerFactory from '../../middlewares/is-owner';

function createMockCtx(overrides: Record<string, any> = {}) {
  return {
    state: {
      user: { id: 1 },
      route: { info: { apiName: 'personal-notebook' } },
      ...overrides.state,
    },
    params: overrides.params || {},
    query: overrides.query || {},
    request: {
      method: overrides.method || 'GET',
      body: overrides.body || {},
    },
    unauthorized: vi.fn((msg: string) => ({ status: 401, message: msg })),
    notFound: vi.fn(() => ({ status: 404 })),
    forbidden: vi.fn((msg: string) => ({ status: 403, message: msg })),
  };
}

function createMockStrapi(entityResult: any = null) {
  return {
    entityService: {
      findOne: vi.fn().mockResolvedValue(entityResult),
    },
  };
}

describe('is-owner middleware', () => {
  let middleware: ReturnType<typeof isOwnerFactory>;
  let mockStrapi: ReturnType<typeof createMockStrapi>;

  beforeEach(() => {
    mockStrapi = createMockStrapi();
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });
  });

  it('rejects unauthenticated requests', async () => {
    const ctx = createMockCtx({ state: { user: null } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.unauthorized).toHaveBeenCalledWith('Authentification requise');
    expect(next).not.toHaveBeenCalled();
  });

  it('forces owner filter on GET list requests', async () => {
    const ctx = createMockCtx({ method: 'GET' });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.query.filters).toEqual({ owner: 1 });
    expect(next).toHaveBeenCalled();
  });

  it('allows access to own entity on GET by ID', async () => {
    mockStrapi = createMockStrapi({ id: 42, owner: { id: 1 } });
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'GET', params: { id: 42 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.forbidden).not.toHaveBeenCalled();
  });

  it('blocks access to another user entity on GET by ID', async () => {
    mockStrapi = createMockStrapi({ id: 42, owner: { id: 999 } });
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'GET', params: { id: 42 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.forbidden).toHaveBeenCalledWith('Accès non autorisé');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 for non-existent entity', async () => {
    mockStrapi = createMockStrapi(null);
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'GET', params: { id: 999 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.notFound).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forces owner on POST create', async () => {
    const ctx = createMockCtx({
      method: 'POST',
      body: { data: { title: 'Mon entrée' } },
    });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.request.body.data.owner).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  it('blocks PUT on entity owned by another user', async () => {
    mockStrapi = createMockStrapi({ id: 42, owner: { id: 999 } });
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'PUT', params: { id: 42 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.forbidden).toHaveBeenCalledWith('Accès non autorisé');
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks DELETE on entity owned by another user', async () => {
    mockStrapi = createMockStrapi({ id: 42, owner: { id: 999 } });
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'DELETE', params: { id: 42 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(ctx.forbidden).toHaveBeenCalledWith('Accès non autorisé');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows DELETE on own entity', async () => {
    mockStrapi = createMockStrapi({ id: 42, owner: { id: 1 } });
    middleware = isOwnerFactory({}, { strapi: mockStrapi as any });

    const ctx = createMockCtx({ method: 'DELETE', params: { id: 42 } });
    const next = vi.fn();

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });
});
