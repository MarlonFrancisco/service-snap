import type { StoreMember } from './store-member.entity';

/** Membro recém-adicionado e se a conta dele nasceu agora, pelo convite. */
export type TCreatedMember = {
  member: StoreMember;
  isNewAccount: boolean;
};
