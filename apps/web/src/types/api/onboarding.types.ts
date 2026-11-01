import type { IStoreGallery, TWorkingDays } from './stores.types';

export type TOnboardingStep =
  | 'space'
  | 'hours'
  | 'services'
  | 'team'
  | 'photos';

export type TOnboardingStatus = 'not_needed' | 'welcome' | 'in_progress';

export type TOnboardingStore = {
  id: string;
  name: string;
  description: string;
  zipCode: string;
  address: string;
  city: string;
  state: string;
  telephone: string;
  businessDays: TWorkingDays | null;
  openTime: string | null;
  closeTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
};

export type TOnboardingService = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: { id: string; name: string } | null;
};

export type TOnboardingMember = {
  id: string;
  isOwner: boolean;
  name: string;
  email: string | null;
  serviceIds: string[];
};

export type TOnboardingState = {
  status: TOnboardingStatus;
  step: TOnboardingStep | null;
  hasActiveSubscription: boolean;
  store: TOnboardingStore | null;
  businessType: string | null;
  categories: { id: string; name: string }[];
  services: TOnboardingService[];
  members: TOnboardingMember[];
  gallery: IStoreGallery[];
  /** `limit` 0 significa ilimitado. */
  plan: { count: number; limit: number };
};

export type TOnboardingResult = {
  store: TOnboardingStore;
  services: { id: string; name: string; price: number }[];
  gallery: IStoreGallery[];
};

export type TSaveSpacePayload = Pick<
  TOnboardingStore,
  | 'name'
  | 'description'
  | 'zipCode'
  | 'address'
  | 'city'
  | 'state'
  | 'telephone'
> & { businessType: string };

export type TSaveHoursPayload = {
  businessDays: TWorkingDays;
  openTime: string;
  closeTime: string;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
};

export type TAddServicePayload = {
  categoryName: string;
  name: string;
  duration: number;
  price: number;
};

export type TChecklistItemId =
  | 'share_link'
  | 'photos'
  | 'email_reminders'
  | 'whatsapp'
  | 'team'
  | 'monthly_goal';

export type TOnboardingChecklist = {
  visible: boolean;
  storeId: string;
  items: { id: TChecklistItemId; done: boolean }[];
};
