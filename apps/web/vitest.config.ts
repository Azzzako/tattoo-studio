import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${projectRoot}$1` },
      {
        find: '@tattoo/config/env',
        replacement: path.resolve(projectRoot, '../../packages/config/src/env.ts'),
      },
      {
        find: '@tattoo/config/presets',
        replacement: path.resolve(projectRoot, '../../packages/config/src/presets.ts'),
      },
      {
        find: '@tattoo/config',
        replacement: path.resolve(projectRoot, '../../packages/config/src/index.ts'),
      },
      {
        find: /^@tattoo\/domain\/booking\/(\w+)$/,
        replacement: path.resolve(projectRoot, '../../packages/domain/src/booking/$1') + '.ts',
      },
      {
        find: /^@tattoo\/domain\/google\/(\w+)$/,
        replacement: path.resolve(projectRoot, '../../packages/domain/src/google/$1') + '.ts',
      },
      {
        find: /^@tattoo\/domain\/authz\/(\w+)$/,
        replacement: path.resolve(projectRoot, '../../packages/domain/src/authz/$1') + '.ts',
      },
      {
        find: /^@tattoo\/domain\/timezone\/(\w+)$/,
        replacement: path.resolve(projectRoot, '../../packages/domain/src/timezone/$1') + '.ts',
      },
      {
        find: '@tattoo/domain/booking',
        replacement: path.resolve(projectRoot, '../../packages/domain/src/booking/index.ts'),
      },
      {
        find: '@tattoo/domain/google',
        replacement: path.resolve(projectRoot, '../../packages/domain/src/google/index.ts'),
      },
      {
        find: '@tattoo/domain/authz',
        replacement: path.resolve(projectRoot, '../../packages/domain/src/authz/index.ts'),
      },
      {
        find: '@tattoo/domain/timezone',
        replacement: path.resolve(projectRoot, '../../packages/domain/src/timezone/index.ts'),
      },
      {
        find: '@tattoo/domain',
        replacement: path.resolve(projectRoot, '../../packages/domain/src/index.ts'),
      },
      {
        find: '@tattoo/google',
        replacement: path.resolve(projectRoot, '../../packages/google/src/index.ts'),
      },
      {
        find: '@tattoo/whatsapp',
        replacement: path.resolve(projectRoot, '../../packages/whatsapp/src/index.ts'),
      },
      {
        find: '@tattoo/email',
        replacement: path.resolve(projectRoot, '../../packages/email/src/index.ts'),
      },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
});