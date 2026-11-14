import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PushSubscriptionDto,
  PushUnsubscribeDto,
} from './dto/push-subscription.dto';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Public()
  @Get('public-key')
  getPublicKey() {
    return this.pushService.getPublicKey();
  }

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async subscribe(
    @CurrentUser('sub') userId: string,
    @Body() dto: PushSubscriptionDto,
  ) {
    await this.pushService.subscribe(userId, dto);
  }

  @Delete('subscriptions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async unsubscribe(
    @CurrentUser('sub') userId: string,
    @Body() { endpoint }: PushUnsubscribeDto,
  ) {
    await this.pushService.unsubscribe(userId, endpoint);
  }
}
