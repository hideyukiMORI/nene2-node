import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/integration/**'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server/dev-server.ts', 'src/index.ts'],
      reporter: ['text', 'text-summary'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
        'src/example/note/note-use-cases.ts': { lines: 90 },
        'src/example/tag/tag-use-cases.ts': { lines: 90 },
      },
    },
  },
});
