import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../store.entity';
import { StoreMemberModule } from '../store-member/store-member.module';

/**
 * Dependências de `StoreAccessGuard` e `StoreRoleGuard`, para os módulos cujos
 * controllers usam esses guards.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Store]), StoreMemberModule],
  exports: [TypeOrmModule, StoreMemberModule],
})
export class StoreGuardsModule {}
