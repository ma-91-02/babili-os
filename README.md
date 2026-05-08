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
- **Backend:** Node.js, TypeScript, Express
- **Database:** PostgreSQL
- **Cache/Realtime:** Redis, SSE/WebSocket
- **Testing:** Vitest
- **Deployment:** Docker, Docker Compose, Coolify-ready

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Format code
npm run format
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
├── apps/web/          # Next.js web application
├── services/          # Backend microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── restaurant-service/
│   ├── order-service/
│   └── translation-service/
├── packages/shared/   # Shared types, constants, utilities
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── docker-compose.yml
```

## Supported Languages

25 languages including RTL support for Arabic, Urdu, Persian, and Hebrew.

## License

Proprietary — All rights reserved.
