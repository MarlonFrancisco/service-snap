import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../../auth/decorators/public.decorator';
import { StoreAccessGuard } from '../guards';
import type { StoreMember } from '../store-member/store-member.entity';
import { CalendarFeedService } from './calendar-feed.service';

type TStoreRequest = Request & {
  storeMemberRole?: string;
  storeMember?: StoreMember;
};

const toRequester = (request: TStoreRequest) => ({
  role: request.storeMemberRole,
  memberId: request.storeMember?.id,
});

/** Link da agenda de um profissional no painel. */
@Controller('partner/stores/:storeId/members/:memberId/calendar-feed')
@UseGuards(StoreAccessGuard)
export class CalendarFeedController {
  constructor(private readonly calendarFeedService: CalendarFeedService) {}

  @Get()
  async get(
    @Param('storeId') storeId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() request: TStoreRequest,
  ) {
    await this.calendarFeedService.assertCanManage(
      storeId,
      memberId,
      toRequester(request),
    );

    return this.calendarFeedService.get(memberId);
  }

  /** Cria o link, ou troca por um novo se o antigo vazou. */
  @Post()
  async rotate(
    @Param('storeId') storeId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() request: TStoreRequest,
  ) {
    const member = await this.calendarFeedService.assertCanManage(
      storeId,
      memberId,
      toRequester(request),
    );

    return this.calendarFeedService.rotate(member);
  }

  @Delete()
  async revoke(
    @Param('storeId') storeId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() request: TStoreRequest,
  ) {
    await this.calendarFeedService.assertCanManage(
      storeId,
      memberId,
      toRequester(request),
    );

    return this.calendarFeedService.revoke(memberId);
  }
}

/**
 * O que o Google Agenda busca. Público porque o calendário não faz login: o
 * token comprido no endereço é a única chave.
 */
@Controller('calendar')
export class PublicCalendarController {
  constructor(private readonly calendarFeedService: CalendarFeedService) {}

  @Public()
  @Get(':file')
  async feed(@Param('file') file: string, @Res() response: Response) {
    const token = file.replace(/\.ics$/, '');
    const ics = token && (await this.calendarFeedService.renderIcs(token));

    if (!ics) throw new NotFoundException('Calendar not found');

    response
      .status(200)
      .type('text/calendar; charset=utf-8')
      .setHeader('Cache-Control', 'private, max-age=300')
      .setHeader('Content-Disposition', 'inline; filename="agenda.ics"')
      .send(ics);
  }
}
