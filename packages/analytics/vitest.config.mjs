import { mergeConfig } from 'vitest/config';
import baseConfig from '@repo/vitest-config/base';

export default mergeConfig(baseConfig, {
  test: {
    // O provider do GTM manipula `window` e `document`.
    environment: 'jsdom',
  },
});
