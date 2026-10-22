import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import Stripe from 'stripe';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current-plan')
  @UseGuards(JwtAuthGuard)
  async getCurrentPlan(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.getCurrentPlan(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { priceId: string; currency?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subscriptionService.create(
      user.sub,
      body.priceId,
      user.paymentCustomerId,
      body.currency,
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async cancel(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.cancel(user.sub);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() body: { cancelAtPeriodEnd: boolean },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subscriptionService.update(user.sub, body.cancelAtPeriodEnd);
  }

  @Post('webhook')
  async webhook(
    @Body() body: Stripe.Event,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.subscriptionService.webhook(body, signature);
  }
}
