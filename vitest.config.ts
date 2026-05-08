import { defineConfig } from 'vitest/config';
import path from 'path';

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://babili:babili_dev_pass@localhost:5432/babili?schema=public';

export default defineConfig({
  resolve: {
    alias: {
      '@babili/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@babili/database': path.resolve(__dirname, 'packages/database/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'services/**/*.test.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
