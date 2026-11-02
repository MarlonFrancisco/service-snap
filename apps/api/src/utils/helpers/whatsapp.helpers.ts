import type { Category } from '../../modules/partner/stores/category/category.entity';
import type { StoreMember } from '../../modules/partner/stores/store-member/store-member.entity';
import { getUserFullName } from './user.helpers';

export const mapCategoryToWhatsappInteractiveList = (category: Category) => ({
  title: category.name,
  rows: category.services.map((service) => ({
    id: service.id,
    title: service.name,
    description: service.description,
  })),
});

export const mapStoreMemberToWhatsappInteractiveList = (
  storeMember: StoreMember,
) => ({
  id: storeMember.id,
  title: getUserFullName(storeMember.user),
});

// Date validation helpers
export type DateValidationResult = {
  isValid: boolean;
  date?: Date;
  error?: string;
};

export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export const DAYS_OF_WEEK_PT = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
} as const;

export function parseDateFromText(text: string): DateValidationResult {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = text.match(dateRegex);

  if (!match) {
    return {
      isValid: false,
      error:
        'Formato de data inválido. Por favor, use o formato DD/MM/AAAA\n\nExemplo: 25/12/2025',
    };
  }

  const [, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Valida se a data é válida
  if (
    date.getDate() !== parseInt(day) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getFullYear() !== parseInt(year)
  ) {
    return {
      isValid: false,
      error:
        'Data inválida. Verifique o dia, mês e ano.\n\nPor favor, digite novamente no formato DD/MM/AAAA',
    };
  }

  return { isValid: true, date };
}

export function validateFutureDate(date: Date): DateValidationResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return {
      isValid: false,
      error:
        'A data deve ser hoje ou uma data futura.\n\nPor favor, escolha uma nova data no formato DD/MM/AAAA',
    };
  }

  return { isValid: true, date };
}

export function validateBusinessDay(
  date: Date,
  businessDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  },
): DateValidationResult {
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

  if (!businessDays || !businessDays[dayOfWeek]) {
    const availableDays = Object.entries(businessDays || {})
      .filter(([, isOpen]) => isOpen)
      .map(([day]) => DAYS_OF_WEEK_PT[day])
      .join(', ');

    return {
      isValid: false,
      error: `Desculpe, não funcionamos às ${DAYS_OF_WEEK_PT[dayOfWeek]}.\n\nDias disponíveis: ${availableDays}\n\nPor favor, escolha uma nova data no formato DD/MM/AAAA`,
    };
  }

  return { isValid: true, date };
}

export function validateDateForBooking(
  text: string,
  businessDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  },
): DateValidationResult {
  // Valida formato e parse
  const parseResult = parseDateFromText(text);
  if (!parseResult.isValid) return parseResult;

  // Valida se é data futura
  const futureResult = validateFutureDate(parseResult.date);
  if (!futureResult.isValid) return futureResult;

  // Valida dia de funcionamento
  const businessDayResult = validateBusinessDay(parseResult.date, businessDays);
  if (!businessDayResult.isValid) return businessDayResult;

  return { isValid: true, date: parseResult.date };
}
