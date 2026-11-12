import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TStoreActor } from './store-guards.types';

/** Papel e cadastro na equipe que `StoreAccessGuard`/`StoreRoleGuard` gravaram. */
export const StoreActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TStoreActor => {
    const request = context.switchToHttp().getRequest();

    return {
      role: request.storeMemberRole,
      storeMemberId: request.storeMember?.id,
    };
  },
);
