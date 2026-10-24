import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('partner/stores/:storeId/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /** Public booking availability — no customer PII. */
  @Public()
  @Get('availability')
  findAvailability(@Param('storeId') storeId: string) {
    return this.scheduleService.findAvailability(storeId);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.scheduleService.findAll(storeId);
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
