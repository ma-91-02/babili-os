# Deployment — Babili / بابلي

## Environment Variables

### Required

| Variable                 | Description                               | Example                                         |
| ------------------------ | ----------------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string              | `postgresql://babili:pass@postgres:5432/babili` |
| `INTERNAL_SERVICE_TOKEN` | Shared secret for service-to-service auth | `generate-a-strong-random-token`                |

### Optional

| Variable    | Description             | Default                  |
| ----------- | ----------------------- | ------------------------ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT`      | Service port            | varies per service       |
| `NODE_ENV`  | Environment             | `development`            |

## Service Ports

| Service             | Port | Package                     |
| ------------------- | :--: | --------------------------- |
| API Gateway         | 4000 | @babili/api-gateway         |
| Auth Service        | 4001 | @babili/auth-service        |
| Restaurant Service  | 4002 | @babili/restaurant-service  |
| Order Service       | 4003 | @babili/order-service       |
| Translation Service | 4004 | @babili/translation-service |

## Docker Compose

### Development

```bash
docker compose -f docker-compose.dev.yml up
```

Starts: postgres, redis, web, api-gateway, auth-service, restaurant-service, order-service, translation-service

### Production

```bash
docker compose up
```

### Environment Variables in Docker

In `docker-compose.dev.yml`, variables like `INTERNAL_SERVICE_TOKEN` should be set in the environment section of each service. For production, use the `${VAR}` syntax to reference host environment variables or a `.env` file.

## Internal Service Token

The `INTERNAL_SERVICE_TOKEN` is the shared secret that:

1. **API Gateway** passes it as `X-Internal-Service-Token` header to all proxied requests
2. **Downstream services** validate this header before processing any request

### Setting Up

In development (without Docker):

```bash
export INTERNAL_SERVICE_TOKEN=dev-internal-token
```

In production:

```bash
export INTERNAL_SERVICE_TOKEN=$(openssl rand -hex 32)
```

The `.env.example` file contains a placeholder value. **Never use the default value in production.**

### If the token is not set

- Services will accept requests without validation (dev mode)
- This allows running individual services directly during development

## Security Checklist

- [ ] Set strong `INTERNAL_SERVICE_TOKEN`
- [ ] Do not expose service ports directly (use API Gateway only)
- [ ] Set `NODE_ENV=production`
- [ ] No real secrets committed to repository
- [ ] PostgreSQL credentials use strong passwords
- [ ] Redis has authentication configured
