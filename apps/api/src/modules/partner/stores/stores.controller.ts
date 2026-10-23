import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreOwnerGuard } from './guards';
import { StoresService } from './stores.services';

@Controller('partner/stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async getStores(@CurrentUser('sub') userId: string) {
    return this.storesService.findAll(userId, {
      relations: ['gallery'],
    });
  }

  @Public()
  @Get(':id')
  async getStore(@Param('id') id: string) {
    // Public booking only needs member-scoped schedules/blockedTimes.
    // Top-level `schedules` duplicated the full history and inflated payload.
    return this.storesService.findOne(id, {
      relations: [
        'gallery',
        'storeMembers',
        'storeMembers.user',
        'storeMembers.services',
        'storeMembers.blockedTimes',
        'storeMembers.schedules',
        'services',
        'services.category',
        'reviews',
      ],
    });
  }

  @Post()
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.storesService.create(
      plainToInstance(CreateStoreDto, {
        ...createStoreDto,
        owner: { id: userId },
      }),
    );
  }

  @Put(':id')
  @UseGuards(StoreOwnerGuard)
  async updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(
      id,
      plainToInstance(UpdateStoreDto, updateStoreDto),
    );
  }

  @Delete(':id')
  @UseGuards(StoreOwnerGuard)
  async deleteStore(@Param('id') id: string) {
    await this.storesService.delete(id);
    return { id };
  }
}
