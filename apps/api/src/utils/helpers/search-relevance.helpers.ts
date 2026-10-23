export type TSearchIntent = {
  rawQuery: string;
  /** Query cleaned of location/noise phrases for the search engine */
  searchQuery: string;
  location?: string;
  category?: string;
};

export type TSearchHit = {
  id: string;
  score?: number;
  content?: {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    categoryNames?: string[];
    serviceNames?: string[];
    categories?: Array<{ name?: string } | string>;
    services?: Array<{ name?: string } | string>;
  };
  metadata?: Record<string, unknown>;
};

/** Known category labels + aliases (lowercase, no accents in keys after normalize). */
const CATEGORY_ALIASES: Record<string, string[]> = {
  barbearia: ['barbearia', 'barbeiro', 'barba', 'corte masculino'],
  'salao de beleza': [
    'salao de beleza',
    'salao',
    'cabeleireiro',
    'cabelereiro',
    'beleza',
    'hair',
  ],
  'spa e massagem': ['spa', 'massagem', 'massoterapeuta', 'relaxante'],
  odontologia: ['odontologia', 'dentista', 'dental'],
  'personal trainer': ['personal trainer', 'personal', 'treino', 'musculacao'],
  estetica: ['estetica', 'esteticista', 'limpeza de pele'],
  manicure: ['manicure', 'pedicure', 'unha', 'nail'],
  psicologia: ['psicologia', 'psicologo', 'terapia'],
  nutricao: ['nutricao', 'nutricionista'],
  fisioterapia: ['fisioterapia', 'fisioterapeuta'],
  pilates: ['pilates'],
  tatuagem: ['tatuagem', 'tattoo', 'tatuador'],
  'pet shop': ['pet shop', 'petshop', 'banho e tosa', 'tosa'],
  fotografia: ['fotografia', 'fotografo'],
  mecanica: ['mecanica', 'mecanico', 'oficina'],
  limpeza: ['limpeza', 'diarista', 'faxina'],
  advocacia: ['advocacia', 'advogado'],
  contabilidade: ['contabilidade', 'contador'],
  academia: ['academia', 'gym', 'crossfit'],
  yoga: ['yoga'],
  veterinario: ['veterinario', 'vet'],
  dermatologia: ['dermatologia', 'dermatologista'],
  eletricista: ['eletricista', 'eletrica'],
  encanador: ['encanador', 'hidraulica', 'encanamento'],
};

const LOCATION_PATTERNS = [
  /\bem\s+([a-zà-ú0-9][a-zà-ú0-9\s\-']{1,40}?)(?=\s+(?:hoje|amanh[aã]|urgente|com|para|perto)\b|[?!.,]|$)/i,
  /\bperto\s+de\s+(?!mim\b)([a-zà-ú0-9][a-zà-ú0-9\s\-']{1,40}?)(?=\s+(?:hoje|amanh[aã]|urgente|com|para)\b|[?!.,]|$)/i,
  /\bno\s+bairro\s+(?:de\s+)?([a-zà-ú0-9][a-zà-ú0-9\s\-']{1,40}?)(?=\s|$|[?!.,])/i,
];

const NOISE_PATTERN =
  /\b(perto de mim|hoje|amanh[aã]|urgente|com disponibilidade|dispon[ií]vel|agora|por favor)\b/gi;

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveCategoryKey(term: string): string | undefined {
  const normalized = normalizeSearchText(term);
  if (!normalized) return undefined;

  for (const [canonical, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (canonical === normalized || aliases.includes(normalized)) {
      return canonical;
    }
    if (
      aliases.some(
        (alias) =>
          normalized.includes(alias) || alias.includes(normalized),
      ) ||
      canonical.includes(normalized) ||
      normalized.includes(canonical)
    ) {
      return canonical;
    }
  }

  return undefined;
}

export function parseSearchIntent(
  query: string,
  options?: { location?: string; category?: string },
): TSearchIntent {
  const rawQuery = query?.trim() ?? '';
  let working = rawQuery;
  let location = options?.location?.trim() || undefined;
  let category = options?.category?.trim() || undefined;

  if (!location) {
    for (const pattern of LOCATION_PATTERNS) {
      const match = working.match(pattern);
      if (match?.[1]) {
        location = match[1].trim();
        working = working.replace(match[0], ' ').trim();
        break;
      }
    }
  }

  working = working.replace(NOISE_PATTERN, ' ').replace(/\s+/g, ' ').trim();

  if (!category) {
    const fromFull = resolveCategoryKey(working) || resolveCategoryKey(rawQuery);
    if (fromFull) {
      category = fromFull;
    }
  } else {
    category = resolveCategoryKey(category) || normalizeSearchText(category);
  }

  if (location) {
    location = normalizeSearchText(location);
  }

  const searchQuery = working || category || rawQuery || '*';

  return {
    rawQuery,
    searchQuery,
    location,
    category,
  };
}

function collectCategoryNames(content: TSearchHit['content']): string[] {
  if (!content) return [];

  const fromFlat = (content.categoryNames || []).filter(Boolean);
  const fromNested = (content.categories || [])
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter((name): name is string => Boolean(name));

  return [...fromFlat, ...fromNested].map(normalizeSearchText);
}

function collectServiceNames(content: TSearchHit['content']): string[] {
  if (!content) return [];

  const fromFlat = (content.serviceNames || []).filter(Boolean);
  const fromNested = (content.services || [])
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter((name): name is string => Boolean(name));

  return [...fromFlat, ...fromNested].map(normalizeSearchText);
}

export function matchesLocation(hit: TSearchHit, location: string): boolean {
  const needle = normalizeSearchText(location);
  if (!needle) return true;

  const content = hit.content;
  const haystack = [
    content?.city,
    content?.state,
    content?.address,
    content?.zipCode,
  ]
    .filter(Boolean)
    .map((part) => normalizeSearchText(String(part)))
    .join(' ');

  if (!haystack) return false;

  return (
    haystack.includes(needle) ||
    needle.split(' ').every((token) => token.length < 2 || haystack.includes(token))
  );
}

export function matchesCategory(hit: TSearchHit, category: string): boolean {
  const key = resolveCategoryKey(category) || normalizeSearchText(category);
  if (!key) return true;

  const aliases = CATEGORY_ALIASES[key] || [key];
  const name = normalizeSearchText(hit.content?.name || '');
  const description = normalizeSearchText(hit.content?.description || '');
  const categories = collectCategoryNames(hit.content);
  const services = collectServiceNames(hit.content);
  const blob = [name, description, ...categories, ...services].join(' ');

  return aliases.some(
    (alias) =>
      blob.includes(alias) ||
      categories.some((c) => c.includes(alias) || alias.includes(c)) ||
      services.some((s) => s.includes(alias) || alias.includes(s)) ||
      name.includes(alias),
  );
}

function relevanceBoost(hit: TSearchHit, intent: TSearchIntent): number {
  let boost = 0;
  const name = normalizeSearchText(hit.content?.name || '');
  const categories = collectCategoryNames(hit.content);
  const services = collectServiceNames(hit.content);
  const tokens = normalizeSearchText(intent.searchQuery)
    .split(' ')
    .filter((token) => token.length > 2);

  for (const token of tokens) {
    if (name.includes(token)) boost += 2;
    if (categories.some((c) => c.includes(token))) boost += 1.5;
    if (services.some((s) => s.includes(token))) boost += 1;
  }

  if (intent.category && matchesCategory(hit, intent.category)) {
    boost += 3;
  }

  if (intent.location && matchesLocation(hit, intent.location)) {
    boost += 2;
  }

  return boost;
}

/**
 * Keep only hits that satisfy explicit location/category constraints,
 * then re-rank by Upstash score + local boosts. Prefer empty over irrelevant.
 */
export function filterAndRankSearchHits(
  hits: TSearchHit[],
  intent: TSearchIntent,
): TSearchHit[] {
  const list = Array.isArray(hits) ? hits : [];

  const filtered = list.filter((hit) => {
    if (intent.location && !matchesLocation(hit, intent.location)) {
      return false;
    }
    if (intent.category && !matchesCategory(hit, intent.category)) {
      return false;
    }
    return true;
  });

  return filtered
    .map((hit) => ({
      hit,
      rank: (hit.score ?? 0) + relevanceBoost(hit, intent),
    }))
    .sort((a, b) => b.rank - a.rank)
    .map(({ hit, rank }) => ({
      ...hit,
      score: rank,
    }));
}
