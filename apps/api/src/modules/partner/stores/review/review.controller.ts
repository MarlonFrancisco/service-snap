import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { ReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

// Avaliações são do cliente, não da loja: sem guard de loja, o autor vem do JWT
@Controller('partner/stores/:storeId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(
    @Param('storeId') storeId: string,
    @CurrentUser('sub') userId: string,
    @Body() review: ReviewDto,
  ) {
    return this.reviewService.create(
      plainToInstance(ReviewDto, {
        ...review,
        store: { id: storeId },
        user: { id: userId },
      }),
    );
  }

  @Public()
  @Get()
  async findAll(@Param('storeId') storeId: string) {
    return this.reviewService.findAll(storeId);
  }

  @Get(':id')
  async findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.reviewService.findOneInStore(storeId, id);
  }

  @Put(':id')
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() review: ReviewDto,
  ) {
    return this.reviewService.update(storeId, id, userId, review);
  }

  @Delete(':id')
  async delete(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.reviewService.delete(storeId, id, userId);
  }
}
