# Architecture — Babili / بابلي

## System Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│   Next.js    │─────▶│ API Gateway  │─────▶│  Auth Service    │
│   (apps/web) │      │ (port 4000)  │      │  (port 4001)     │
└──────────────┘      └──────┬───────┘      └──────────────────┘
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
             ┌──────────┐ ┌──────┐ ┌──────────┐
             │Restaurant│ │Order │ │Translation│
             │ Service  │ │Service│ │ Service   │
             │ :4002    │ │:4003 │ │ :4004     │
             └──────────┘ └──────┘ └──────────┘
```

## API Gateway

The API Gateway (`services/api-gateway`) is the single entry point for all API requests. It:

- **Proxies** requests to the appropriate microservice
- **Authenticates** via Bearer token verification with Auth Service
- **Passes AuthContext** to downstream services via internal headers
- **Enforces** no direct external access to internal services in production

### Auth Flow

1. Client sends request with `Authorization: Bearer <session-token>` header
2. Gateway validates token by calling `GET /api/v1/auth/verify` on Auth Service
3. If valid, Gateway adds internal headers:
   - `X-Auth-UserId`
   - `X-Auth-Email`
   - `X-Auth-Role`
   - `X-Auth-RestaurantId`
   - `X-Internal-Service-Token`
4. Downstream service validates `X-Internal-Service-Token` and uses `X-Auth-*` headers for authorization

### Route Protection

| Route                    | Auth Required | Public |
| ------------------------ | :-----------: | :----: |
| `/api/v1/auth/*`         |      ❌       |   ✅   |
| `/api/v1/restaurants/*`  |      ✅       |   ❌   |
| `/api/v1/orders/*`       |      ✅       |   ❌   |
| `/api/v1/translations/*` |      ❌       |   ✅   |
| `/api/v1/gateway/*`      |      ❌       |   ✅   |
| `/health`                |      ❌       |   ✅   |

## Service-to-Service Security

All internal service communication uses a shared `INTERNAL_SERVICE_TOKEN` environment variable:

- **Gateway** passes it as `X-Internal-Service-Token` header to downstream services
- **Services** validate this header before processing any privileged request
- If the env var is not set (dev), validation is skipped
- In production, this must be set to a strong random value

## Tenant Isolation

Each restaurant's data is isolated via `restaurantId` scoping. The `requireTenantAccess` middleware ensures:

- Platform roles (`platform_admin`, `platform_owner`, etc.) can access any restaurant
- Restaurant roles can only access their assigned restaurant
- Cross-restaurant access attempts return `403 Forbidden`

## Role-Based Access

Role hierarchy and permissions are defined in `packages/shared/src/permissions.ts`:

| Role                | Level | Can Manage Restaurant | Can Manage Staff | Can Manage Orders | Can View Kitchen | Can View Cashier |
| ------------------- | :---: | :-------------------: | :--------------: | :---------------: | :--------------: | :--------------: |
| platform_owner      |  100  |          ✅           |        ✅        |        ✅         |        ✅        |        ✅        |
| platform_admin      |  90   |          ✅           |        ✅        |        ✅         |        ✅        |        ✅        |
| finance_admin       |  80   |          ❌           |        ❌        |        ❌         |        ❌        |        ✅        |
| translation_manager |  75   |          ❌           |        ❌        |        ❌         |        ❌        |        ❌        |
| support_agent       |  70   |          ❌           |        ❌        |        ❌         |        ❌        |        ❌        |
| restaurant_owner    |  60   |          ✅           |        ✅        |        ✅         |        ✅        |        ✅        |
| manager             |  50   |          ❌           |        ✅        |        ✅         |        ✅        |        ✅        |
| cashier             |  30   |          ❌           |        ❌        |        ❌         |        ❌        |        ✅        |
| kitchen             |  20   |          ❌           |        ❌        |        ❌         |        ✅        |        ❌        |
| waiter              |  10   |          ❌           |        ❌        |        ✅         |        ❌        |        ❌        |
| viewer              |   5   |          ❌           |        ❌        |        ❌         |        ❌        |        ❌        |
| customer            |   1   |          ❌           |        ❌        |        ❌         |        ❌        |        ❌        |

## AuthContext

The `AuthContext` type (`packages/shared/src/types.ts`) is the standard auth container:

```typescript
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  restaurantId: string | null;
}

interface AuthContext {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  error: string | null;
}
```

## Error Responses

All protected endpoints return standardized HTTP error responses:

- `401 Unauthorized` — Missing or invalid authentication
- `403 Forbidden` — Authenticated but insufficient permissions or wrong tenant
- `404 Not Found` — Resource not found (used even for unauthorized access to hide existence)
- `503 Service Unavailable` — Auth service is unreachable

## Internal Auth Headers

| Header                     | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `X-Auth-UserId`            | The authenticated user's ID                                       |
| `X-Auth-Email`             | The authenticated user's email                                    |
| `X-Auth-Role`              | The authenticated user's role                                     |
| `X-Auth-RestaurantId`      | The authenticated user's restaurant ID (empty for platform roles) |
| `X-Internal-Service-Token` | Shared secret validating the request came from the Gateway        |

## What Remains

- **Real-time communication** — SSE/WebSocket planned but not implemented
- **Rate limiting** — Not yet implemented
- **Audit logging** — Not yet implemented
- **OAuth/SSO/2FA** — Post-MVP
- **mTLS** — Post-MVP
