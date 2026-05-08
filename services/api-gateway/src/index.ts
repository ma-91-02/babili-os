import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

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
        { path: '/api/v1/auth/*', methods: ['GET', 'POST'], description: 'Auth service endpoints' },
        {
          path: '/api/v1/restaurants/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Restaurant service endpoints',
        },
        {
          path: '/api/v1/orders/*',
          methods: ['GET', 'POST', 'PUT'],
          description: 'Order service endpoints',
        },
        {
          path: '/api/v1/translations/*',
          methods: ['GET'],
          description: 'Translation service endpoints',
        },
      ],
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
}

export default app;
