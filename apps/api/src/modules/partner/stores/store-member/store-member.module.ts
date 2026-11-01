import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../../subscription/subscription.entity';
import { UsersModule } from '../../../users';
import { Service } from '../category/service/service.entity';
import { Store } from '../store.entity';
import { StoreMemberController } from './store-member.controller';
import { StoreMember } from './store-member.entity';
import { StoreMemberService } from './store-member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreMember, Subscription, Store, Service]),
    UsersModule,
  ],
  providers: [StoreMemberService],
  exports: [StoreMemberService],
  controllers: [StoreMemberController],
})
export class StoreMemberModule {}
