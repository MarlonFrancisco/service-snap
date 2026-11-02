/**
 * Limites da Meta para mensagens interativas. Passar de qualquer um deles faz a
 * API recusar a mensagem inteira, então todo texto de opção passa por `truncate`.
 */
export const WHATSAPP_LIMITS = {
  listRows: 10,
  rowTitle: 24,
  rowDescription: 72,
  sectionTitle: 24,
  buttonTitle: 20,
  header: 60,
  footer: 60,
} as const;

export const truncate = (text: string, max: number): string => {
  const value = (text ?? '').trim();
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
};

/** Minúsculas e sem acento, para comparar o que a pessoa digitou. */
export const normalizeText = (text: string): string =>
  (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Fatia uma lista que cabe em `capacity` linhas. Se sobrar item, a última linha
 * vira "ver mais", então a página leva um item a menos.
 */
export function paginate<T>(items: T[], offset: number, capacity: number) {
  const start = Math.max(0, Math.min(offset, items.length));
  const remaining = items.length - start;
  const hasMore = remaining > capacity;
  const size = hasMore ? capacity - 1 : remaining;

  return {
    items: items.slice(start, start + size),
    hasMore,
    nextOffset: start + size,
  };
}

/** Agrupa linhas em seções na ordem em que cada título aparece. */
export function groupIntoSections<T>(
  items: T[],
  titleOf: (item: T) => string,
  rowOf: (item: T) => { id: string; title: string; description?: string },
) {
  const sections: {
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }[] = [];

  for (const item of items) {
    const title = truncate(titleOf(item), WHATSAPP_LIMITS.sectionTitle);
    let section = sections.find((s) => s.title === title);

    if (!section) {
      section = { title, rows: [] };
      sections.push(section);
    }

    section.rows.push(rowOf(item));
  }

  return sections;
}

const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const SHORT_WEEK_DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Dia da semana de uma data YYYY-MM-DD, sem depender do fuso do servidor. */
const weekDayOf = (dateKey: string) =>
  new Date(`${dateKey}T12:00:00Z`).getUTCDay();

export const addDays = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const isClosedDay = (
  dateKey: string,
  businessDays?: Record<string, boolean>,
): boolean => businessDays?.[WEEK_DAYS[weekDayOf(dateKey)]] === false;

/** "Qua, 05/11" */
export const formatShortDate = (dateKey: string): string => {
  const [, month, day] = dateKey.split('-');
  return `${SHORT_WEEK_DAYS_PT[weekDayOf(dateKey)]}, ${day}/${month}`;
};

/** "Hoje · 8 horários", "Amanhã · 1 horário" ou só a contagem. */
export const describeDay = (
  dateKey: string,
  today: string,
  slotCount: number,
): string => {
  const count = `${slotCount} ${slotCount === 1 ? 'horário' : 'horários'}`;

  if (dateKey === today) return `Hoje · ${count}`;
  if (dateKey === addDays(today, 1)) return `Amanhã · ${count}`;
  return count;
};

export const periodOfDay = (time: string): string => {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return '☀️ Manhã';
  if (hour < 18) return '🌤️ Tarde';
  return '🌙 Noite';
};

/** "30 min", "1h", "1h30" */
export const formatDuration = (minutes: number): string => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)}h${rest ? String(rest).padStart(2, '0') : ''}`;
};

/**
 * Horário digitado em vez de tocado: "14", "14h", "14:30", "14h30".
 * Devolve HH:MM ou null.
 */
export const parseTypedTime = (text: string): string | null => {
  const match = normalizeText(text).match(
    /^(\d{1,2})\s*(?:h|:)?\s*(\d{2})?\s*h?$/,
  );
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
