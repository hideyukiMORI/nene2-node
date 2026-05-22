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
      exclude: ['src/server/dev-server.ts'],
      reporter: ['text', 'text-summary'],
      thresholds: {
        lines: 76,
        statements: 76,
        functions: 78,
        branches: 69,
        'src/example/note/note-use-cases.ts': { lines: 88 },
        'src/example/tag/tag-use-cases.ts': { lines: 88 },
      },
    },
  },
});
