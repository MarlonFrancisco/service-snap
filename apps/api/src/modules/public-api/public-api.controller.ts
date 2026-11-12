import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityQueryDto } from '../partner/stores/schedule/dto/availability-query.dto';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyStore } from './api-key-store.decorator';
import {
  PublicCreateScheduleDto,
  PublicScheduleQueryDto,
} from './dto/public-schedule.dto';
import { PublicApiService } from './public-api.service';

/**
 * API pública v1. Fora de /partner, então sem JWT: a autenticação é só pela
 * chave da loja (`ssk_...`).
 */
@Controller('v1')
@UseGuards(ApiKeyGuard)
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('store')
  getStore(@ApiKeyStore() storeId: string) {
    return this.publicApiService.getStore(storeId);
  }

  @Get('services')
  listServices(@ApiKeyStore() storeId: string) {
    return this.publicApiService.listServices(storeId);
  }

  @Get('professionals')
  listProfessionals(@ApiKeyStore() storeId: string) {
    return this.publicApiService.listProfessionals(storeId);
  }

  @Get('availability')
  getAvailability(
    @ApiKeyStore() storeId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.publicApiService.getAvailability(storeId, query);
  }

  @Get('schedules')
  listSchedules(
    @ApiKeyStore() storeId: string,
    @Query() query: PublicScheduleQueryDto,
  ) {
    return this.publicApiService.listSchedules(storeId, query);
  }

  @Get('schedules/:id')
  getSchedule(
    @ApiKeyStore() storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.publicApiService.getSchedule(storeId, id);
  }

  @Post('schedules')
  createSchedule(
    @ApiKeyStore() storeId: string,
    @Body() dto: PublicCreateScheduleDto,
  ) {
    return this.publicApiService.createSchedule(storeId, dto);
  }

  @Post('schedules/:id/cancel')
  cancelSchedule(
    @ApiKeyStore() storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.publicApiService.cancelSchedule(storeId, id);
  }
}
