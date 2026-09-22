const { defineConfig }: typeof import('vitest/config') = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['__tests__/**/*-test.ts'],
    setupFiles: ['__helpers__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      reporter: ['text', 'text-summary', 'lcov', 'html'],
    },
    environment: 'node',
  },
});
