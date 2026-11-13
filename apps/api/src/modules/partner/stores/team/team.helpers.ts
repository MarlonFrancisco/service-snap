import { ForbiddenException } from '@nestjs/common';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import type { TTeamInviteEmail } from '../../../notification/notification.types';
import type { User } from '../../../users/user.entity';
import type { TStoreActor } from '../guards/store-guards.types';
import type { StoreMember } from '../store-member/store-member.entity';

const ROLE_LABEL: Record<StoreMember['role'], string> = {
  owner: 'sócio',
  manager: 'gerente',
  professional: 'profissional',
};

/** Só o dono da loja dá o papel de sócio; gerente adiciona gerente e profissional. */
export function assertCanGrantRole(
  actor: TStoreActor,
  role: StoreMember['role'] | undefined,
) {
  if (role === 'owner' && actor.role !== 'owner') {
    throw new ForbiddenException('Only the store owner can add another owner');
  }
}

export const buildTeamInviteData = (
  member: StoreMember,
  inviter: Pick<User, 'firstName' | 'lastName' | 'email'> | null,
  isNewAccount: boolean,
  frontendUrl: string,
): TTeamInviteEmail => ({
  storeName: member.store?.name || 'a loja',
  roleLabel: ROLE_LABEL[member.role] ?? ROLE_LABEL.professional,
  inviterName:
    (inviter && (getUserFullName(inviter) || inviter.email)) || 'A loja',
  isNewAccount,
  email: member.user?.email,
  accessLink: `${frontendUrl}/partner/agenda`,
});
