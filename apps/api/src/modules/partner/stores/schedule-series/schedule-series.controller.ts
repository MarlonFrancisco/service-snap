import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { StoreAccessGuard } from '../guards';
import {
  CancelScheduleSeriesDto,
  CreateScheduleSeriesDto,
} from './dto/schedule-series.dto';
import { ScheduleSeriesService } from './schedule-series.service';

/** Só a equipe da loja cria e cancela séries; o cliente não. */
@Controller('partner/stores/:storeId/schedule-series')
@UseGuards(StoreAccessGuard)
export class ScheduleSeriesController {
  constructor(private readonly seriesService: ScheduleSeriesService) {}

  @Post()
  create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateScheduleSeriesDto,
  ) {
    return this.seriesService.create(storeId, dto, userId);
  }

  @Get(':id')
  findOne(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.seriesService.findOne(storeId, id);
  }

  @Post(':id/cancel')
  cancel(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CancelScheduleSeriesDto,
  ) {
    return this.seriesService.cancel(storeId, id, dto, userId);
  }
}
