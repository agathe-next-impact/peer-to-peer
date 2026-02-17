import { describe, it, expect, vi, beforeEach } from 'vitest';
import rateLimitFactory from '../../middlewares/rate-limit-auth';

function createMockCtx(overrides: Record<string, any> = {}) {
  return {
    request: {
      headers: { 'x-forwarded-for': '192.168.1.1' },
      ip: '192.168.1.1',
    },
    status: overrides.status || 200,
    body: overrides.body || null,
    set: vi.fn(),
  };
}

describe('rate-limit-auth middleware', () => {
  let middleware: ReturnType<typeof rateLimitFactory>;

  beforeEach(() => {
    // Create a fresh middleware instance for each test
    middleware = rateLimitFactory(undefined, { strapi: {} as any });
  });

  it('allows first request', async () => {
    const ctx = createMockCtx();
    const next = vi.fn(async () => {
      ctx.status = 200;
    });

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.status).toBe(200);
  });

  it('counts failed login attempts (401)', async () => {
    const ctx = createMockCtx();
    const next = vi.fn(async () => {
      ctx.status = 401;
    });

    // Fire 4 attempts — should all go through
    for (let i = 0; i < 4; i++) {
      await middleware(ctx, next);
    }
    expect(next).toHaveBeenCalledTimes(4);
  });

  it('blocks after 5 failed attempts', async () => {
    const next = vi.fn(async () => {
      ctx.status = 401;
    });
    const ctx = createMockCtx();

    // Exhaust 5 attempts
    for (let i = 0; i < 5; i++) {
      ctx.status = 200; // reset before each call
      await middleware(ctx, next);
    }

    // 6th attempt should be blocked
    ctx.status = 200;
    const blockedNext = vi.fn();
    await middleware(ctx, blockedNext);

    expect(ctx.status).toBe(429);
    expect(ctx.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    expect(blockedNext).not.toHaveBeenCalled();
  });

  it('resets counter after successful login', async () => {
    const ctx = createMockCtx();

    // 3 failed attempts
    const failNext = vi.fn(async () => { ctx.status = 401; });
    for (let i = 0; i < 3; i++) {
      await middleware(ctx, failNext);
    }

    // Successful login
    const successNext = vi.fn(async () => { ctx.status = 200; });
    await middleware(ctx, successNext);

    // Should be able to fail again (counter reset)
    const fail2 = vi.fn(async () => { ctx.status = 401; });
    for (let i = 0; i < 4; i++) {
      ctx.status = 200;
      await middleware(ctx, fail2);
    }
    expect(fail2).toHaveBeenCalledTimes(4); // 4 more allowed
  });

  it('sets Retry-After header on block', async () => {
    const ctx = createMockCtx();
    const next = vi.fn(async () => { ctx.status = 400; });

    for (let i = 0; i < 5; i++) {
      await middleware(ctx, next);
    }

    // Blocked request
    await middleware(ctx, vi.fn());

    expect(ctx.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
    const retryAfter = parseInt(ctx.set.mock.calls[0][1]);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(15 * 60); // max 15 min
  });
});
