# Permissions — Babili / بابلي

## Roles

### Platform Roles (5)

| Role                  | Level | Description                                    |
| --------------------- | :---: | ---------------------------------------------- |
| `platform_owner`      |  100  | Full system access, can manage all restaurants |
| `platform_admin`      |  90   | System administration, all restaurant access   |
| `finance_admin`       |  80   | Financial data access across all restaurants   |
| `translation_manager` |  75   | Manage translations across the platform        |
| `support_agent`       |  70   | Support access to assist restaurant users      |

### Restaurant Roles (6)

| Role               | Level | Description                                         |
| ------------------ | :---: | --------------------------------------------------- |
| `restaurant_owner` |  60   | Full control of their restaurant                    |
| `manager`          |  50   | Daily operations, staff management, menu management |
| `cashier`          |  30   | Payment processing, cashier operations              |
| `kitchen`          |  20   | Kitchen view, order preparation                     |
| `waiter`           |  10   | Order management, table service                     |
| `viewer`           |   5   | Read-only view of restaurant data                   |

### Customer Role (1)

| Role       | Level | Description                              |
| ---------- | :---: | ---------------------------------------- |
| `customer` |   1   | Can place orders, view own order history |

## Permission Helpers

All helpers are in `packages/shared/src/permissions.ts`:

- `roleHasAtLeast(role, minimum)` — Check if a role meets a minimum level
- `canManageRestaurant(role)` — restaurant_owner+
- `canManageStaff(role)` — manager+
- `canManageOrders(role)` — waiter+
- `canViewKitchen(role)` — kitchen+
- `canViewCashier(role)` — cashier+
- `canAccessPlatformAdmin(role)` — platform_admin+
- `canManageTranslations(role)` — translation_manager / platform_admin / platform_owner
- `canAccessFinance(role)` — finance_admin / platform_owner

## Tenant Isolation

Defined in `packages/shared/src/tenant.ts`:

- `assertRestaurantAccess(ctx, restaurantId)` — Throws if user cannot access the restaurant
- `assertPlatformAccess(ctx)` — Throws if user is not a platform role
- `assertOwnership(ctx, resourceRestaurantId)` — Throws if user does not own the resource
- `canAccessRestaurant(role, userRestaurantId, targetRestaurantId)` — Boolean check
- `isTenantIsolated(user, targetRestaurantId)` — Boolean check

## Endpoint Protection

### Restaurant Service

| Method | Path                                       |  Required Role   | Tenant Check |
| ------ | ------------------------------------------ | :--------------: | :----------: |
| POST   | /api/v1/restaurants                        | restaurant_owner |      ❌      |
| GET    | /api/v1/restaurants/:id                    |     any auth     |      ✅      |
| PUT    | /api/v1/restaurants/:id                    | restaurant_owner |      ✅      |
| DELETE | /api/v1/restaurants/:id                    | restaurant_owner |      ✅      |
| POST   | /api/v1/restaurants/:restaurantId/sections |     manager      |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/sections |     any auth     |      ✅      |
| PUT    | /api/v1/sections/:id                       |     manager      |      ❌      |
| DELETE | /api/v1/sections/:id                       |     manager      |      ❌      |
| POST   | /api/v1/restaurants/:restaurantId/items    |     manager      |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/items    |     any auth     |      ✅      |
| PUT    | /api/v1/items/:id                          |     manager      |      ❌      |
| DELETE | /api/v1/items/:id                          |     manager      |      ❌      |
| POST   | /api/v1/restaurants/:restaurantId/tables   |     manager      |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/tables   |     any auth     |      ✅      |
| PUT    | /api/v1/tables/:id                         |     manager      |      ❌      |
| DELETE | /api/v1/tables/:id                         |     manager      |      ❌      |
| POST   | /api/v1/restaurants/:restaurantId/staff    |     manager      |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/staff    |     any auth     |      ✅      |
| DELETE | /api/v1/staff/:userId                      |     manager      |      ❌      |

### Order Service

| Method | Path                                                     |  Required Role   | Tenant Check |
| ------ | -------------------------------------------------------- | :--------------: | :----------: |
| POST   | /api/v1/orders                                           | public (no auth) |      ❌      |
| GET    | /api/v1/orders/:id                                       |     any auth     |      ✅      |
| PUT    | /api/v1/orders/:id/status                                |      waiter      |      ❌      |
| PUT    | /api/v1/orders/:id/kitchen                               |     kitchen      |      ❌      |
| PUT    | /api/v1/orders/:id/cashier                               |     cashier      |      ❌      |
| GET    | /api/v1/kitchen/queue                                    |     kitchen      |      ❌      |
| GET    | /api/v1/restaurants/:restaurantId/orders                 |     any auth     |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/orders/active          |     any auth     |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/orders/history         |     any auth     |      ✅      |
| GET    | /api/v1/restaurants/:restaurantId/tables/:tableId/orders |     any auth     |      ✅      |

Note: `POST /api/v1/orders` is intentionally public to allow customers (including guests scanning QR codes) to place orders without authentication. Order tracking uses the order ID (UUID) as implicit access control.

## Internal Service Token

The `INTERNAL_SERVICE_TOKEN` environment variable provides service-to-service authentication:

- Set to a strong random value in production
- Gateway passes it as `X-Internal-Service-Token` header
- All downstream services validate this header
- In development, defaults to `dev-internal-token` if not set
