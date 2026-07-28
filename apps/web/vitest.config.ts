import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '@/app': fileURLToPath(new URL('./app', import.meta.url)),
      '@/components': fileURLToPath(new URL('./components', import.meta.url)),
      '@/lib': fileURLToPath(new URL('./lib', import.meta.url)),
      '@tattoo/config': fileURLToPath(
        new URL('../../packages/config/src/index.ts', import.meta.url),
      ),
      '@tattoo/domain': fileURLToPath(new URL('../../packages/domain', import.meta.url)),
      '@tattoo/db': fileURLToPath(new URL('../../packages/db', import.meta.url)),
      '@tattoo/google': fileURLToPath(
        new URL('../../packages/google/src/index.ts', import.meta.url),
      ),
      '@tattoo/whatsapp': fileURLToPath(
        new URL('../../packages/whatsapp/src/index.ts', import.meta.url),
      ),
      '@tattoo/email': fileURLToPath(
        new URL('../../packages/email/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
});