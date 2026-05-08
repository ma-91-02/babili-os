import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('API Gateway', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api-gateway');
  });

  it('lists registered services', async () => {
    const res = await request(app).get('/api/v1/gateway/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.services.length).toBeGreaterThan(0);
  });

  it('lists all routes', async () => {
    const res = await request(app).get('/api/v1/gateway/routes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.routes.length).toBeGreaterThan(0);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
  });

  // ─── Auth middleware tests ─────────────────────────────────────────────

  it('rejects restaurant request without Bearer token', async () => {
    const res = await request(app).get('/api/v1/restaurants/some-id');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing or invalid Authorization header');
  });

  it('rejects restaurant request with malformed auth header', async () => {
    const res = await request(app)
      .get('/api/v1/restaurants/some-id')
      .set('Authorization', 'Basic token');
    expect(res.status).toBe(401);
  });

  it('rejects order request without Bearer token', async () => {
    const res = await request(app).get('/api/v1/orders/some-id');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing or invalid Authorization header');
  });

  it('attempts to verify token with auth-service (returns 503 since auth-service is down)', async () => {
    const res = await request(app)
      .get('/api/v1/restaurants/some-id')
      .set('Authorization', 'Bearer valid-looking-token');
    // Auth middleware catches fetch error to auth-service and returns 503
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('Auth service unavailable');
  });

  it('allows public access to auth routes (fails with 504 since auth-service is down)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'test' });
    expect(res.status).toBe(504);
  });

  it('allows public access to translation routes (fails with 504 since translation-service is down)', async () => {
    const res = await request(app).get('/api/v1/translations/en');
    expect(res.status).toBe(504);
  });
});
