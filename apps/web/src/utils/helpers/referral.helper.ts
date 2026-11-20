const STORAGE_KEY = 'ssnap.referral';

/**
 * Sem consentimento de analytics o código fica só nesta visita, em memória
 * (Lei 41/2004, art. 5.º; #31): o cadastro na mesma visita ainda credita a
 * indicação.
 */
let visitReferralCode: string | undefined;

const writeStored = (code: string) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore private mode / quota
  }
};

const removeStored = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export function captureReferralCodeFromSearch(
  search: string,
  canStore: boolean,
): string | null {
  const params = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  );
  const raw = params.get('ref')?.trim().toUpperCase();
  if (!raw || raw.length < 4 || raw.length > 12) return null;
  if (!/^[A-Z0-9]+$/.test(raw)) return null;

  if (canStore) {
    writeStored(raw);
  } else {
    visitReferralCode = raw;
  }
  return raw;
}

/**
 * Acompanha a escolha do banner: aceitar passa o código da visita para o
 * dispositivo; recusar ou retirar apaga o guardado (o da visita continua).
 */
export function syncReferralConsent(canStore: boolean) {
  if (!canStore) {
    removeStored();
    return;
  }

  if (visitReferralCode) writeStored(visitReferralCode);
  visitReferralCode = undefined;
}

export function getStoredReferralCode(): string | undefined {
  try {
    const value = window.localStorage
      .getItem(STORAGE_KEY)
      ?.trim()
      .toUpperCase();
    return value || visitReferralCode;
  } catch {
    return visitReferralCode;
  }
}

export function clearStoredReferralCode() {
  visitReferralCode = undefined;
  removeStored();
}
