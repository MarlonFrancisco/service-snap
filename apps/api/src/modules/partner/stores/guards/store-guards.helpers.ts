import { ForbiddenException } from '@nestjs/common';
import type { TStoreActor } from './store-guards.types';

export const isProfessionalOnly = (actor?: TStoreActor | null) =>
  actor?.role === 'professional';

/** Profissional só mexe na própria agenda; dono e gerente, em qualquer uma. */
export function assertOwnAgenda(
  actor: TStoreActor | null | undefined,
  ...storeMemberIds: (string | undefined)[]
) {
  if (!isProfessionalOnly(actor)) return;

  if (storeMemberIds.some((id) => id !== actor.storeMemberId)) {
    throw new ForbiddenException(
      'Professionals can only manage their own agenda',
    );
  }
}
