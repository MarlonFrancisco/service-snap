import type { StoreMember } from '../store-member/store-member.entity';

/**
 * Quem age na loja, como os guards deixaram no request. Sem `role` é alguém de
 * fora da equipe (o cliente dono do agendamento).
 */
export type TStoreActor = {
  role?: StoreMember['role'];
  /** Cadastro na equipe; o dono pode não ter. */
  storeMemberId?: string;
};
