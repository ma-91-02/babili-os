#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ENV = {
  DATABASE_URL: 'postgresql://babili:babili_dev_pass@localhost:5432/babili?schema=public',
  INTERNAL_SERVICE_TOKEN: 'dev-internal-token',
};

const PORTS = [3000, 4000, 4001, 4002, 4003, 4004];

const DOCKER_COMPOSE_DEV = path.resolve(ROOT, 'docker-compose.dev.yml');

const services = [
  {
    name: 'API Gateway',
    port: 4000,
    cwd: 'services/api-gateway',
    cmd: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: { ...ENV, PORT: '4000' },
  },
  {
    name: 'Auth Service',
    port: 4001,
    cwd: 'services/auth-service',
    cmd: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: { ...ENV, PORT: '4001' },
  },
  {
    name: 'Restaurant Service',
    port: 4002,
    cwd: 'services/restaurant-service',
    cmd: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: { ...ENV, PORT: '4002' },
  },
  {
    name: 'Order Service',
    port: 4003,
    cwd: 'services/order-service',
    cmd: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: { ...ENV, PORT: '4003' },
  },
  {
    name: 'Translation Service',
    port: 4004,
    cwd: 'services/translation-service',
    cmd: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: { PORT: '4004' },
  },
];

function log(msg) {
  console.log(`  ${msg}`);
}

function killStaleProcesses() {
  console.log('\n🧹 Cleaning stale processes...');
  for (const port of PORTS) {
    try {
      const pid = execSync(`lsof -ti:${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (pid) {
        process.kill(parseInt(pid, 10), 'SIGTERM');
        log(`Killed process ${pid} on port ${port}`);
      }
    } catch {
      // No process on this port
    }
  }
}

function checkDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function startDockerServices() {
  if (!fs.existsSync(DOCKER_COMPOSE_DEV)) {
    log('⚠️  docker-compose.dev.yml not found — skipping Docker services');
    return false;
  }

  if (!checkDocker()) {
    log('⚠️  Docker not available — skipping PostgreSQL/Redis startup');
    log('   Make sure PostgreSQL and Redis are running manually');
    return false;
  }

  console.log('\n🐳 Starting Docker services (PostgreSQL + Redis)...');
  try {
    execSync(`docker compose -f "${DOCKER_COMPOSE_DEV}" up -d postgres redis`, {
      stdio: 'inherit',
      cwd: ROOT,
      timeout: 60000,
    });
    log('✅ Docker services started');
    return true;
  } catch (err) {
    log(`❌ Docker services failed: ${err.message}`);
    log('   Make sure PostgreSQL and Redis are running manually');
    return false;
  }
}

async function waitForPostgres() {
  console.log('\n🗄️  Waiting for PostgreSQL to be ready...');
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync(
        `PGPASSWORD=babili_dev_pass psql -h localhost -U babili -d babili -c "SELECT 1" -q`,
        { stdio: 'ignore', timeout: 3000 },
      );
      log('✅ PostgreSQL ready');
      return true;
    } catch {
      process.stdout.write('.');
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.log('');
  log('⚠️  PostgreSQL did not respond — continuing anyway');
  return false;
}

async function runPrismaCommands() {
  console.log('\n🔧 Running Prisma setup...');

  try {
    log('Generating Prisma client...');
    execSync('npx prisma generate', {
      cwd: path.resolve(ROOT, 'packages/database'),
      stdio: 'inherit',
      timeout: 30000,
    });
    log('✅ Prisma client generated');
  } catch (err) {
    log(`⚠️  Prisma generate failed: ${err.message}`);
    log('   Continuing — may affect services that use DB');
  }

  try {
    log('Running migrations...');
    execSync('npx prisma migrate deploy', {
      cwd: path.resolve(ROOT, 'packages/database'),
      stdio: 'inherit',
      timeout: 30000,
    });
    log('✅ Migrations applied');
  } catch {
    log('⚠️  Migrations failed — DB may already be up to date');
  }
}

async function seedDatabase() {
  console.log('\n🌱 Seeding database...');
  try {
    execSync('npx tsx src/seed.ts', {
      cwd: path.resolve(ROOT, 'packages/database'),
      stdio: 'inherit',
      timeout: 30000,
    });
    log('✅ Database seeded');
  } catch (err) {
    log(`⚠️  Seed skipped: ${err.message}`);
  }
}

function startService(svc) {
  return new Promise((resolve) => {
    const cwd = path.resolve(ROOT, svc.cwd);
    const logDir = path.resolve(ROOT, 'logs');
    const logFile = path.resolve(logDir, `${svc.name.replace(/\s+/g, '-').toLowerCase()}.log`);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    const child = spawn(svc.cmd, svc.args, {
      cwd,
      env: { ...process.env, ...svc.env },
      stdio: ['ignore', logStream, logStream],
      detached: true,
    });

    child.on('error', (err) => {
      log(`❌ ${svc.name} failed to start: ${err.message}`);
      resolve(false);
    });

    child.unref();
    log(`🟡 ${svc.name} starting (PID: ${child.pid})...`);

    let resolved = false;
    const check = async () => {
      try {
        const res = await fetch(`http://localhost:${svc.port}/health`, {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok || res.status === 200) {
          if (!resolved) {
            resolved = true;
            log(`✅ ${svc.name} ready (port ${svc.port})`);
            resolve(true);
          }
          return;
        }
      } catch {
        // Not ready yet
      }
      if (!resolved) {
        setTimeout(check, 500);
      }
    };
    setTimeout(check, 1500);
  });
}

async function startNextDev() {
  return new Promise((resolve) => {
    const cwd = path.resolve(ROOT, 'apps/web');
    const logDir = path.resolve(ROOT, 'logs');
    const logFile = path.resolve(logDir, 'next-dev.log');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    const child = spawn('npx', ['next', 'dev'], {
      cwd,
      env: { ...process.env, ...ENV },
      stdio: ['ignore', logStream, logStream],
      detached: true,
    });

    child.on('error', (err) => {
      log(`❌ Next.js failed to start: ${err.message}`);
      resolve(false);
    });

    child.unref();
    log('🟡 Next.js starting...');

    let resolved = false;
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3000', {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok || res.status === 200 || res.status === 307) {
          if (!resolved) {
            resolved = true;
            log('✅ Next.js ready (port 3000)');
            resolve(true);
          }
          return;
        }
      } catch {
        // Not ready yet
      }
      if (!resolved) {
        setTimeout(check, 1000);
      }
    };
    setTimeout(check, 5000);
  });
}

function runHealthCheck() {
  return new Promise((resolve) => {
    const child = spawn('node', [path.resolve(ROOT, 'scripts', 'health.mjs')], {
      cwd: ROOT,
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    child.on('close', (code) => resolve(code === 0));
  });
}

function printAccounts() {
  console.log('\n📋 Demo Accounts (password: demo1234)');
  console.log('   Admin:     admin@babili.dev');
  console.log('   Owner:     owner@babili.dev');
  console.log('   Manager:   manager@babili.dev');
  console.log('   Waiter:    waiter@babili.dev');
  console.log('   Kitchen:   kitchen@babili.dev');
  console.log('   Cashier:   cashier@babili.dev');
}

async function main() {
  console.log('\n🚀 Babili — Starting development environment\n');

  killStaleProcesses();
  await new Promise((r) => setTimeout(r, 1000));

  await startDockerServices();
  await waitForPostgres();

  await runPrismaCommands();
  await seedDatabase();

  console.log('\n📡 Starting microservices...\n');
  const results = await Promise.allSettled(services.map(startService));

  const failed = results.filter((r) => r.status === 'rejected' || r.value === false);
  if (failed.length > 0) {
    log(`⚠️  ${failed.length} service(s) failed to start. Check logs/ directory.\n`);
  }

  console.log('\n🌐 Starting Next.js dev server...\n');
  await startNextDev();

  console.log('\n🔍 Running final health check...\n');
  await runHealthCheck();

  console.log('\n✅ Babili is running!');
  console.log('   http://localhost:3000');
  printAccounts();
  console.log();
}

main();
