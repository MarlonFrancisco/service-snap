import { TCountryCode, TCurrencyCode } from '@repo/shared/constants';
import { IReview } from '../reviews.types';
import { IService } from './service.types';
import { IStoreGallery } from './stores.types';

export interface IStoreSearchContent {
  name: string;
  description: string;
  country: TCountryCode;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  services: IService[];
  /** Present on indexed stores; used by category/city sitemap entries. */
  categoryNames?: string[];
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
  telephone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  amenities: string[];
  currency: TCurrencyCode;
  timezone: string;
  gallery: IStoreGallery[];
  reviews: IReview[];
}

export interface ISearchResult {
  id: string;
  content: IStoreSearchContent;
  metadata: IStoreSearchMetadata;
  score?: number;
}
