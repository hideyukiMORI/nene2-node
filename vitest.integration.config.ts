import { defineConfig } from 'vitest/config';

/** Service-container DB tests — not part of default `npm test`. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
