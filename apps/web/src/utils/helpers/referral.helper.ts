const STORAGE_KEY = 'ssnap.referral';

export function captureReferralCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const raw = params.get('ref')?.trim().toUpperCase();
  if (!raw || raw.length < 4 || raw.length > 12) return null;
  if (!/^[A-Z0-9]+$/.test(raw)) return null;

  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // ignore private mode / quota
  }
  return raw;
}

export function getStoredReferralCode(): string | undefined {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)?.trim().toUpperCase();
    return value || undefined;
  } catch {
    return undefined;
  }
}

export function clearStoredReferralCode() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
