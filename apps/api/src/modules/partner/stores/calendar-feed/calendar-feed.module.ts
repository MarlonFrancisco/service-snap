import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Schedule } from '../schedule/schedule.entity';
import { StoreMember } from '../store-member/store-member.entity';
import {
  CalendarFeedController,
  PublicCalendarController,
} from './calendar-feed.controller';
import { CalendarFeed } from './calendar-feed.entity';
import { CalendarFeedService } from './calendar-feed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarFeed, StoreMember, Schedule]),
    StoreGuardsModule,
  ],
  controllers: [CalendarFeedController, PublicCalendarController],
  providers: [CalendarFeedService],
})
export class CalendarFeedModule {}
