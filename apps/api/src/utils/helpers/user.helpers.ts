import type { User } from '../../modules/users/user.entity';

export const getUserFullName = (
  user?: Partial<Pick<User, 'firstName' | 'lastName'>>,
): string => [user?.firstName, user?.lastName].filter(Boolean).join(' ');

export const normalizePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return undefined;

  const normalizedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

  return normalizedPhoneNumber.includes('+')
    ? normalizedPhoneNumber
    : `+${normalizedPhoneNumber}`;
};
