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
import { StoreAccessGuard } from '../../guards';
import { ServiceDto } from './service.dto';
import { ServiceService } from './service.service';

@Controller('partner/stores/:storeId/categories/:categoryId/services')
@UseGuards(StoreAccessGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async findAll(@Param('storeId') storeId: string) {
    return this.serviceService.findAll(storeId);
  }

  @Get(':id')
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.serviceService.findOneInStore(storeId, id);
  }

  @Post()
  async create(
    @Param('storeId') storeId: string,
    @Param('categoryId') categoryId: string,
    @Body() service: ServiceDto,
  ) {
    return this.serviceService.create(
      plainToInstance(ServiceDto, {
        ...service,
        store: { id: storeId },
        category: { id: categoryId },
      }),
    );
  }

  @Put(':id')
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
    @Body() service: ServiceDto,
  ) {
    return this.serviceService.update(
      plainToInstance(ServiceDto, {
        ...service,
        id,
        store: { id: storeId },
        category: { id: categoryId },
      }),
    );
  }

  @Delete(':id')
  async delete(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    await this.serviceService.delete(storeId, id);
    return { id, category: { id: categoryId } };
  }
}
