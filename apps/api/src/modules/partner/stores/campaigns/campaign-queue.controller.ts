import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Receiver } from '@upstash/qstash';
import { CAMPAIGN_MESSAGE_PATH } from './campaigns.helpers';
import { CampaignsService } from './campaigns.service';
import type { TCampaignMessageJob } from './campaigns.types';

/**
 * Entrada do QStash, fora de /partner e sem JWT: vale a assinatura
 * `Upstash-Signature` sobre o corpo cru (o `main.ts` não parseia `/queue`).
 */
@Controller()
export class CampaignQueueController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly configService: ConfigService,
  ) {}

  @Post(CAMPAIGN_MESSAGE_PATH)
  @HttpCode(200)
  async deliver(
    @Req() request: { body: Buffer | string },
    @Headers('upstash-signature') signature: string,
    @Headers('upstash-retried') retried: string,
  ) {
    const body = Buffer.isBuffer(request.body)
      ? request.body.toString('utf8')
      : String(request.body ?? '');

    await this.verify(signature, body);

    return this.campaignsService.deliver(
      JSON.parse(body) as TCampaignMessageJob,
      Number(retried) || 0,
    );
  }

  private async verify(signature: string, body: string) {
    const receiver = new Receiver({
      currentSigningKey: this.configService.get('QSTASH_CURRENT_SIGNING_KEY'),
      nextSigningKey: this.configService.get('QSTASH_NEXT_SIGNING_KEY'),
      // Nunca aceitar as chaves públicas do servidor local do QStash
      devMode: false,
    });
    const apiUrl = this.configService
      .get<string>('API_PUBLIC_URL')
      ?.replace(/\/$/, '');

    try {
      await receiver.verify({
        signature,
        body,
        url: `${apiUrl}${CAMPAIGN_MESSAGE_PATH}`,
      });
    } catch {
      throw new UnauthorizedException('Invalid QStash signature');
    }
  }
}
