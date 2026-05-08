import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';

interface ServiceRoute {
  name: string;
  url: string;
  healthEndpoint: string;
}

const services: ServiceRoute[] = [
  { name: 'auth-service', url: 'http://localhost:4001', healthEndpoint: '/health' },
  { name: 'restaurant-service', url: 'http://localhost:4002', healthEndpoint: '/health' },
  { name: 'order-service', url: 'http://localhost:4003', healthEndpoint: '/health' },
  { name: 'translation-service', url: 'http://localhost:4004', healthEndpoint: '/health' },
];

const serviceMap = new Map(services.map((s) => [s.name, s]));

// ─── Gateway-specific routes (no auth) ───────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: process.uptime(),
  });
});

app.get('/api/v1/gateway/services', (_req, res) => {
  res.json({
    success: true,
    data: {
      services: services.map((s) => ({ name: s.name, url: s.url })),
      count: services.length,
    },
  });
});

app.get('/api/v1/gateway/health', async (_req, res) => {
  const results = await Promise.allSettled(
    services.map(async (s) => {
      try {
        const response = await fetch(`${s.url}${s.healthEndpoint}`);
        const data = await response.json();
        return { service: s.name, status: 'ok', data };
      } catch {
        return { service: s.name, status: 'down', data: null };
      }
    }),
  );

  const serviceStatuses = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { service: 'unknown', status: 'error', data: null },
  );

  const allOk = serviceStatuses.every((s) => s.status === 'ok');
  const anyOk = serviceStatuses.some((s) => s.status === 'ok');

  res.json({
    success: true,
    data: {
      gateway: { status: 'ok', uptime: process.uptime() },
      services: serviceStatuses,
      overall: allOk ? 'healthy' : anyOk ? 'degraded' : 'down',
    },
  });
});

app.get('/api/v1/gateway/routes', (_req, res) => {
  res.json({
    success: true,
    data: {
      routes: [
        { path: '/health', methods: ['GET'], description: 'Gateway health check' },
        {
          path: '/api/v1/gateway/services',
          methods: ['GET'],
          description: 'List registered services',
        },
        {
          path: '/api/v1/gateway/health',
          methods: ['GET'],
          description: 'Aggregated health check',
        },
        { path: '/api/v1/gateway/routes', methods: ['GET'], description: 'List all routes' },
        {
          path: '/api/v1/auth/*',
          methods: ['GET', 'POST'],
          description: 'Auth service endpoints (public)',
        },
        {
          path: '/api/v1/restaurants/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Restaurant service endpoints (auth required)',
        },
        {
          path: '/api/v1/orders/*',
          methods: ['GET', 'POST', 'PUT'],
          description: 'Order service endpoints (auth required)',
        },
        {
          path: '/api/v1/orders/events',
          methods: ['GET'],
          description: 'Order events SSE stream (auth required)',
        },
        {
          path: '/api/v1/translations/*',
          methods: ['GET'],
          description: 'Translation service endpoints (public)',
        },
      ],
    },
  });
});

// ─── Auth middleware ─────────────────────────────────────────────────────────

async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const authServiceUrl = serviceMap.get('auth-service')?.url ?? 'http://localhost:4001';

  try {
    const response = await fetch(`${authServiceUrl}/api/v1/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    const body = await response.json();
    const user = body.data;

    (req as any).authHeaders = {
      'X-Auth-User-Id': user.userId,
      'X-Auth-Email': user.email,
      'X-Auth-Role': user.role,
      'X-Auth-Restaurant-Id': user.restaurantId || '',
      'X-Internal-Service-Token': INTERNAL_SERVICE_TOKEN,
    };

    next();
  } catch {
    res.status(503).json({ success: false, error: 'Auth service unavailable' });
  }
}

// ─── Proxy instances ─────────────────────────────────────────────────────────

const authProxy = createProxyMiddleware({
  target: 'http://localhost:4001',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = `/api/v1/auth${req.url}`;
    },
  },
});

const restaurantProxy = createProxyMiddleware({
  target: 'http://localhost:4002',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = `/api/v1/restaurants${req.url}`;
      const authHeaders = (req as any).authHeaders as Record<string, string> | undefined;
      if (authHeaders) {
        Object.entries(authHeaders).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });
      }
    },
  },
});

const orderProxy = createProxyMiddleware({
  target: 'http://localhost:4003',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = `/api/v1/orders${req.url}`;
      const authHeaders = (req as any).authHeaders as Record<string, string> | undefined;
      if (authHeaders) {
        Object.entries(authHeaders).forEach(([key, value]) => {
          proxyReq.setHeader(key, value);
        });
      }
    },
  },
});

const translationProxy = createProxyMiddleware({
  target: 'http://localhost:4004',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = `/api/v1/translations${req.url}`;
    },
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authProxy);
app.use('/api/v1/restaurants', authMiddleware, restaurantProxy);
app.use('/api/v1/orders', authMiddleware, orderProxy);
app.use('/api/v1/translations', translationProxy);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
}

export default app;
