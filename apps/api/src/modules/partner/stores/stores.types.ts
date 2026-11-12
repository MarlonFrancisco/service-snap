import type { StoreMember } from './store-member/store-member.entity';
import type { Store } from './store.entity';

/** Loja na lista do painel, com o papel de quem pediu (dono ou da equipe). */
export type TStoreWithRole = Store & { memberRole: StoreMember['role'] };
