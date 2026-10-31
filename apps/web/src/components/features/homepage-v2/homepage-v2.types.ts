import type { LucideIcon } from 'lucide-react';

export type TMarketplaceCategory = {
  id: string;
  label: string;
  query: string;
  icon: LucideIcon;
};

export type TExperienceBadgeTone = 'success' | 'primary' | 'verified';

export type TExperienceCard = {
  id: string;
  name: string;
  rating: string;
  reviews: number;
  location: string;
  service: string;
  price: string;
  image: string;
  imageAlt: string;
  badgeLabel: string;
  badgeTone: TExperienceBadgeTone;
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
  isPending: boolean;
};
