import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { StoreAccessGuard } from '../guards';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleCancelGuard } from './schedule-cancel.guard';
import { ScheduleService } from './schedule.service';

@Controller('partner/stores/:storeId/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @UseGuards(StoreAccessGuard)
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

  // Sem guard de loja: é por aqui que o cliente agenda no checkout
  @Post()
  async create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') requesterId: string,
    @Body() schedule: CreateSchedulesDto,
  ) {
    return this.scheduleService.createForRequester(
      { ...schedule, store: { id: storeId } },
      requesterId,
    );
  }

  @Put(':id')
  @UseGuards(StoreAccessGuard)
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() schedule: ScheduleDto,
  ) {
    return this.scheduleService.update({
      ...schedule,
      id,
      store: { id: storeId },
    });
  }

  @Delete(':id')
  @UseGuards(ScheduleCancelGuard)
  delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.scheduleService.delete(storeId, id);
  }
}
