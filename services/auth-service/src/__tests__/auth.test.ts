import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@babili/database';
import * as authService from '../auth.service';

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test-auth-' } } });
  await prisma.$disconnect();
});

describe('Auth Service (DB)', () => {
  const testEmail = `test-auth-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId: string;
  let sessionToken: string;

  it('registers a new user', async () => {
    const result = await authService.register({
      email: testEmail,
      password: testPassword,
      name: 'Test User',
      role: 'customer',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe(201);
    expect(result.data.email).toBe(testEmail);
    expect(result.data.role).toBe('customer');
    expect(result.data.id).toBeDefined();
    userId = result.data!.id;
  });

  it('rejects duplicate email', async () => {
    const result = await authService.register({
      email: testEmail,
      password: testPassword,
      name: 'Test User 2',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const result = await authService.login(testEmail, testPassword);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data.token).toBeDefined();
    expect(result.data.email).toBe(testEmail);
    sessionToken = result.data!.token;
  });

  it('rejects wrong password', async () => {
    const result = await authService.login(testEmail, 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  it('gets session by token', async () => {
    const session = await authService.getSession(sessionToken);
    expect(session).toBeDefined();
    expect(session!.email).toBe(testEmail);
  });

  it('gets user profile', async () => {
    const profile = await authService.getProfile(userId);
    expect(profile).toBeDefined();
    expect(profile!.email).toBe(testEmail);
    expect((profile as any).passwordHash).toBeUndefined();
  });

  it('handles forgot password', async () => {
    const token = await authService.forgotPassword(testEmail);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('returns null for non-existent email in forgot password', async () => {
    const token = await authService.forgotPassword('nonexistent@example.com');
    expect(token).toBeNull();
  });
});
