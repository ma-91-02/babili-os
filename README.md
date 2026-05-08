# Babili — بابلي

**Smart multilingual restaurant operations from table to kitchen.**

Babili is a SaaS restaurant operating system that connects tables, kitchen, and management in 25 languages. Every stakeholder sees the information in their own language through centralized translation.

## Platforms

| Platform   | Domain                        | Path                  |
| ---------- | ----------------------------- | --------------------- |
| Admin      | admin.babili.your-ma.com      | `/admin`              |
| Restaurant | restaurant.babili.your-ma.com | `/restaurant`         |
| Staff      | staff.babili.your-ma.com      | `/staff`              |
| Customer   | customer.babili.your-ma.com   | `/customer`           |
| QR Menu    | —                             | `/r/[restaurantSlug]` |
| API        | api.babili.your-ma.com        | —                     |

## Tech Stack

- **Monorepo:** npm workspaces
- **Frontend:** Next.js 15, TypeScript, SCSS Modules
- **Backend:** Node.js 23, TypeScript, Express
- **Database:** PostgreSQL 16 with Prisma 6 ORM
- **Cache:** Redis 7 via ioredis
- **Testing:** Vitest 4, Supertest
- **Deployment:** Docker, Docker Compose, Coolify-ready

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker (for PostgreSQL and Redis)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis
docker compose -f docker-compose.dev.yml up -d postgres redis

# Run database migrations
npm run db:migrate:dev

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Format code
npm run format

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Docker Development

```bash
npm run docker:dev
```

### Docker Production

```bash
npm run docker:prod
```

## Project Structure

```
babili/
├── apps/web/              # Next.js web application
├── services/              # Backend microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── restaurant-service/
│   ├── order-service/
│   └── translation-service/
├── packages/
│   ├── shared/            # Shared types, constants, utilities
│   └── database/          # Prisma client + Redis client
├── docs/                  # Documentation
└── docker-compose.yml
```

## Database

- **ORM:** Prisma 6
- **Provider:** PostgreSQL 16
- **Client:** `@babili/database` package
- **Schema:** `packages/database/prisma/schema.prisma`
- **Migration:** Initial migration applied (all core models)

### Database Scripts

```bash
npm run db:generate        # Generate Prisma client
npm run db:migrate:dev     # Apply migrations (dev)
npm run db:migrate:deploy  # Apply migrations (prod)
npm run db:studio          # Open Prisma Studio
```

## Services Storage

| Service             | Storage    | Notes                             |
| ------------------- | ---------- | --------------------------------- |
| auth-service        | PostgreSQL | Users, sessions, tokens           |
| restaurant-service  | PostgreSQL | Restaurants, menus, tables, staff |
| order-service       | PostgreSQL | Orders, items, status events      |
| translation-service | In-memory  | Static translation data           |
| api-gateway         | None       | Stateless routing                 |

## Supported Languages

25 languages including RTL support for Arabic, Urdu, Persian, and Hebrew.

## License

Proprietary — All rights reserved.
