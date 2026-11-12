import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  RequireStoreRoles,
  StoreAccessGuard,
  StoreRoleGuard,
} from '../guards';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryService } from './gallery.service';

@Controller('partner/stores/:storeId/gallery')
@UseGuards(StoreAccessGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async findAll(@Param('storeId') storeId: string) {
    return this.galleryService.findAll(storeId);
  }

  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  @Post()
  async create(
    @Param('storeId') storeId: string,
    @Body() galleryDto: CreateGalleryDto,
  ) {
    return this.galleryService.create({
      ...galleryDto,
      store: { id: storeId },
    });
  }

  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  @Patch(':id')
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() image: UpdateGalleryDto,
  ) {
    return await this.galleryService.updateMainImage({
      ...image,
      id,
      store: { id: storeId },
    });
  }

  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  @Delete(':id')
  async delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return await this.galleryService.delete(storeId, id);
  }
}
