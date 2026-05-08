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
});
