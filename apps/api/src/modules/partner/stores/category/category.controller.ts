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
import { StoreAccessGuard } from '../guards';
import { CategoryDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('partner/stores/:storeId/categories')
@UseGuards(StoreAccessGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Param('storeId') storeId: string) {
    return this.categoryService.findAll(storeId);
  }

  @Get(':id')
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoryService.findOne(storeId, id);
  }

  @Post()
  async create(
    @Param('storeId') storeId: string,
    @Body() category: CategoryDto,
  ) {
    return this.categoryService.create(
      plainToInstance(CategoryDto, { ...category, store: { id: storeId } }),
    );
  }

  @Put(':id')
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() category: CategoryDto,
  ) {
    return this.categoryService.update(
      plainToInstance(CategoryDto, { ...category, id, store: { id: storeId } }),
    );
  }

  @Delete(':id')
  async delete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoryService.delete(storeId, id);
  }
}
