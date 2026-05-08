# Running Babili Locally

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start infrastructure (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d postgres redis

# 4. Generate Prisma client
npm run db:generate

# 5. Run database migrations
npm run db:migrate:dev

# 6. Seed development data (optional, creates demo accounts)
npm run db:seed

# 7. Start the Next.js dev server
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

| Script                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start Next.js dev server (auto-kills stale :3000 process) |
| `npm run build`        | Production build                                          |
| `npm test`             | Run all tests                                             |
| `npm run typecheck`    | TypeScript check                                          |
| `npm run format`       | Format all files with Prettier                            |
| `npm run health`       | Check all service health endpoints                        |
| `npm run db:seed`      | Seed demo data (6 users, 1 restaurant)                    |
| `npm run db:studio`    | Open Prisma Studio                                        |
| `npm run db:reset:dev` | Reset DB + re-migrate + re-seed                           |

## Services

| Service             | Port | Health URL                   |
| ------------------- | ---- | ---------------------------- |
| Web App (Next.js)   | 3000 | http://localhost:3000        |
| API Gateway         | 4000 | http://localhost:4000/health |
| Auth Service        | 4001 | http://localhost:4001/health |
| Restaurant Service  | 4002 | http://localhost:4002/health |
| Order Service       | 4003 | http://localhost:4003/health |
| Translation Service | 4004 | http://localhost:4004/health |
| PostgreSQL          | 5432 | —                            |
| Redis               | 6379 | —                            |

## After Pulling Latest Code

```bash
git pull
npm install
npm run db:migrate:dev     # Apply any new migrations
npm run db:seed            # Re-seed if needed
npm run dev
```

## Troubleshooting

### White page / 500 error at http://localhost:3000

1. **Stale dev server process**: Kill old processes and restart:

   ```bash
   lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run dev
   ```

   The `predev` script does this automatically on `npm run dev`.

2. **Missing node_modules**:

   ```bash
   npm install
   ```

3. **Missing Prisma client**:

   ```bash
   npm run db:generate
   npm run db:migrate:dev
   ```

4. **Check the browser console** and terminal for the actual error message.

### Health check

```bash
npm run health
```

This checks all 6 services and reports which are up or down.

### Database issues

```bash
# Reset everything
npm run db:reset:dev

# Or just check migration status
npm run db:migrate:dev
```

### Port already in use

```bash
# Kill whatever is on port 3000
lsof -ti:3000 | xargs kill -9
```
