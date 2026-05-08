import express from 'express';
import {
  createUser,
  loginUser,
  logoutUser,
  getSession,
  getUserById,
  verifyEmail,
  createForgotPasswordToken,
  resetPassword,
} from './store';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, restaurantId, language } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password, and name are required' });
      return;
    }

    const user = await createUser({ email, password, name, role, restaurantId, language });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Email already registered' ? 409 : 500;
    res.status(status).json({ success: false, error: message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const session = await loginUser(email, password);
    res.json({ success: true, data: session });
  } catch (error) {
    const message = (error as Error).message;
    res.status(401).json({ success: false, error: message });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    logoutUser(token);
  }
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

app.get('/api/v1/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const session = getSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: 'Invalid or expired session' });
    return;
  }

  const user = getUserById(session.userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

app.get('/api/v1/auth/verify-email/:token', (req, res) => {
  const { token } = req.params;
  const success = verifyEmail(token);

  if (!success) {
    res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    return;
  }

  res.json({ success: true, data: { message: 'Email verified successfully' } });
});

app.post('/api/v1/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const token = createForgotPasswordToken(email);
  if (!token) {
    res.json({
      success: true,
      data: { message: 'If the email exists, a reset link has been sent' },
    });
    return;
  }

  res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
});

app.post('/api/v1/auth/reset-password', (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ success: false, error: 'Token and password are required' });
    return;
  }

  const success = resetPassword(token, password);
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
