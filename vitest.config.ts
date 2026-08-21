import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
    setupFiles: ['./tests/setup.client.ts'],
    environment: 'jsdom',
    pool: 'forks',
    restoreMocks: true,
  },
})
