import type { Category } from '../partner/stores/category/category.entity';
import type { Service } from '../partner/stores/category/service/service.entity';
import type { Gallery } from '../partner/stores/gallery/gallery.entity';
import type { Review } from '../partner/stores/review/review.entity';

export interface IStoreSearchContent {
  name: string;
  description: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  services: Service[];
  categories: Category[];
  /** Flattened for full-text / relevance matching */
  categoryNames: string[];
  serviceNames: string[];
  searchText: string;
  openTime: string;
  closeTime: string;
  businessDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface IStoreSearchMetadata {
  ownerId: string;
  createdAt: string;
  /** Última alteração da loja; o sitemap usa como `lastmod`. */
  updatedAt: string;
  telephone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  amenities: string[];
  currency: string;
  gallery: Gallery[];
  reviews: Review[];
}

/** Loja que o sitemap pode listar: só o necessário para montar a URL. */
export type TStoreSitemapEntry = {
  id: string;
  /** Ausente em documento antigo sem data no índice. */
  updatedAt?: string;
};

/** Par categoria pública + cidade com ao menos uma loja no índice. */
export type TCategoryCitySitemapEntry = {
  /** Nome da categoria exatamente como o web enviou. */
  category: string;
  /** Cidade como a primeira loja do grupo escreveu. */
  city: string;
  storeCount: number;
  /** Atualização mais recente entre as lojas do grupo. */
  updatedAt?: string;
};

export type TStoresSitemap = {
  stores: TStoreSitemapEntry[];
  categoryCities: TCategoryCitySitemapEntry[];
};
