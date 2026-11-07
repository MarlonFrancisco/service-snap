import {
  WHATSAPP_GUIDE_LAST_STEP,
  WHATSAPP_GUIDE_ROUTE,
} from './whatsapp-connect-guide.constants';

/** `?step=` vem da URL: qualquer valor fora de 0–6 abre a primeira etapa. */
export const parseGuideStep = (value?: string | string[]): number => {
  const step = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(step)) return 0;
  return Math.min(Math.max(step, 0), WHATSAPP_GUIDE_LAST_STEP);
};

export const getGuideStepHref = (step: number) =>
  `${WHATSAPP_GUIDE_ROUTE}?step=${step}`;
