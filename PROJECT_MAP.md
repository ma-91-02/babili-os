# PROJECT MAP — Babili / بابلي

## [PRODUCT VISION]

Babili is a smart multilingual SaaS restaurant operating system. It enables digital ordering from table to kitchen, centralized management for owners, and real-time visibility — all in 25 languages. Every stakeholder sees information in their language via centralized translation.

## [SYSTEM PLATFORMS]

| Platform   | Future Domain                 | Path                | Status                    |
| ---------- | ----------------------------- | ------------------- | ------------------------- |
| Admin      | admin.babili.your-ma.com      | /admin              | Working with translations |
| Restaurant | restaurant.babili.your-ma.com | /restaurant         | Working with translations |
| Staff      | staff.babili.your-ma.com      | /staff              | Working with translations |
| Customer   | customer.babili.your-ma.com   | /customer           | Working with translations |
| QR Menu    | —                             | /r/[restaurantSlug] | Working                   |
| API        | api.babili.your-ma.com        | —                   | API Gateway running       |

## [TECH STACK]

- **Monorepo:** npm workspaces
- **Frontend:** Next.js 15, React 19, TypeScript 5.3, SCSS Modules
- **Backend:** Node.js 23, Express 4, TypeScript
- **Database:** PostgreSQL 16 with Prisma 6 ORM (connected)
- **Cache:** Redis 7 foundation with ioredis (lazy-connect, configured in compose)
- **Testing:** Vitest 4, Supertest
- **Deployment:** Docker, Docker Compose (dev + prod), Coolify-ready
- **Lint/Format:** Prettier
- **Auth:** bcryptjs, UUID-based sessions via Prisma DB

## [SYSTEM FLOW]

1. Customer scans QR → /r/[slug] → views menu → places order
2. Order → Order Service → Kitchen queue → Kitchen view
3. Kitchen prepares → status update → Cashier view → Payment
4. Restaurant Owner → Dashboard → manages all aspects
5. Platform Admin → oversees all restaurants
6. All text flows through Translation Service

## [ARCHITECTURE]

- Monorepo with npm workspaces
- apps/web: Next.js App Router with 5 platform routes
- services/: 5 Express microservices, each on separate port
- packages/shared: shared types, constants, permissions, tenant helpers
- packages/database: Prisma client + Redis client shared across services
- Translation: centralized in translation-service + web lib
- Auth: Prisma DB sessions (JWT/session based)
- API Gateway: routes health checks, service discovery
- Tenant isolation via restaurantId scoping

## [ROLES & PERMISSIONS]

Defined in packages/shared/src/types.ts and permissions.ts

**Platform Roles (5):** platform_owner, platform_admin, support_agent, finance_admin, translation_manager
**Restaurant Roles (6):** restaurant_owner, manager, cashier, kitchen, waiter, viewer
**Customer Role (1):** customer

**Key Permission Functions:**

- `canManageRestaurant` — restaurant_owner+
- `canManageStaff` — manager+
- `canManageOrders` — waiter+
- `canViewKitchen` — kitchen+
- `canViewCashier` — cashier+
- `canAccessPlatformAdmin` — platform_admin+
- `canManageTranslations` — translation_manager+
- `canAccessFinance` — finance_admin+

**Tenant Isolation:**

- `assertRestaurantAccess(ctx, restaurantId)` — throws if not authorized
- `assertPlatformAccess(ctx)` — throws if not platform role
- `assertOwnership(ctx, resourceId)` — throws if not owner
- `isTenantIsolated(user, restaurantId)` — checks if isolated

## [TRANSLATION SYSTEM]

- **25 supported languages** defined in shared constants
- **BRAND_NAME** available in all 25 languages
- **RTL_LANGUAGES:** ar, ur, fa, he
- **Translation Service:** Express app on port 4004
- **Endpoints:**
  - GET /api/v1/translations?lang=en
  - GET /api/v1/translations/:key?lang=en
  - GET /api/v1/translations/category/:category?lang=en
  - GET /api/v1/languages
  - GET /api/v1/coverage
  - POST /api/v1/coverage/assert
- **Coverage Validator:** validates all keys have all 25 languages
- **Web App Translation:** apps/web/lib/i18n.ts — `t(key, lang)` function
- **Translation Categories:** common, auth, nav, admin, customer, order, error
- **Coverage:** 100% — all keys have all 25 languages

## [DESIGN SYSTEM]

**Colors:**

- Main: #614AE1 | Background: #F0EEFF | Secondary: #E1DCFF
- Success: #22C55E | Warning: #F59E0B | Error: #EF4444 (limited use)

**Design Tokens:** apps/web/styles/\_tokens.scss
**Global Styles:** apps/web/styles/globals.scss
**RTL Support:** dir="rtl" attribute, Arabic font family defined

## [DOMAIN ROUTING]

Not yet configured. Planned:

- admin.babili.your-ma.com → /admin
- restaurant.babili.your-ma.com → /restaurant
- staff.babili.your-ma.com → /staff
- customer.babili.your-ma.com → /customer
- api.babili.your-ma.com → API Gateway

## [COOLIFY DEPLOYMENT]

Not yet configured. Docker Compose files ready.

## [DATABASE]

- **ORM:** Prisma 6.19.3
- **Provider:** PostgreSQL 16
- **Client generated:** `@prisma/client` at root node_modules
- **Package:** `@babili/database` at packages/database
- **Schema:** packages/database/prisma/schema.prisma
- **Migration applied:** 20260508132520_init (all models created)

### Models

- User, Session, EmailVerificationToken, PasswordResetToken
- Restaurant, RestaurantStaff, RestaurantTable
- MenuSection, MenuItem, Ingredient, MenuItemIngredient
- Order, OrderItem, OrderStatusEvent

### Redis

- **Client:** ioredis 5.4
- **Connection:** Lazy-connect, graceful fallback if REDIS_URL not set
- **Health:** redisHealth() ping check
- **Usage:** Foundation in place, not yet used by business logic

## [LOCAL DEVELOPMENT]

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis (Docker)
npm run docker:dev          # or: docker compose -f docker-compose.dev.yml up -d postgres redis

# Run database migrations
npm run db:migrate:dev      # Apply Prisma migrations to dev DB

# Generate Prisma client
npm run db:generate

# Start dev servers
npm run dev                 # Next.js on :3000

# Run tests
npm test                    # All 105 tests pass

# Type check
npm run typecheck

# Format
npm run format

# Prisma Studio (DB GUI)
npm run db:studio
```

## [MICROSERVICES]

| Service             | Port | Package                     | Storage    | Status                                                       |
| ------------------- | ---- | --------------------------- | ---------- | ------------------------------------------------------------ |
| API Gateway         | 4000 | @babili/api-gateway         | None       | Running with health/routes/services endpoints                |
| Auth Service        | 4001 | @babili/auth-service        | PostgreSQL | Register, login, logout, verify email, forgot/reset password |
| Restaurant Service  | 4002 | @babili/restaurant-service  | PostgreSQL | CRUD restaurants, menu sections, items, tables, employees    |
| Order Service       | 4003 | @babili/order-service       | PostgreSQL | Create orders, status flow, kitchen queue, cashier, history  |
| Translation Service | 4004 | @babili/translation-service | In-memory  | 25 languages, coverage validator, all endpoints              |

## [CURRENT MILESTONE]

**Phase 11 — Auth Middleware + Route Protection + Service-to-Service Security Foundation** ✅ Complete

## [COMPLETED]

### Phase 1 — Project Foundation

- [x] Root package.json with npm workspaces
- [x] TypeScript config (base + root + per module)
- [x] Prettier config
- [x] apps/web with Next.js 15, React 19, TypeScript, SCSS Modules
- [x] Root layout with global SCSS
- [x] Landing page with Babili design system
- [x] All 5 platform routes (admin, restaurant, staff, customer, QR)
- [x] All 5 microservice stubs with health endpoints
- [x] packages/shared with constants, types
- [x] Docker files (Dockerfile, Dockerfile.dev, Dockerfile.service, Dockerfile.dev.service)
- [x] Docker Compose (dev + prod)
- [x] vitest.config.ts
- [x] README.md, PROJECT_MAP.md

### Phase 2 — Shared Core

- [x] SUPPORTED_LANGUAGES (25 languages)
- [x] BRAND_NAME in 25 languages
- [x] RTL_LANGUAGES defined
- [x] Platform roles (5) and Restaurant roles (6)
- [x] All shared types (User, Restaurant, Menu, Order, etc.)
- [x] Permission helpers (roleHasAtLeast, canManage\*, etc.)
- [x] Tenant isolation helpers (assertRestaurantAccess, assertPlatformAccess, etc.)
- [x] Design tokens documentation (docs/design-tokens.md)
- [x] 54 tests for shared package

### Phase 3 — Translation Service

- [x] 25 languages with all translation keys
- [x] Translation categories: common, auth, nav, admin, customer, order, error
- [x] Translation endpoints: /translations, /translations/:key, /translations/category/:category
- [x] Language listing endpoint
- [x] Coverage validator (validateCoverage, assertFullCoverage)
- [x] Coverage endpoints
- [x] 18 tests for translations + validator

### Phase 4 — Auth Service

- [x] User registration with password hashing (bcryptjs) via Prisma
- [x] User login with session token via Prisma
- [x] User logout
- [x] Get current user (/me)
- [x] Email verification structure
- [x] Forgot password structure
- [x] Password reset
- [x] 8 tests with real database

### Phase 5 — Restaurant Service

- [x] Restaurant CRUD via Prisma
- [x] Menu section CRUD via Prisma
- [x] Menu item CRUD via Prisma
- [x] Table CRUD via Prisma
- [x] Employee management via Prisma
- [x] Ingredient management via Prisma
- [x] Slug-based lookup
- [x] 12 tests with real database

### Phase 6 — Order Service

- [x] Create order with auto total calculation via Prisma
- [x] Order status flow (pending → confirmed → preparing → ready → delivered)
- [x] Kitchen status tracking
- [x] Cashier status tracking
- [x] Kitchen queue view
- [x] Order history / event log
- [x] Active orders filtering
- [x] Table-based order lookup
- [x] 9 tests with real database

### Phase 7 — API Gateway

- [x] Health endpoint with version and uptime
- [x] Service registry listing
- [x] Aggregated health check across all services
- [x] Route listing
- [x] 4 tests with supertest

### Phase 8 — Web Platforms

- [x] All 5 platform routes with Babili design
- [x] Translation integration (t() function)
- [x] Centralized translation in apps/web/lib/i18n.ts
- [x] Responsive layouts (mobile, tablet, desktop)
- [x] RTL support structure
- [x] Babylon-inspired visual design
- [x] Official Babili colors throughout

### Phase 9 — Documentation and Verification

- [x] Prettier format check
- [x] TypeScript typecheck
- [x] Test suite verification
- [x] Architecture documentation

### Phase 10 — Database Integration + Redis Foundation

- [x] packages/database with Prisma + Redis client (January 2026)
- [x] Prisma schema with all models (User, Restaurant, Menu, Order, etc.)
- [x] Initial migration applied (20260508132520_init)
- [x] PostgreSQL + Redis added to Docker Compose (dev + prod)
- [x] Auth service migrated from in-memory to Prisma repositories
- [x] Restaurant service migrated from in-memory to Prisma repositories
- [x] Order service migrated from in-memory to Prisma repositories
- [x] Redis client with lazy-connect and graceful fallback
- [x] Repository pattern established for all DB operations
- [x] All tests pass with real database (105 tests, 9 suites)
- [x] Vitest 4 + Vite 8 confirmed working on Node 23
- [x] Order test fixed: menuItem Prisma relation connect, beforeAll variable hoisting fix
- [x] Package.json scripts: db:generate, db:migrate:dev, db:migrate:deploy, db:studio
- [x] Removed 3 orphaned in-memory store.ts files (auth-service, restaurant-service, order-service)
- [x] Created dev-only idempotent database seed (packages/database/src/seed.ts)
- [x] Seed produces 6 users, 1 restaurant, 4 staff, 5 tables, 4 menu sections, 14 items, 20 ingredients
- [x] Seed scripts added: db:seed, db:reset:dev
- [x] bcryptjs added to packages/database for seed password hashing

### Phase 11 — Auth Middleware + Route Protection + Service-to-Service Security Foundation

- [x] AuthContext and AuthenticatedUser types in packages/shared
- [x] Auth helpers (buildAuthContext, extractAuthContextFromHeaders, validateInternalToken)
- [x] Token verify endpoint added to auth-service (GET /api/v1/auth/verify)
- [x] API Gateway now proxies requests to all microservices via http-proxy-middleware
- [x] Auth middleware in API Gateway validates Bearer token via auth-service
- [x] Auth context passed to downstream services via X-Auth-\* internal headers
- [x] X-Internal-Service-Token header mechanism for service-to-service auth
- [x] Route protection in restaurant-service (role-based + tenant isolation)
- [x] Route protection in order-service (role-based + tenant isolation)
- [x] Public endpoints: health, auth routes, translation routes, slug lookup, order creation
- [x] Protected endpoints require role checks (owner, manager, waiter, kitchen, cashier)
- [x] Tenant isolation middleware prevents cross-restaurant access
- [x] Standardized error responses (401, 403, 404, 503)
- [x] INTERNAL_SERVICE_TOKEN env var documented in .env.example
- [x] Auth helpers unit tests (packages/shared: 17 tests)
- [x] API Gateway auth middleware tests (6 tests)
- [x] Restaurant service auth middleware tests (10 tests)
- [x] Order service auth middleware tests (15 tests)
- [x] docs/architecture.md — Auth flow, route protection, internal headers
- [x] docs/permissions.md — Full role/permission matrix, endpoint protection table
- [x] docs/api.md — Complete API reference with auth requirements
- [x] docs/deployment.md — Env vars, internal token setup, security checklist
- [x] All 154 tests pass (105 existing + 49 new)

## [ORPHANS & PENDING]

- [ ] Real-time communication (SSE/WebSocket) — Phase 6 structure exists but no real-time
- [ ] Admin authentication — pages are public (pre-auth)
- [ ] Restaurant authentication — pages are public (pre-auth)
- [ ] Staff authentication — pages are public (pre-auth)
- [ ] Customer authentication — pages are public (pre-auth)
- [ ] QR code generation — stub exists
- [ ] Payment provider integration — post-MVP
- [ ] Full inventory system — post-MVP
- [ ] Full finance system — post-MVP
- [ ] POS integration — post-MVP
- [ ] Mobile app — post-MVP (not in current scope)
- [ ] Offers & stories — post-MVP
- [ ] Public restaurant page — post-MVP
- [ ] Domain routing configuration — needs DNS
- [ ] Coolify deployment configuration — needs server
- [ ] RTL comprehensive testing — structure exists, needs verification
- [ ] Redis usage in business logic — foundation only, not yet consuming
- [ ] Redis session store — sessions currently in PostgreSQL

## [RISKS]

- **No real-time:** Kitchen queue is poll-based, no push notifications
- **No service-to-service auth:** Gateway routes are open
- **No HTTPS:** Development only
- **Translation duplication:** web lib has duplicate translation data from service
- **Vitest 4.x engines warning:** vitest 4.1.5 engine requires Node ^20/^22/>=24 but works on Node 23 (cosmetic warning only)
- **Test isolation:** DB tests share a single Postgres instance; tests clean up test-specific data but cannot run fully in parallel
- **Redis not used yet:** Client ready, but no business logic consumes it

## [NEXT STEPS]

**Phase 12 — Web Platform Authentication** (next)

- Add login/register/session to web platforms
- Protect admin, restaurant, staff routes with auth
- Customer QR ordering remains public

**Phase 13 — Real-time Communication** (future)

- WebSocket or SSE for kitchen queue, order updates
- Real-time push notifications

**Post-MVP:**

- Redis + WebSocket for real-time
- Authentication on all pages
- Payment gateway integration
- Mobile app
