import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('partner/stores/:storeId/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.scheduleService.findAll(storeId);
  }

  @Public()
  @Get('availability')
  getAvailability(
    @Param('storeId') storeId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.scheduleService.getAvailability(storeId, query);
  }

  @Post()
  async create(
    @Param('storeId') storeId: string,
    @Body() schedule: CreateSchedulesDto,
  ) {
    return this.scheduleService.create({ ...schedule, store: { id: storeId } });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() schedule: ScheduleDto) {
    return this.scheduleService.update({ ...schedule, id });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }
}
