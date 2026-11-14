import type { IProfessional, TProfessionalRole } from '@/types/api/users.types';
import { MANAGER_ROLES } from './calendar-feed-module.constants';
import type { TCalendarMemberOption } from './calendar-feed-module.types';

export const getMemberName = ({ user }: IProfessional) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.email ||
  'Profissional';

const isManagerRole = (role?: TProfessionalRole) =>
  MANAGER_ROLES.some((managerRole) => managerRole === role);

/**
 * Profissional vê só a própria agenda. Dono e gerente escolhem entre os ativos;
 * sem vínculo na loja, a API decide o acesso.
 */
export const getMemberOptions = (
  members: IProfessional[],
  currentMember?: IProfessional,
): TCalendarMemberOption[] => {
  if (currentMember && !isManagerRole(currentMember.role)) {
    return [{ id: currentMember.id, name: getMemberName(currentMember) }];
  }

  return members
    .filter((member) => member.isActive)
    .map((member) => ({ id: member.id, name: getMemberName(member) }));
};

export const canChooseMember = (currentMember?: IProfessional) =>
  !currentMember || isManagerRole(currentMember.role);

/** O próprio membro, se estiver na lista; senão o primeiro. */
export const getDefaultMemberId = (
  options: TCalendarMemberOption[],
  currentMember?: IProfessional,
) =>
  options.find((option) => option.id === currentMember?.id)?.id ??
  options[0]?.id ??
  '';
