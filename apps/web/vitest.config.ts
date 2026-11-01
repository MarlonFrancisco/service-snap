import { mergeConfig } from 'vitest/config';
import baseConfig from '@repo/vitest-config/next';
import { fileURLToPath } from 'node:url';

export default mergeConfig(baseConfig, {
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
