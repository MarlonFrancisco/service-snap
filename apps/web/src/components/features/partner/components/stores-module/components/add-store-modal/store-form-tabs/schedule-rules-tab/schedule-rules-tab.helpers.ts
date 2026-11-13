import type {
  TScheduleRuleOption,
  TScheduleRulesPreview,
  TScheduleRulesValues,
} from './schedule-rules-tab.types';

/** 90 → "1 h 30 min"; 30 → "30 min"; 1440 → "24 h". */
export const formatMinutesLabel = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

export const formatDaysLabel = (days: number): string =>
  days === 0 ? 'Sem limite' : `${days} ${days === 1 ? 'dia' : 'dias'}`;

export const formatAdvanceLabel = (minutes: number): string =>
  minutes === 0 ? 'Sem mínimo' : formatMinutesLabel(minutes);

/** Um valor salvo fora da lista ainda precisa aparecer selecionado. */
export const withCurrentOption = (
  options: readonly TScheduleRuleOption[],
  value: number,
  formatValue: (value: number) => string,
): readonly TScheduleRuleOption[] => {
  if (Number.isNaN(value) || options.some((option) => option.value === value)) {
    return options;
  }

  return [...options, { value, label: formatValue(value) }].sort(
    (a, b) => a.value - b.value,
  );
};

const toNoticeLabel = (hours: number) => (hours > 0 ? `${hours} h antes` : '');

const getBookingSentence = ({
  slotIntervalMinutes,
  minAdvanceMinutes,
  maxAdvanceDays,
}: TScheduleRulesValues): string => {
  const slot = formatMinutesLabel(slotIntervalMinutes);
  const advance =
    minAdvanceMinutes > 0
      ? `com pelo menos ${formatMinutesLabel(minAdvanceMinutes)} de antecedência`
      : 'até o início do horário';
  const range =
    maxAdvanceDays > 0
      ? ` e até ${formatDaysLabel(maxAdvanceDays)} à frente`
      : ', sem limite de dias à frente';

  return `Os horários aparecem de ${slot} em ${slot}. Dá para marcar ${advance}${range}.`;
};

const getPolicySentence = ({
  cancellationNoticeHours,
  rescheduleNoticeHours,
}: TScheduleRulesValues): string => {
  const cancel = toNoticeLabel(cancellationNoticeHours);
  const reschedule = toNoticeLabel(rescheduleNoticeHours);

  if (!cancel && !reschedule) {
    return 'Você pode cancelar ou remarcar até o início do horário.';
  }

  return `Você pode cancelar até ${cancel || 'o início do horário'} e remarcar até ${
    reschedule || 'o início do horário'
  }. Depois disso, fale com a loja.`;
};

/** Campo numérico vazio chega como NaN: a frase usa 0 até ele ser preenchido. */
const toSafeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

export const getScheduleRulesPreview = (
  values: TScheduleRulesValues,
): TScheduleRulesPreview => {
  const safeValues: TScheduleRulesValues = {
    slotIntervalMinutes: toSafeNumber(values.slotIntervalMinutes) || 30,
    minAdvanceMinutes: toSafeNumber(values.minAdvanceMinutes),
    maxAdvanceDays: toSafeNumber(values.maxAdvanceDays),
    cancellationNoticeHours: toSafeNumber(values.cancellationNoticeHours),
    rescheduleNoticeHours: toSafeNumber(values.rescheduleNoticeHours),
  };

  return {
    booking: getBookingSentence(safeValues),
    policy: getPolicySentence(safeValues),
  };
};
