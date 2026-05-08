import express from 'express';
import * as authService from './auth.service';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get('/health', async (_req, res) => {
  const dbOk = await healthCheck();
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    service: 'auth-service',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

async function healthCheck(): Promise<boolean> {
  try {
    const { prisma } = await import('@babili/database');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, name, role, restaurantId, language } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ success: false, error: 'Email, password, and name are required' });
    return;
  }
  const result = await authService.register({
    email,
    password,
    name,
    role,
    restaurantId,
    language,
  });
  res.status(result.status).json(result);
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }
  const result = await authService.login(email, password);
  res.status(result.status).json(result);
});

app.post('/api/v1/auth/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    await authService.logout(token);
  }
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

app.get('/api/v1/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const session = await authService.getSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: 'Invalid or expired session' });
    return;
  }

  res.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      restaurantId: session.restaurantId,
    },
  });
});

app.get('/api/v1/auth/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const session = await authService.getSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: 'Invalid or expired session' });
    return;
  }

  const user = await authService.getProfile(session.userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({ success: true, data: user });
});

app.get('/api/v1/auth/verify-email/:token', async (req, res) => {
  const success = await authService.verifyEmail(req.params.token);
  if (!success) {
    res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    return;
  }
  res.json({ success: true, data: { message: 'Email verified successfully' } });
});

app.post('/api/v1/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  await authService.forgotPassword(email);
  res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
});

app.post('/api/v1/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ success: false, error: 'Token and password are required' });
    return;
  }

  const success = await authService.resetPassword(token, password);
  if (!success) {
    res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    return;
  }
  res.json({ success: true, data: { message: 'Password reset successfully' } });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

export default app;
