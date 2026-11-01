import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../../guards/store-guards.module';
import { StoreMember } from '../store-member.entity';
import { BlockedTimeController } from './blocked-time.controller';
import { BlockedTime } from './blocked-time.entity';
import { BlockedTimeService } from './blocked-time.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockedTime, StoreMember]),
    StoreGuardsModule,
  ],
  providers: [BlockedTimeService],
  controllers: [BlockedTimeController],
  exports: [BlockedTimeService],
})
export class BlockedTimeModule {}
