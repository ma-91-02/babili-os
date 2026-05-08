# API Reference — Babili / بابلي

## Overview

All API requests go through the API Gateway at `http://localhost:4000` in development.

## Authentication

Most endpoints require a Bearer token obtained from the Auth Service.

### Obtaining a Token

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "uuid-session-token",
    "userId": "uuid",
    "email": "user@example.com",
    "role": "manager",
    "restaurantId": "uuid"
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer <session-token>
```

### Verifying a Token

```
GET /api/v1/auth/verify
Authorization: Bearer <session-token>
```

Response:

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "manager",
    "restaurantId": "uuid"
  }
}
```

## Public Endpoints

### Health Check

```
GET /health
```

### Gateway Info

```
GET /api/v1/gateway/services
GET /api/v1/gateway/routes
GET /api/v1/gateway/health
```

### Auth (no auth required)

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/verify-email/:token
```

### Translations (no auth required)

```
GET /api/v1/translations?lang=en
GET /api/v1/translations/:key?lang=en
GET /api/v1/translations/category/:category?lang=en
GET /api/v1/languages
GET /api/v1/coverage
```

## Protected Endpoints

### Restaurant Service

All restaurant endpoints require authentication. Operations that modify data require manager role or higher.

```
POST   /api/v1/restaurants                    # restaurant_owner
GET    /api/v1/restaurants                    # any auth
GET    /api/v1/restaurants/slug/:slug         # public
GET    /api/v1/restaurants/:id                # any auth (+ tenant)
PUT    /api/v1/restaurants/:id                # restaurant_owner (+ tenant)
DELETE /api/v1/restaurants/:id                # restaurant_owner (+ tenant)

POST   /api/v1/restaurants/:restaurantId/sections   # manager (+ tenant)
GET    /api/v1/restaurants/:restaurantId/sections   # any auth (+ tenant)
PUT    /api/v1/sections/:id                          # manager
DELETE /api/v1/sections/:id                          # manager

POST   /api/v1/restaurants/:restaurantId/items   # manager (+ tenant)
GET    /api/v1/restaurants/:restaurantId/items   # any auth (+ tenant)
PUT    /api/v1/items/:id                          # manager
DELETE /api/v1/items/:id                          # manager

POST   /api/v1/restaurants/:restaurantId/tables   # manager (+ tenant)
GET    /api/v1/restaurants/:restaurantId/tables   # any auth (+ tenant)
PUT    /api/v1/tables/:id                          # manager
DELETE /api/v1/tables/:id                          # manager

POST   /api/v1/restaurants/:restaurantId/staff   # manager (+ tenant)
GET    /api/v1/restaurants/:restaurantId/staff   # any auth (+ tenant)
DELETE /api/v1/staff/:userId                       # manager
```

### Order Service

Most order endpoints require authentication. Creating orders is intentionally public for QR/customer flow.

```
POST  /api/v1/orders                                    # public
GET   /api/v1/orders/:id                                # any auth (+ tenant)
PUT   /api/v1/orders/:id/status                         # waiter
PUT   /api/v1/orders/:id/kitchen                        # kitchen
PUT   /api/v1/orders/:id/cashier                        # cashier
GET   /api/v1/kitchen/queue                             # kitchen
GET   /api/v1/restaurants/:restaurantId/orders          # any auth (+ tenant)
GET   /api/v1/restaurants/:restaurantId/orders/active   # any auth (+ tenant)
GET   /api/v1/restaurants/:restaurantId/orders/history  # any auth (+ tenant)
GET   /api/v1/restaurants/:restaurantId/tables/:tableId/orders  # any auth (+ tenant)
```

### Tenant Notes

- Endpoints marked `(+ tenant)` require the user's `restaurantId` to match the target `restaurantId` in the URL
- Platform roles bypass tenant isolation
- Unauthorized access attempts return `403 Forbidden`
- Non-existent resources return `404 Not Found`

### Role Requirements

- `restaurant_owner` — Full control
- `manager` — Menu, staff, and table management
- `waiter` — Order management
- `kitchen` — Kitchen operations only
- `cashier` — Cashier operations only
- `viewer` — Read-only access
