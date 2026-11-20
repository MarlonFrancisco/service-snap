/** Origem do cadastro (first-touch), enviada pelo browser no registro. */
export type TSignupAttributionInput = {
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  ref?: unknown;
  landingPath?: unknown;
};

export type TSignupAttribution = {
  signupUtmSource: string | null;
  signupUtmMedium: string | null;
  signupUtmCampaign: string | null;
  signupRef: string | null;
  signupLandingPath: string | null;
};

export const SIGNUP_UTM_MAX = 100;
export const SIGNUP_LANDING_PATH_MAX = 200;

const UTM_PATTERN = /^[a-z0-9._+\- ]+$/;
const REF_PATTERN = /^[A-Z0-9]{4,12}$/;
const PATH_PATTERN = /^\/[A-Za-z0-9\-._~/%]*$/;

const toUtm = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().slice(0, SIGNUP_UTM_MAX);
  return normalized && UTM_PATTERN.test(normalized) ? normalized : null;
};

const toRef = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return REF_PATTERN.test(normalized) ? normalized : null;
};

/** Só o caminho: query string e hash ficam de fora (podem ter dado pessoal). */
const toLandingPath = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const path = value.trim().split(/[?#]/)[0];
  return path.length <= SIGNUP_LANDING_PATH_MAX && PATH_PATTERN.test(path)
    ? path
    : null;
};

/**
 * Valores inválidos viram `null` em vez de erro: a origem é medição e nunca
 * pode impedir um cadastro. `null` quando não sobra nada.
 */
export const sanitizeSignupAttribution = (
  input: TSignupAttributionInput | null | undefined,
): TSignupAttribution | null => {
  if (!input || typeof input !== 'object') return null;

  const attribution: TSignupAttribution = {
    signupUtmSource: toUtm(input.utmSource),
    signupUtmMedium: toUtm(input.utmMedium),
    signupUtmCampaign: toUtm(input.utmCampaign),
    signupRef: toRef(input.ref),
    signupLandingPath: toLandingPath(input.landingPath),
  };

  return Object.values(attribution).some((value) => value !== null)
    ? attribution
    : null;
};
