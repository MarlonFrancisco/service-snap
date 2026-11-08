import {
  getCountryDefaults,
  isValidTimeZone,
  normalizeStateFor,
  toE164,
} from '../../../utils/helpers/region.helpers';
import type { StoreMember } from '../stores/store-member/store-member.entity';
import type { Store } from '../stores/store.entity';
import type { SaveSpaceDto } from './dto/onboarding.dto';
import { ONBOARDING_STEPS, type TOnboardingStep } from './onboarding.types';

/** Rascunho: saiu do assistente sem concluir. Clientes não podem ver. */
export const isStoreDraft = (store: Pick<Store, 'onboarding'>): boolean =>
  Boolean(store.onboarding && !store.onboarding.completedAt);

/** Quem o agendamento público consegue escolher para fazer ao menos um serviço. */
export const isBookableProfessional = (member: StoreMember): boolean =>
  member.role === 'professional' &&
  Boolean(member.isActive) &&
  !member.isDeleted &&
  (member.services?.length ?? 0) > 0;

/** Voltar uma etapa e sair não pode apagar o progresso já feito. */
export const furthestStep = (
  current: TOnboardingStep,
  next: TOnboardingStep,
): TOnboardingStep =>
  ONBOARDING_STEPS.indexOf(next) > ONBOARDING_STEPS.indexOf(current)
    ? next
    : current;

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Devolve a mensagem de erro ou `null` quando os horários são coerentes. */
export const validateBusinessHours = ({
  openTime,
  closeTime,
  lunchStartTime,
  lunchEndTime,
}: {
  openTime: string;
  closeTime: string;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
}): string | null => {
  const open = toMinutes(openTime);
  const close = toMinutes(closeTime);

  if (open >= close) {
    return 'O fechamento precisa ser depois da abertura';
  }

  if (!lunchStartTime && !lunchEndTime) {
    return null;
  }

  if (!lunchStartTime || !lunchEndTime) {
    return 'Informe o início e o fim da pausa';
  }

  const lunchStart = toMinutes(lunchStartTime);
  const lunchEnd = toMinutes(lunchEndTime);

  if (lunchStart >= lunchEnd || lunchStart < open || lunchEnd > close) {
    return 'A pausa precisa ficar dentro do horário de atendimento';
  }

  return null;
};

/**
 * Campos da loja vindos da etapa de espaço. País, moeda e fuso são gravados
 * explicitamente (antes caíam nos defaults do Brasil) e o telefone vai em E.164.
 */
export const buildSpaceRegionFields = ({
  country: countryCode,
  timezone,
  state,
  telephone,
  ...space
}: Omit<SaveSpaceDto, 'businessType'>) => {
  const defaults = getCountryDefaults(countryCode);

  return {
    ...space,
    country: defaults.country,
    currency: defaults.currency,
    timezone: isValidTimeZone(timezone) ? timezone : defaults.timezone,
    state: normalizeStateFor(state, defaults.country),
    // O DTO já validou: o fallback só cobre quem chama sem passar pelo DTO
    telephone: toE164(telephone, defaults.country) ?? telephone,
  };
};
