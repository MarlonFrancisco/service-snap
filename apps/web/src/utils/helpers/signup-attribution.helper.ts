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

/**
 * Sem consentimento de analytics nada vai para o dispositivo (Lei 41/2004,
 * art. 5.º; LGPD): a origem fica só nesta visita, em memória.
 */
let visitAttribution: TStoredAttribution | undefined;

const readParam = (params: URLSearchParams, name: string) =>
  params.get(name)?.trim().slice(0, MAX_LENGTH) || undefined;

const hasCampaign = (value: Partial<TSignupAttribution>) =>
  Boolean(value.utmSource || value.utmMedium || value.utmCampaign || value.ref);

const isFresh = (value: TStoredAttribution | undefined, now: number) =>
  value && now - value.capturedAt < TTL_MS ? value : undefined;

const readStored = (now: number): TStoredAttribution | undefined => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return isFresh(JSON.parse(raw) as TStoredAttribution, now);
  } catch {
    return undefined;
  }
};

const writeStored = (value: TStoredAttribution) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // modo privado ou cota cheia: segue sem origem
  }
};

const removeStored = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/** A guardada só cede a uma visita com campanha quando ela mesma não tinha. */
const keepsFirst = (
  first: TStoredAttribution | undefined,
  next: TStoredAttribution,
) => Boolean(first && (hasCampaign(first) || !hasCampaign(next)));

/**
 * First-touch por 30 dias: a primeira visita fica guardada. Só é trocada por
 * uma visita com campanha (UTM ou `ref`) quando a guardada não tinha nenhuma.
 * Sem consentimento (`canStore` falso), vale só para esta visita.
 */
export function captureSignupAttribution(
  search: string,
  pathname: string,
  canStore: boolean,
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

  if (!canStore) {
    if (!keepsFirst(isFresh(visitAttribution, now), current)) {
      visitAttribution = current;
    }
    return;
  }

  if (!keepsFirst(readStored(now), current)) writeStored(current);
}

/**
 * Acompanha a escolha do banner: aceitar passa a origem da visita para o
 * dispositivo; recusar ou retirar apaga a guardada (a da visita continua).
 */
export function syncSignupAttributionConsent(
  canStore: boolean,
  now = Date.now(),
) {
  if (!canStore) {
    removeStored();
    return;
  }

  const visit = isFresh(visitAttribution, now);
  if (visit && !keepsFirst(readStored(now), visit)) writeStored(visit);
  visitAttribution = undefined;
}

export function getSignupAttribution(
  now = Date.now(),
): TSignupAttribution | undefined {
  const stored = readStored(now) ?? isFresh(visitAttribution, now);
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
  visitAttribution = undefined;
  removeStored();
}
