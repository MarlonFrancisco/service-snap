import type { IStore } from '@/types/api/stores.types';
import type { IProfessional, TProfessionalRole } from '@/types/api/users.types';
import { formatBusinessHours } from '@/utils/helpers/business-hours.helper';
import type { TPlanUsage } from '../stores-module.types';
import {
  AMENITIES_LIST,
  STAFF_ROLES,
  STORE_IMAGES_BASE_URL,
} from './stores-module.constants';

export const getRoleLabel = (role: TProfessionalRole): string => {
  return STAFF_ROLES[role].label;
};

export const isCustomAmenity = (amenity: string): boolean => {
  return !(AMENITIES_LIST as readonly string[]).includes(amenity);
};

/**
 * Plano ilimitado chega como 0 ou, com o metadado "UNLIMITED" do Stripe, como
 * null (`parseInt` vira NaN no JSON). Os dois casos não têm teto.
 */
export const getPlanUsage = (current: number, limit: number): TPlanUsage => {
  const isUnlimited = !limit;

  return {
    current,
    limit,
    isUnlimited,
    isAtLimit: !isUnlimited && current >= limit,
    label: `${current} de ${isUnlimited ? '∞' : limit} no plano`,
  };
};

/** As colunas são anuláveis na API; loja sem horário não é "Fechado". */
export const getStoreHoursLabel = ({
  openTime,
  closeTime,
  businessDays,
}: Pick<IStore, 'openTime' | 'closeTime' | 'businessDays'>): string => {
  if (!openTime || !closeTime || !businessDays) {
    return 'Horário não informado';
  }

  return formatBusinessHours(openTime, closeTime, businessDays);
};

export const getStoreLocationLabel = ({
  address,
  city,
  state,
}: Pick<IStore, 'address' | 'city' | 'state'>): string => {
  const region = [city, state].filter(Boolean).join(' - ');
  return [address, region].filter(Boolean).join(', ');
};

export const getStoreImageUrl = (path: string): string => {
  return `${STORE_IMAGES_BASE_URL}/${path}`;
};

export const getProfessionalName = ({ user }: IProfessional): string => {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
};

export const getProfessionalDisplay = (professional: IProfessional) => {
  const { user, createdAt } = professional;
  const name = getProfessionalName(professional);
  const initialsSource = name || user.email;

  return {
    name: name || 'Aguardando sincronização',
    initials: initialsSource
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
    contact: [user.email, user.telephone].filter(Boolean).join(' · '),
    since: createdAt
      ? new Date(createdAt).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })
      : null,
    hasPendingData: !user.firstName || !user.lastName || !user.telephone,
  };
};

export const validateStoreForm = (form: {
  name: string;
  address: string;
  city: string;
  phone: string;
}): boolean => {
  return !!(form.name && form.address && form.city && form.phone);
};

export const validateStaffForm = (form: {
  name: string;
  email: string;
  phone: string;
}): boolean => {
  return !!(form.name && form.email && form.phone);
};
