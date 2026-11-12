import type {
  IStoreSearchMetadata,
  TSearchFilters,
} from '../../modules/search/search.types';
import { NO_PLAN_RANK_TIER } from './search.helpers';

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
    country?: string;
    categories?: Array<{ name?: string } | string>;
    services?: Array<
      | {
          id?: string;
          name?: string;
          price?: number | string;
          duration?: number;
          isActive?: boolean;
        }
      | string
    >;
  };
  metadata?: Record<string, unknown> &
    Partial<
      Pick<
        IStoreSearchMetadata,
        'rankTier' | 'averageRating' | 'reviewCount' | 'minPrice' | 'timezone'
      >
    >;
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

/** Peso da nota no rank: uma loja 5 estrelas ganha o mesmo que o nome bater com a busca. */
const RATING_BOOST_WEIGHT = 0.4;
/** Nota de partida e quantas avaliações ela "vale": poucas avaliações puxam para perto dela. */
const RATING_PRIOR = 4;
const RATING_PRIOR_WEIGHT = 5;

/**
 * Média bayesiana: uma loja com uma única nota 5 não passa à frente de outra
 * com 4,8 em 60 avaliações.
 */
export function weightedRating(average = 0, count = 0): number {
  return (
    (average * count + RATING_PRIOR * RATING_PRIOR_WEIGHT) /
    (count + RATING_PRIOR_WEIGHT)
  );
}

/** Documento indexado antes do `rankTier` conta como sem plano até ser ressincronizado. */
const getRankTier = (hit: TSearchHit) =>
  hit.metadata?.rankTier ?? NO_PLAN_RANK_TIER;

/**
 * Keep only hits that satisfy explicit location/category constraints, then
 * order by plan tier (docs/ranqueamento-busca.md: o nível do plano vem
 * primeiro) and, inside a tier, by Upstash score + local boosts + rating.
 * Prefer empty over irrelevant.
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
      tier: getRankTier(hit),
      rank:
        (hit.score ?? 0) +
        relevanceBoost(hit, intent) +
        weightedRating(getHitAverageRating(hit), getHitReviewCount(hit)) *
          RATING_BOOST_WEIGHT,
    }))
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        b.rank - a.rank ||
        a.hit.id.localeCompare(b.hit.id),
    )
    .map(({ hit, rank }) => ({
      ...hit,
      score: rank,
    }));
}

/** Serviços ativos da loja no documento, com id, para preço e disponibilidade. */
export function getActiveHitServices(hit: TSearchHit) {
  return (hit.content?.services ?? []).filter(
    (service): service is Exclude<typeof service, string> =>
      typeof service !== 'string' && Boolean(service.id) && service.isActive !== false,
  );
}

/**
 * Menor preço da loja. Documento indexado antes de `minPrice` calcula a partir
 * dos serviços, para o filtro não esconder lojas só por falta de reindexação.
 */
export function getHitMinPrice(hit: TSearchHit): number | null {
  if (hit.metadata?.minPrice !== undefined) return hit.metadata.minPrice;

  const prices = getActiveHitServices(hit)
    .map((service) => Number(service.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return prices.length ? Math.min(...prices) : null;
}

/** Nota média; mesmo cuidado com documentos antigos, que só têm a lista de avaliações. */
export function getHitAverageRating(hit: TSearchHit): number {
  if (hit.metadata?.averageRating !== undefined) {
    return hit.metadata.averageRating;
  }

  const reviews = Array.isArray(hit.metadata?.reviews)
    ? (hit.metadata.reviews as Array<{ rating?: number | string }>)
    : [];
  const ratings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  return ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;
}

export function getHitReviewCount(hit: TSearchHit): number {
  if (hit.metadata?.reviewCount !== undefined) return hit.metadata.reviewCount;

  return Array.isArray(hit.metadata?.reviews) ? hit.metadata.reviews.length : 0;
}

/**
 * Preço e nota escolhidos pelo cliente. Loja sem preço cadastrado sai quando há
 * filtro de preço: não dá para garantir que ela cabe na faixa.
 */
export function matchesSearchFilters(
  hit: TSearchHit,
  { minPrice, maxPrice, minRating }: TSearchFilters,
): boolean {
  if (minPrice !== undefined || maxPrice !== undefined) {
    const price = getHitMinPrice(hit);

    if (price === null) return false;
    if (minPrice !== undefined && price < minPrice) return false;
    if (maxPrice !== undefined && price > maxPrice) return false;
  }

  if (minRating !== undefined && getHitAverageRating(hit) < minRating) {
    return false;
  }

  return true;
}
