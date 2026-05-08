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
- **Backend:** Node.js 20, Express 4, TypeScript
- **Testing:** Vitest, Supertest
- **Deployment:** Docker, Docker Compose (dev + prod), Coolify-ready
- **Lint/Format:** Prettier
- **Auth:** bcryptjs, UUID-based sessions
- **Database:** PostgreSQL (not yet connected)
- **Cache/Realtime:** Redis (not yet connected), SSE/WebSocket (planned)

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
- Translation: centralized in translation-service + web lib
- Auth: in-memory store (MVP), JWT/session based
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

## [LOCAL DEVELOPMENT]

```bash
npm install
npm run dev              # Next.js on :3000
npm test                 # Vitest — 115 tests
npm run typecheck        # TypeScript check
npm run format           # Prettier
cd apps/web && npx next build  # Production build
```

## [MICROSERVICES]

| Service             | Port | Package                     | Status                                                       |
| ------------------- | ---- | --------------------------- | ------------------------------------------------------------ |
| API Gateway         | 4000 | @babili/api-gateway         | Running with health/routes/services endpoints                |
| Auth Service        | 4001 | @babili/auth-service        | Register, login, logout, verify email, forgot/reset password |
| Restaurant Service  | 4002 | @babili/restaurant-service  | CRUD restaurants, menu sections, items, tables, employees    |
| Order Service       | 4003 | @babili/order-service       | Create orders, status flow, kitchen queue, cashier, history  |
| Translation Service | 4004 | @babili/translation-service | 25 languages, coverage validator, all endpoints              |

## [CURRENT MILESTONE]

**Phase 8 — Web Platforms** ✅ Complete
**Next: Phase 9 — Documentation and Verification**

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

- [x] User registration with password hashing (bcryptjs)
- [x] User login with session token
- [x] User logout
- [x] Get current user (/me)
- [x] Email verification structure
- [x] Forgot password structure
- [x] Password reset
- [x] 12 tests for auth

### Phase 5 — Restaurant Service

- [x] Restaurant CRUD
- [x] Menu section CRUD
- [x] Menu item CRUD
- [x] Table CRUD
- [x] Employee management
- [x] Slug-based lookup
- [x] 16 tests

### Phase 6 — Order Service

- [x] Create order with auto total calculation
- [x] Order status flow (pending → confirmed → preparing → ready → delivered)
- [x] Kitchen status tracking
- [x] Cashier status tracking
- [x] Kitchen queue view
- [x] Order history / event log
- [x] Active orders filtering
- [x] Table-based order lookup
- [x] 11 tests

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

## [ORPHANS & PENDING]

- [ ] Database connection (PostgreSQL) — blocked, no DB yet
- [ ] Redis connection — blocked, no Redis yet
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
- [ ] Auth middleware in API Gateway — service-to-service auth

## [RISKS]

- **No database:** All services use in-memory stores; data lost on restart
- **No real-time:** Kitchen queue is poll-based, no push notifications
- **No service-to-service auth:** Gateway routes are open
- **No HTTPS:** Development only
- **Translation duplication:** web lib has duplicate translation data from service

## [NEXT STEPS]

**Phase 9 — Documentation and Verification** (next)

- Final formatter check
- Final typecheck
- Final build
- Final test run
- Health verification
- Architecture documentation

**Post-MVP:**

- PostgreSQL integration
- Redis + WebSocket for real-time
- Authentication on all pages
- Payment gateway integration
- Mobile app
