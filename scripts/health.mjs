#!/usr/bin/env node

const services = [
  { name: 'Web App', url: 'http://localhost:3000' },
  { name: 'API Gateway', url: 'http://localhost:4000/health' },
  { name: 'Auth Service', url: 'http://localhost:4001/health' },
  { name: 'Restaurant Service', url: 'http://localhost:4002/health' },
  { name: 'Order Service', url: 'http://localhost:4003/health' },
  { name: 'Translation Service', url: 'http://localhost:4004/health' },
];

async function check() {
  console.log('\n🔍 Babili Health Check\n');

  let allOk = true;

  for (const svc of services) {
    try {
      const res = await fetch(svc.url, { signal: AbortSignal.timeout(3000) });
      const ok = res.ok || res.status === 200;
      const status = ok ? '✅' : '❌';
      console.log(`  ${status} ${svc.name.padEnd(20)} ${svc.url}  (${res.status})`);
      if (!ok) allOk = false;
    } catch {
      console.log(`  ❌ ${svc.name.padEnd(20)} ${svc.url}  (unreachable)`);
      allOk = false;
    }
  }

  console.log(allOk ? '\n✅ All services healthy\n' : '\n⚠️  Some services are down\n');
  process.exit(allOk ? 0 : 1);
}

check();
