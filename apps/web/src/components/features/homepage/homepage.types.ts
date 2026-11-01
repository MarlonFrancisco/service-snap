export type TExperienceCard = {
  id: string;
  name: string;
  /** Média formatada em pt-BR; `null` quando o espaço ainda não tem avaliações. */
  rating: string | null;
  reviews: number;
  location: string;
  service: string;
  price: string;
  image: string;
  imageAlt: string;
  badgeLabel: string;
  query: string;
};

export type TExperienceRowSource = 'popular' | 'search';

export type TExperienceRowConfig = {
  id: string;
  title: string;
  query: string;
  category?: string;
  source: TExperienceRowSource;
};

export type TExperienceRow = TExperienceRowConfig & {
  items: TExperienceCard[];
};
