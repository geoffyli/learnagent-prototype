import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/state/__tests__/*.test.ts'],
    reporters: ['default'],
    coverage: {
      enabled: false,
    },
  },
});
