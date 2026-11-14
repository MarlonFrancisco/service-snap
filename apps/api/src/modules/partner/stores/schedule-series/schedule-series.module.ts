import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { Store } from '../store.entity';
import { ScheduleSeriesController } from './schedule-series.controller';
import { ScheduleSeries, ScheduleSeriesItem } from './schedule-series.entity';
import { ScheduleSeriesService } from './schedule-series.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleSeries, ScheduleSeriesItem, Store]),
    StoreGuardsModule,
    ScheduleModule,
  ],
  controllers: [ScheduleSeriesController],
  providers: [ScheduleSeriesService],
})
export class ScheduleSeriesModule {}
