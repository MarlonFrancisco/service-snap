const STORAGE_KEY = 'ssnap.signup-attribution';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_LENGTH = 100;

/** Origem do cadastro enviada à API. Sem dado pessoal nem query string inteira. */
export type TSignupAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ref?: string;
  landingPath: string;
};

type TStoredAttribution = TSignupAttribution & { capturedAt: number };

const readParam = (params: URLSearchParams, name: string) =>
  params.get(name)?.trim().slice(0, MAX_LENGTH) || undefined;

const hasCampaign = (value: Partial<TSignupAttribution>) =>
  Boolean(value.utmSource || value.utmMedium || value.utmCampaign || value.ref);

const readStored = (now: number): TStoredAttribution | undefined => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as TStoredAttribution;
    return now - stored.capturedAt < TTL_MS ? stored : undefined;
  } catch {
    return undefined;
  }
};

/**
 * First-touch por 30 dias: a primeira visita fica guardada. Só é trocada por
 * uma visita com campanha (UTM ou `ref`) quando a guardada não tinha nenhuma.
 */
export function captureSignupAttribution(
  search: string,
  pathname: string,
  now = Date.now(),
) {
  const params = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  );
  const current: TStoredAttribution = {
    utmSource: readParam(params, 'utm_source'),
    utmMedium: readParam(params, 'utm_medium'),
    utmCampaign: readParam(params, 'utm_campaign'),
    ref: readParam(params, 'ref')?.toUpperCase(),
    landingPath: pathname.slice(0, 200),
    capturedAt: now,
  };

  const stored = readStored(now);
  if (stored && (hasCampaign(stored) || !hasCampaign(current))) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // modo privado ou cota cheia: segue sem origem
  }
}

export function getSignupAttribution(
  now = Date.now(),
): TSignupAttribution | undefined {
  const stored = readStored(now);
  if (!stored) return undefined;

  return {
    utmSource: stored.utmSource,
    utmMedium: stored.utmMedium,
    utmCampaign: stored.utmCampaign,
    ref: stored.ref,
    landingPath: stored.landingPath,
  };
}

export function clearSignupAttribution() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
