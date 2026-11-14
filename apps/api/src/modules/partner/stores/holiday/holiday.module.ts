import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { HolidayController } from './holiday.controller';
import { StoreHoliday } from './holiday.entity';
import { HolidayService } from './holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoreHoliday]), StoreGuardsModule],
  providers: [HolidayService],
  controllers: [HolidayController],
  exports: [HolidayService],
})
export class HolidayModule {}
