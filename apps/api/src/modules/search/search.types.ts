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
