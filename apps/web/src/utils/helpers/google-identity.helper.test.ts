// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  loadGoogleIdentity,
  resetGoogleIdentityLoader,
} from './google-identity.helper';

const scripts = () =>
  document.head.querySelectorAll('script[src*="accounts.google.com/gsi"]');

describe('loadGoogleIdentity', () => {
  beforeEach(() => {
    resetGoogleIdentityLoader();
    document.head.innerHTML = '';
    delete (window as { google?: unknown }).google;
  });

  afterEach(() => {
    delete (window as { google?: unknown }).google;
  });

  it('injeta o script uma vez só, mesmo com várias chamadas', async () => {
    const first = loadGoogleIdentity();
    const second = loadGoogleIdentity();
    expect(scripts()).toHaveLength(1);

    (window as { google?: unknown }).google = { accounts: {} };
    scripts()[0]?.dispatchEvent(new Event('load'));

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('não injeta nada se o Google já estiver carregado', async () => {
    (window as { google?: unknown }).google = { accounts: {} };

    await expect(loadGoogleIdentity()).resolves.toBe(true);
    expect(scripts()).toHaveLength(0);
  });

  it('resolve false quando o script falha e permite tentar de novo', async () => {
    const attempt = loadGoogleIdentity();
    scripts()[0]?.dispatchEvent(new Event('error'));

    await expect(attempt).resolves.toBe(false);
    expect(scripts()).toHaveLength(0);

    void loadGoogleIdentity();
    expect(scripts()).toHaveLength(1);
  });
});
