import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequireStoreRoles, StoreAccessGuard, StoreRoleGuard } from '../guards';
import { CreateHolidayDto, HolidayQueryDto } from './holiday.dto';
import { HolidayService } from './holiday.service';

@Controller('partner/stores/:storeId/holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  // A equipe toda vê os dias fechados na agenda
  @Get()
  @UseGuards(StoreAccessGuard)
  findAll(@Param('storeId') storeId: string, @Query() query: HolidayQueryDto) {
    return this.holidayService.findAll(storeId, query);
  }

  @Post()
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  create(@Param('storeId') storeId: string, @Body() body: CreateHolidayDto) {
    return this.holidayService.create(storeId, body);
  }

  @Delete(':id')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.holidayService.delete(storeId, id);
  }
}
