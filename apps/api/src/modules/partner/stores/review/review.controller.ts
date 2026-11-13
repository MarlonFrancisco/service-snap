import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import { RequireStoreRoles, StoreRoleGuard } from '../guards';
import { ReviewDto, ReviewReplyDto } from './dto/review.dto';
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
  async findAll(
    @Param('storeId') storeId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reviewService.findAll(storeId, query);
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

  /** Resposta pública da loja; só dono e gerente respondem em nome dela. */
  @Put(':id/reply')
  @RequireStoreRoles('owner', 'manager')
  @UseGuards(StoreRoleGuard)
  async reply(
    @Param('storeId') storeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { reply }: ReviewReplyDto,
  ) {
    return this.reviewService.reply(storeId, id, reply);
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
