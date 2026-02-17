import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pairemancipation/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@pairemancipation/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
    },
  },
});
