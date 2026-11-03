import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../../subscription/subscription.entity';
import { Store } from '../store.entity';
import { StoreMemberModule } from '../store-member/store-member.module';

/**
 * Dependências de `StoreAccessGuard`, `StoreRoleGuard` e `PlanFeatureGuard`, para
 * os módulos cujos controllers usam esses guards.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Store, Subscription]), StoreMemberModule],
  exports: [TypeOrmModule, StoreMemberModule],
})
export class StoreGuardsModule {}
