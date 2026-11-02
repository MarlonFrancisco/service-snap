import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { formatCurrency } from '../../utils/helpers/format.helpers';
import {
  formatLongDate,
  getStoreNow,
  timeToMinutes,
  toDateKey,
} from '../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../utils/helpers/user.helpers';
import {
  WHATSAPP_LIMITS,
  addDays,
  describeDay,
  formatDuration,
  formatShortDate,
  groupIntoSections,
  isClosedDay,
  normalizeText,
  paginate,
  parseTypedTime,
  periodOfDay,
  truncate,
} from '../../utils/helpers/whatsapp.helpers';
import { CategoryService } from '../partner/stores/category/category.service';
import { ScheduleService } from '../partner/stores/schedule/schedule.service';
import { StoreMemberService } from '../partner/stores/store-member/store-member.service';
import { WhatsappConfig } from '../partner/stores/whatsapp/whatsapp.entity';
import { WhatsappService } from '../partner/stores/whatsapp/whatsapp.service';
import {
  BotState,
  IBotAppointment,
  IBotInput,
  IBotSession,
  IWhatsappWebhook,
  IWhatsappWebhookMessage,
  TBotCommand,
} from './whatsapp-bot.types';

export { BotState } from './whatsapp-bot.types';

// cache-manager v5+ usa milissegundos
const SESSION_TTL_MS = 15 * 60 * 1000;
// A Meta reenvia o webhook quando a resposta demora: a mesma mensagem não pode
// andar o fluxo duas vezes
const MESSAGE_DEDUP_TTL_MS = 60 * 60 * 1000;
// Quantos dias à frente procurar vaga, e quantos consultar de uma vez
const DAY_SEARCH_HORIZON = 60;
const DAY_SEARCH_BATCH = 7;
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const FOOTER = 'Envie "voltar" ou "menu" quando quiser';
const LIST_BUTTON = 'Ver opções';

const GREETINGS = [
  'oi',
  'ola',
  'oie',
  'menu',
  'inicio',
  'comecar',
  'bom dia',
  'boa tarde',
  'boa noite',
  'hello',
  'hi',
];
const EXIT_WORDS = ['sair', 'cancelar', 'parar', 'encerrar', 'tchau'];

/** Uma conversa: a loja do número que recebeu, quem escreveu e onde parou. */
interface IBotContext {
  config: WhatsappConfig;
  from: string;
  userName: string;
  session: IBotSession;
}

@Injectable()
export class WhatsappBotService {
  private readonly logger = new Logger(WhatsappBotService.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly categoryService: CategoryService,
    private readonly storeMemberService: StoreMemberService,
    private readonly scheduleService: ScheduleService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async handleWebhookMessage(body: IWhatsappWebhook) {
    if (body?.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const { id, status, errors } of change.value?.statuses ?? []) {
          const statusLog = JSON.stringify({ id, status, errors });

          if (status === 'failed') {
            this.logger.warn(`Message status: ${statusLog}`);
          } else {
            this.logger.log(`Message status: ${statusLog}`);
          }
        }

        const message = change.value?.messages?.[0];
        if (!message) continue;

        const phoneNumberId = change.value.metadata.phone_number_id;
        const userName = change.value.contacts?.[0]?.profile?.name ?? '';

        const config = await this.whatsappService.findOne({ phoneNumberId });

        if (!config?.isActive || !config.store?.id) {
          this.logger.warn(
            `No active config for phone number ${phoneNumberId}`,
          );
          continue;
        }

        await this.handleIncomingMessage(config, message, userName);
      }
    }
  }

  /**
   * A configuração vem por parâmetro, não guardada na instância: o serviço é
   * único e atende várias lojas ao mesmo tempo.
   */
  async handleIncomingMessage(
    config: WhatsappConfig,
    message: IWhatsappWebhookMessage,
    userName: string,
  ) {
    const input = this.parseInput(message);
    if (!input) return;

    if (message.id && (await this.isDuplicate(config, message.id))) {
      this.logger.log(`Ignoring repeated message ${message.id}`);
      return;
    }

    const stored = await this.cacheManager.get<IBotSession>(
      this.sessionKey(config, message.from),
    );
    // Sessões do formato antigo guardavam só o nome do estado
    const session =
      stored && typeof stored === 'object' ? stored : { state: BotState.MENU };
    const ctx: IBotContext = { config, from: message.from, userName, session };

    this.logger.log(`Message from ${ctx.from} in state ${session.state}`);

    try {
      await this.route(ctx, input, !!stored);
    } catch (error) {
      this.logger.error('Failed to handle WhatsApp message', error);
      await this.clearSession(ctx);
      await this.sendText(
        ctx,
        'Tivemos um problema para continuar 😕\nTente de novo em instantes ou envie *menu* para recomeçar.',
      ).catch(() => undefined);
    }
  }

  // ---------------------------------------------------------------------------
  // Roteamento
  // ---------------------------------------------------------------------------

  private async route(ctx: IBotContext, input: IBotInput, hasSession: boolean) {
    // Com um agendamento aberto, "cancelar" é cancelar ele, não sair da conversa
    if (
      ctx.session.state === BotState.APPOINTMENT_ACTIONS &&
      normalizeText(input.text) === 'cancelar'
    ) {
      return this.enterConfirmCancel(ctx);
    }

    if (input.command) return this.runCommand(ctx, input.command);

    // Opção tocada numa lista de antes da sessão expirar
    if (input.reply && !hasSession && !input.reply.startsWith('menu:')) {
      await this.sendText(ctx, 'Essa opção expirou. Vamos recomeçar 🙂');
      return this.enterMenu(ctx);
    }

    switch (ctx.session.state) {
      case BotState.MENU:
        return this.onMenu(ctx, input);
      case BotState.SELECT_SERVICE:
        return this.onService(ctx, input);
      case BotState.SELECT_PROFESSIONAL:
        return this.onProfessional(ctx, input);
      case BotState.SELECT_DAY:
        return this.onDay(ctx, input);
      case BotState.SELECT_TIME:
        return this.onTime(ctx, input);
      case BotState.CONFIRM_BOOKING:
        return this.onConfirm(ctx, input);
      case BotState.MY_APPOINTMENTS:
        return this.onAppointment(ctx, input);
      case BotState.APPOINTMENT_ACTIONS:
        return this.onAppointmentAction(ctx, input);
      case BotState.CONFIRM_CANCEL:
        return this.onConfirmCancel(ctx, input);
      default:
        return this.enterMenu(ctx);
    }
  }

  private async runCommand(ctx: IBotContext, command: TBotCommand) {
    switch (command) {
      case 'menu':
        await this.clearSession(ctx);
        return this.enterMenu(ctx);
      case 'exit':
        await this.clearSession(ctx);
        return this.sendText(
          ctx,
          'Tudo bem! Quando quiser marcar um horário, é só mandar *oi* 👋',
        );
      case 'book':
        await this.clearSession(ctx);
        return this.enterServices(ctx);
      case 'appointments':
        await this.clearSession(ctx);
        return this.enterAppointments(ctx);
      case 'back':
        return this.goBack(ctx);
    }
  }

  private async goBack(ctx: IBotContext) {
    const { session } = ctx;
    const rescheduling = !!session.rescheduleId;

    switch (session.state) {
      case BotState.SELECT_PROFESSIONAL:
        return rescheduling
          ? this.enterAppointmentActions(ctx)
          : this.enterServices(ctx);
      case BotState.SELECT_DAY:
        if (!session.professionalSkipped) return this.enterProfessionals(ctx);
        return rescheduling
          ? this.enterAppointmentActions(ctx)
          : this.enterServices(ctx);
      case BotState.SELECT_TIME:
        return this.enterDays(ctx);
      case BotState.CONFIRM_BOOKING:
        return this.enterTimes(ctx);
      case BotState.APPOINTMENT_ACTIONS:
        return this.enterAppointments(ctx);
      case BotState.CONFIRM_CANCEL:
        return this.enterAppointmentActions(ctx);
      default:
        await this.clearSession(ctx);
        return this.enterMenu(ctx);
    }
  }

  /** Resposta que não serve para a etapa: explica e mostra a etapa de novo. */
  private async repeatStep(ctx: IBotContext, hint: string) {
    await this.sendText(ctx, hint);

    const offset = ctx.session.offset ?? 0;

    switch (ctx.session.state) {
      case BotState.SELECT_SERVICE:
        return this.enterServices(ctx, offset);
      case BotState.SELECT_PROFESSIONAL:
        return this.enterProfessionals(ctx, offset);
      case BotState.SELECT_DAY:
        return this.enterDays(ctx);
      case BotState.SELECT_TIME:
        return this.enterTimes(ctx, { offset, refresh: false });
      case BotState.CONFIRM_BOOKING:
        return this.enterConfirm(ctx);
      case BotState.MY_APPOINTMENTS:
        return this.enterAppointments(ctx);
      case BotState.APPOINTMENT_ACTIONS:
        return this.enterAppointmentActions(ctx);
      case BotState.CONFIRM_CANCEL:
        return this.enterConfirmCancel(ctx);
      default:
        return this.enterMenu(ctx);
    }
  }

  private readonly tapHint = `Toque em *${LIST_BUTTON}* e escolha uma das opções 👇`;

  // ---------------------------------------------------------------------------
  // Menu
  // ---------------------------------------------------------------------------

  private async enterMenu(ctx: IBotContext) {
    const firstName = ctx.userName.trim().split(/\s+/)[0];
    const storeName = ctx.config.store.name;

    const greeting =
      `Olá${firstName ? `, ${firstName}` : ''}! 👋\n` +
      (storeName ? `Aqui é o atendimento da *${storeName}*.\n` : '') +
      `\nComo posso ajudar?`;

    await this.saveSession(ctx, { state: BotState.MENU });
    await this.sendButtons(ctx, greeting, [
      { id: 'menu:book', title: '📅 Agendar' },
      { id: 'menu:appointments', title: '📋 Meus agendamentos' },
    ]);
  }

  private async onMenu(ctx: IBotContext, input: IBotInput) {
    if (input.reply === 'menu:book') return this.enterServices(ctx);
    if (input.reply === 'menu:appointments') return this.enterAppointments(ctx);

    return this.enterMenu(ctx);
  }

  // ---------------------------------------------------------------------------
  // Serviço
  // ---------------------------------------------------------------------------

  /** Serviços ativos da loja, na ordem das categorias. */
  private async findServices(ctx: IBotContext) {
    const categories = await this.categoryService.findAll(ctx.config.store.id);

    return categories.flatMap((category) =>
      (category.services ?? [])
        .filter((service) => service.isActive !== false)
        .map((service) => ({ ...service, categoryName: category.name })),
    );
  }

  private async enterServices(ctx: IBotContext, offset = 0) {
    const services = await this.findServices(ctx);

    if (services.length === 0) {
      await this.clearSession(ctx);
      return this.sendText(
        ctx,
        'No momento não há serviços disponíveis para agendar por aqui. 😕',
      );
    }

    const page = paginate(services, offset, WHATSAPP_LIMITS.listRows);
    const sections = groupIntoSections(
      page.items,
      (service) => service.categoryName || 'Serviços',
      (service) => ({
        id: `svc:${service.id}`,
        title: truncate(service.name, WHATSAPP_LIMITS.rowTitle),
        description: truncate(
          [
            formatDuration(service.duration),
            service.price ? formatCurrency(service.price) : '',
          ]
            .filter(Boolean)
            .join(' · ') || service.description,
          WHATSAPP_LIMITS.rowDescription,
        ),
      }),
    );

    if (page.hasMore) {
      sections.push({
        title: 'Mais opções',
        rows: [
          { id: `svc:more:${page.nextOffset}`, title: '➕ Ver mais serviços' },
        ],
      });
    }

    // `offset` é o desta página, para repetir a mesma quando a resposta não serve
    await this.saveSession(ctx, { state: BotState.SELECT_SERVICE, offset });

    await this.sendList(ctx, {
      header: 'Qual serviço você quer?',
      body: 'Escolha o serviço para ver os profissionais e horários livres.',
      sections,
    });
  }

  private async onService(ctx: IBotContext, input: IBotInput) {
    const value = this.replyValue(input, 'svc');
    if (!value) return this.repeatStep(ctx, this.tapHint);

    if (value.startsWith('more:')) {
      return this.enterServices(ctx, Number(value.slice(5)) || 0);
    }

    // Procura entre os da loja: um id de outra loja não pode entrar na agenda
    const service = (await this.findServices(ctx)).find((s) => s.id === value);

    if (!service) {
      return this.repeatStep(
        ctx,
        'Esse serviço não está mais disponível. Escolha outro, por favor.',
      );
    }

    ctx.session.service = {
      id: service.id,
      name: service.name,
      duration: service.duration,
      price: service.price,
    };

    return this.enterProfessionals(ctx);
  }

  // ---------------------------------------------------------------------------
  // Profissional
  // ---------------------------------------------------------------------------

  private async enterProfessionals(ctx: IBotContext, offset = 0) {
    const { service } = ctx.session;
    if (!service) return this.expired(ctx);

    const members = await this.storeMemberService.findStoreMembers(
      ctx.config.store.id,
    );
    // Mesmo filtro da disponibilidade: só profissional ativo que faz o serviço
    const professionals = members
      .filter(
        (member) =>
          !member.isDeleted &&
          (!member.role || member.role === 'professional') &&
          member.services?.some((s) => s.id === service.id),
      )
      .map((member) => ({ id: member.id, name: getUserFullName(member.user) }));

    if (professionals.length === 0) {
      await this.sendText(
        ctx,
        `Nenhum profissional atende *${service.name}* no momento. Escolha outro serviço, por favor.`,
      );
      return this.enterServices(ctx);
    }

    ctx.session.professionals = professionals;

    if (professionals.length === 1) {
      ctx.session.professionalId = professionals[0].id;
      ctx.session.professionalSkipped = true;
      return this.enterDays(ctx);
    }

    ctx.session.professionalSkipped = false;

    // "Qualquer profissional" ocupa uma linha na primeira página
    const capacity =
      offset === 0 ? WHATSAPP_LIMITS.listRows - 1 : WHATSAPP_LIMITS.listRows;
    const page = paginate(professionals, offset, capacity);
    const rows: { id: string; title: string; description?: string }[] =
      page.items.map((person) => ({
        id: `pro:${person.id}`,
        title: truncate(person.name, WHATSAPP_LIMITS.rowTitle),
      }));

    if (offset === 0) {
      rows.unshift({
        id: 'pro:any',
        title: '⚡ Qualquer profissional',
        description: 'Mostra todos os horários livres',
      });
    }

    if (page.hasMore) {
      rows.push({ id: `pro:more:${page.nextOffset}`, title: '➕ Ver mais' });
    }

    await this.saveSession(ctx, {
      ...ctx.session,
      state: BotState.SELECT_PROFESSIONAL,
      offset,
    });

    await this.sendList(ctx, {
      header: 'Com quem você prefere?',
      body: `*${service.name}*\nEscolha o profissional ou deixe a gente encontrar o primeiro horário livre.`,
      sections: [{ title: 'Profissionais', rows }],
    });
  }

  private async onProfessional(ctx: IBotContext, input: IBotInput) {
    const professionals = ctx.session.professionals ?? [];
    const value = this.replyValue(input, 'pro');

    if (value?.startsWith('more:')) {
      return this.enterProfessionals(ctx, Number(value.slice(5)) || 0);
    }

    if (value === 'any') {
      ctx.session.professionalId = null;
      return this.enterDays(ctx);
    }

    if (!value || !professionals.some((person) => person.id === value)) {
      return this.repeatStep(ctx, this.tapHint);
    }

    ctx.session.professionalId = value;
    return this.enterDays(ctx);
  }

  // ---------------------------------------------------------------------------
  // Dia
  // ---------------------------------------------------------------------------

  private async enterDays(ctx: IBotContext, from?: string) {
    const { service } = ctx.session;
    if (!service || ctx.session.professionalId === undefined) {
      return this.expired(ctx);
    }

    const today = this.today(ctx);
    const start = from ?? today;
    const days = await this.findDaysWithSlots(ctx, start, today);

    if (days.length === 0) {
      await this.sendText(
        ctx,
        from
          ? 'Não encontrei mais datas com horário livre. Escolha uma das anteriores 👇'
          : `Não há horários livres nos próximos ${DAY_SEARCH_HORIZON} dias para essa escolha. 😕`,
      );

      if (from) return this.enterDays(ctx);
      if (!ctx.session.professionalSkipped) return this.enterProfessionals(ctx);
      return this.enterServices(ctx);
    }

    const hasMore = days.length === WHATSAPP_LIMITS.listRows;
    const visible = hasMore ? days.slice(0, -1) : days;
    const rows: { id: string; title: string; description?: string }[] =
      visible.map((day) => ({
        id: `day:${day.date}`,
        title: formatShortDate(day.date),
        description: describeDay(day.date, today, day.slots),
      }));

    if (hasMore) {
      rows.push({
        id: `day:more:${visible.at(-1).date}`,
        title: '➕ Ver mais datas',
      });
    }

    await this.saveSession(ctx, {
      ...ctx.session,
      state: BotState.SELECT_DAY,
      offset: 0,
    });

    await this.sendList(ctx, {
      header: 'Qual dia fica melhor?',
      body: `*${service.name}*${this.professionalLine(ctx)}\nEstes são os próximos dias com horário livre.`,
      sections: [{ title: 'Datas', rows }],
    });
  }

  /**
   * Procura, a partir de `start`, até uma página de dias com vaga (mais um, para
   * saber se há próxima página). Dias fechados nem chegam a ser consultados.
   */
  private async findDaysWithSlots(
    ctx: IBotContext,
    start: string,
    today: string,
  ) {
    const wanted = WHATSAPP_LIMITS.listRows;
    const limit = addDays(today, DAY_SEARCH_HORIZON);
    const found: { date: string; slots: number }[] = [];
    let cursor = start;

    while (found.length < wanted && cursor <= limit) {
      const batch: string[] = [];

      while (batch.length < DAY_SEARCH_BATCH && cursor <= limit) {
        if (!isClosedDay(cursor, ctx.config.store.businessDays)) {
          batch.push(cursor);
        }
        cursor = addDays(cursor, 1);
      }

      const results = await Promise.all(
        batch.map(async (date) => ({
          date,
          slots: (await this.fetchSlots(ctx, date)).length,
        })),
      );

      found.push(...results.filter((day) => day.slots > 0));
    }

    return found.slice(0, wanted);
  }

  private async onDay(ctx: IBotContext, input: IBotInput) {
    const value = this.replyValue(input, 'day');

    if (value?.startsWith('more:')) {
      return this.enterDays(ctx, addDays(value.slice(5), 1));
    }

    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return this.repeatStep(ctx, this.tapHint);
    }

    ctx.session.date = value;
    return this.enterTimes(ctx);
  }

  // ---------------------------------------------------------------------------
  // Horário
  // ---------------------------------------------------------------------------

  private async enterTimes(
    ctx: IBotContext,
    { offset = 0, refresh = true }: { offset?: number; refresh?: boolean } = {},
  ) {
    const { service, date } = ctx.session;
    if (!service || !date) return this.expired(ctx);

    if (refresh || !ctx.session.slots) {
      ctx.session.slots = await this.fetchSlots(ctx, date);
    }

    const { slots } = ctx.session;

    if (slots.length === 0) {
      await this.sendText(
        ctx,
        'Os horários desse dia acabaram de ser preenchidos. Escolha outro dia, por favor.',
      );
      return this.enterDays(ctx);
    }

    // Uma linha fica sempre para "Outro dia"
    const page = paginate(slots, offset, WHATSAPP_LIMITS.listRows - 1);
    const sections = groupIntoSections(
      page.items,
      (slot) => periodOfDay(slot.time),
      (slot) => ({ id: `time:${slot.time}`, title: slot.time }),
    );
    const extraRows: { id: string; title: string }[] = [];

    if (page.hasMore) {
      extraRows.push({
        id: `time:more:${page.nextOffset}`,
        title: '➕ Mais horários',
      });
    }
    extraRows.push({ id: 'time:days', title: '📅 Escolher outro dia' });
    sections.push({ title: 'Outras opções', rows: extraRows });

    await this.saveSession(ctx, {
      ...ctx.session,
      state: BotState.SELECT_TIME,
      offset,
    });

    await this.sendList(ctx, {
      header: truncate(formatLongDate(date), WHATSAPP_LIMITS.header),
      body: `*${service.name}*${this.professionalLine(ctx)}\nQue horas você prefere?`,
      sections,
    });
  }

  private async onTime(ctx: IBotContext, input: IBotInput) {
    const slots = ctx.session.slots ?? [];
    const value = this.replyValue(input, 'time');

    if (value?.startsWith('more:')) {
      return this.enterTimes(ctx, {
        offset: Number(value.slice(5)) || 0,
        refresh: false,
      });
    }

    if (value === 'days') return this.enterDays(ctx);

    // Também aceita o horário digitado ("14h", "14:30")
    const time = value ?? (input.reply ? null : parseTypedTime(input.text));
    const slot = time && slots.find((s) => s.time === time);

    if (!slot) {
      return this.repeatStep(
        ctx,
        time
          ? `O horário ${time} não está livre nesse dia. Escolha um da lista 👇`
          : this.tapHint,
      );
    }

    ctx.session.slot = slot;
    return this.enterConfirm(ctx);
  }

  // ---------------------------------------------------------------------------
  // Confirmação
  // ---------------------------------------------------------------------------

  private async enterConfirm(ctx: IBotContext) {
    const { service, date, slot } = ctx.session;
    if (!service || !date || !slot) return this.expired(ctx);

    const previous = this.currentAppointment(ctx);
    const lines = [
      previous ? '🔄 *Confira a remarcação*' : '📋 *Confira seu agendamento*',
      '',
      `📌 ${service.name}${service.duration ? ` (${formatDuration(service.duration)})` : ''}`,
      `👤 ${this.professionalName(ctx, slot.memberId)}`,
      `📅 ${formatLongDate(date)}`,
      `🕐 ${slot.time}`,
    ];

    if (service.price) lines.push(`💰 ${formatCurrency(service.price)}`);
    if (previous) {
      lines.push(
        '',
        `Antes: ${formatShortDate(previous.date)} às ${previous.time}`,
      );
    }

    await this.saveSession(ctx, {
      ...ctx.session,
      state: BotState.CONFIRM_BOOKING,
    });

    await this.sendButtons(ctx, lines.join('\n'), [
      { id: 'confirm:yes', title: '✅ Confirmar' },
      { id: 'confirm:change', title: '🕐 Trocar horário' },
      { id: 'confirm:no', title: '❌ Desistir' },
    ]);
  }

  private async onConfirm(ctx: IBotContext, input: IBotInput) {
    const typed = input.reply ? '' : normalizeText(input.text);
    const answer =
      this.replyValue(input, 'confirm') ??
      (['sim', 'confirmar', 'confirmo', 'ok'].includes(typed)
        ? 'yes'
        : ['nao', 'desistir'].includes(typed)
          ? 'no'
          : null);

    if (answer === 'change') return this.enterTimes(ctx);

    if (answer === 'no') {
      await this.clearSession(ctx);
      await this.sendText(ctx, 'Sem problemas, nada foi marcado.');
      return this.enterMenu(ctx);
    }

    if (answer !== 'yes') {
      return this.repeatStep(
        ctx,
        'Toque em *✅ Confirmar* para garantir o horário, ou em *🕐 Trocar horário*.',
      );
    }

    const { service, date, slot } = ctx.session;
    if (!service || !date || !slot) return this.expired(ctx);

    const previous = this.currentAppointment(ctx);

    try {
      if (previous) {
        await this.scheduleService.reschedule(
          ctx.config.store.id,
          previous.id,
          {
            date,
            startTime: slot.time,
            storeMemberId: slot.memberId,
          },
        );
      } else {
        const [firstName, ...lastName] = ctx.userName.trim().split(/\s+/);

        await this.scheduleService.create({
          store: { id: ctx.config.store.id },
          storeMember: { id: slot.memberId },
          services: [{ id: service.id, duration: service.duration }],
          user: {
            telephone: ctx.from,
            firstName: firstName || undefined,
            lastName: lastName.join(' ') || undefined,
          },
          date: date as unknown as Date,
          startTime: slot.time,
          endTime: slot.time,
          notes: '',
          status: 'scheduled',
        });
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        await this.sendText(
          ctx,
          'Ops! Alguém acabou de reservar esse horário 😕 Escolha outro, por favor.',
        );
        return this.enterTimes(ctx);
      }

      throw error;
    }

    await this.clearSession(ctx);

    const store = ctx.config.store;
    const address = [store.address, store.city].filter(Boolean).join(', ');
    const lines = [
      previous ? '✅ *Agendamento remarcado!*' : '✅ *Agendamento confirmado!*',
      '',
      `📌 ${service.name}`,
      `👤 ${this.professionalName(ctx, slot.memberId)}`,
      `📅 ${formatLongDate(date)} às ${slot.time}`,
    ];

    if (address) lines.push(`📍 ${address}`);
    lines.push(
      '',
      'Te esperamos! 😊',
      'Para ver, remarcar ou cancelar, é só mandar *menu*.',
    );

    await this.sendText(ctx, lines.join('\n'));
  }

  // ---------------------------------------------------------------------------
  // Meus agendamentos
  // ---------------------------------------------------------------------------

  private async enterAppointments(ctx: IBotContext) {
    const tz = ctx.config.store.timezone || DEFAULT_TIMEZONE;
    const now = getStoreNow(tz, new Date());
    const schedules = await this.scheduleService.findUpcomingForCustomer(
      ctx.config.store.id,
      ctx.from,
      now.date,
    );

    const appointments: IBotAppointment[] = schedules
      .filter(
        (schedule) =>
          toDateKey(schedule.date) > now.date ||
          timeToMinutes(schedule.startTime) > now.minutes,
      )
      .slice(0, WHATSAPP_LIMITS.listRows)
      .map((schedule) => ({
        id: schedule.id,
        customerId: schedule.user?.id,
        date: toDateKey(schedule.date),
        time: schedule.startTime,
        service: {
          id: schedule.service?.id,
          name: schedule.service?.name ?? 'Atendimento',
          duration: schedule.service?.duration ?? 0,
          price: schedule.service?.price,
        },
        professional: {
          id: schedule.storeMember?.id,
          name: schedule.storeMember?.user
            ? getUserFullName(schedule.storeMember.user)
            : '',
        },
      }));

    if (appointments.length === 0) {
      await this.saveSession(ctx, { state: BotState.MENU });
      return this.sendButtons(
        ctx,
        'Você não tem nenhum agendamento marcado por aqui. Que tal marcar um? 🙂',
        [
          { id: 'menu:book', title: '📅 Agendar' },
          { id: 'menu:home', title: '🏠 Menu' },
        ],
      );
    }

    await this.saveSession(ctx, {
      state: BotState.MY_APPOINTMENTS,
      appointments,
    });

    await this.sendList(ctx, {
      header: 'Seus próximos horários',
      body:
        appointments.length === 1
          ? 'Você tem 1 agendamento. Toque nele para remarcar ou cancelar.'
          : `Você tem ${appointments.length} agendamentos. Toque em um para remarcar ou cancelar.`,
      sections: [
        {
          title: 'Agendamentos',
          rows: appointments.map((appointment) => ({
            id: `appt:${appointment.id}`,
            title: `${formatShortDate(appointment.date)} · ${appointment.time}`,
            description: truncate(
              [appointment.service.name, appointment.professional.name]
                .filter(Boolean)
                .join(' · com '),
              WHATSAPP_LIMITS.rowDescription,
            ),
          })),
        },
      ],
    });
  }

  private async onAppointment(ctx: IBotContext, input: IBotInput) {
    const id = this.replyValue(input, 'appt');
    const appointment = ctx.session.appointments?.find((a) => a.id === id);

    if (!appointment) return this.repeatStep(ctx, this.tapHint);

    ctx.session.appointmentId = appointment.id;
    return this.enterAppointmentActions(ctx);
  }

  private async enterAppointmentActions(ctx: IBotContext) {
    const appointment = this.selectedAppointment(ctx);
    if (!appointment) return this.enterAppointments(ctx);

    await this.saveSession(ctx, {
      state: BotState.APPOINTMENT_ACTIONS,
      appointments: ctx.session.appointments,
      appointmentId: appointment.id,
    });

    await this.sendButtons(
      ctx,
      [
        `📌 ${appointment.service.name}`,
        ...(appointment.professional.name
          ? [`👤 ${appointment.professional.name}`]
          : []),
        `📅 ${formatLongDate(appointment.date)}`,
        `🕐 ${appointment.time}`,
        '',
        'O que você quer fazer?',
      ].join('\n'),
      [
        { id: 'appt:reschedule', title: '🔄 Remarcar' },
        { id: 'appt:cancel', title: '❌ Cancelar' },
        { id: 'appt:back', title: '⬅️ Voltar' },
      ],
    );
  }

  private async onAppointmentAction(ctx: IBotContext, input: IBotInput) {
    const action = this.replyValue(input, 'appt');
    const appointment = this.selectedAppointment(ctx);

    if (!appointment) return this.enterAppointments(ctx);
    if (action === 'back') return this.enterAppointments(ctx);
    if (action === 'cancel') return this.enterConfirmCancel(ctx);

    if (action === 'reschedule') {
      ctx.session = {
        state: BotState.SELECT_PROFESSIONAL,
        appointments: ctx.session.appointments,
        appointmentId: appointment.id,
        rescheduleId: appointment.id,
        service: appointment.service,
      };
      return this.enterProfessionals(ctx);
    }

    return this.repeatStep(ctx, 'Escolha uma das opções abaixo 👇');
  }

  private async enterConfirmCancel(ctx: IBotContext) {
    const appointment = this.selectedAppointment(ctx);
    if (!appointment) return this.enterAppointments(ctx);

    await this.saveSession(ctx, {
      ...ctx.session,
      state: BotState.CONFIRM_CANCEL,
    });

    await this.sendButtons(
      ctx,
      `Cancelar *${appointment.service.name}* de ${formatShortDate(appointment.date)} às ${appointment.time}?`,
      [
        { id: 'cancel:yes', title: 'Sim, cancelar' },
        { id: 'cancel:no', title: 'Não, manter' },
      ],
    );
  }

  private async onConfirmCancel(ctx: IBotContext, input: IBotInput) {
    const answer = this.replyValue(input, 'cancel');
    const appointment = this.selectedAppointment(ctx);

    if (!appointment) return this.enterAppointments(ctx);
    if (answer === 'no') return this.enterAppointmentActions(ctx);
    if (answer !== 'yes') {
      return this.repeatStep(ctx, 'Escolha uma das opções abaixo 👇');
    }

    // Quem pede é o próprio cliente: a loja recebe o aviso de cancelamento
    await this.scheduleService.delete(
      ctx.config.store.id,
      appointment.id,
      appointment.customerId,
    );

    await this.saveSession(ctx, { state: BotState.MENU });
    await this.sendButtons(
      ctx,
      `Pronto, o agendamento de ${formatShortDate(appointment.date)} às ${appointment.time} foi cancelado.\n\nQuer marcar outro horário?`,
      [
        { id: 'menu:book', title: '📅 Agendar' },
        { id: 'menu:home', title: '🏠 Menu' },
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Apoio
  // ---------------------------------------------------------------------------

  private parseInput(message: IWhatsappWebhookMessage): IBotInput | null {
    const interactive =
      message.interactive?.button_reply ?? message.interactive?.list_reply;

    if (interactive?.id) {
      const reply = interactive.id;

      if (reply === 'menu:home') return { text: '', command: 'menu' };
      // Botões enviados antes do redesign não têm prefixo
      if (reply === 'agendar') return { text: '', command: 'book' };
      if (reply === 'meus_agendamentos') {
        return { text: '', command: 'appointments' };
      }

      return { reply, text: interactive.title ?? '' };
    }

    const text = message.text?.body?.trim();
    if (!text) return null;

    return { text, command: this.detectCommand(text) };
  }

  private detectCommand(text: string): TBotCommand | undefined {
    const normalized = normalizeText(text).replace(/[!?.,]+$/g, '');

    if (GREETINGS.includes(normalized)) return 'menu';
    if (EXIT_WORDS.includes(normalized)) return 'exit';
    if (normalized === 'voltar') return 'back';
    if (/\b(meus )?agendamentos\b/.test(normalized)) return 'appointments';
    if (/\b(agendar|marcar)\b/.test(normalized)) return 'book';

    return undefined;
  }

  /** Valor de uma opção com prefixo: `svc:123` com `svc` dá `123`. */
  private replyValue(input: IBotInput, prefix: string): string | null {
    if (!input.reply?.startsWith(`${prefix}:`)) return null;
    return input.reply.slice(prefix.length + 1) || null;
  }

  private async fetchSlots(ctx: IBotContext, date: string) {
    const { service, professionalId } = ctx.session;

    // Mesma regra do site: duração, almoço, fechamento e horários já passados
    const slots = await this.scheduleService.getAvailability(
      ctx.config.store.id,
      {
        date,
        serviceIds: service.id,
        ...(professionalId && { memberId: professionalId }),
      },
    );

    return slots
      .filter((slot) => slot.available && slot.storeMemberId)
      .map((slot) => ({ time: slot.time, memberId: slot.storeMemberId }));
  }

  private today(ctx: IBotContext) {
    return getStoreNow(
      ctx.config.store.timezone || DEFAULT_TIMEZONE,
      new Date(),
    ).date;
  }

  private professionalName(ctx: IBotContext, memberId: string) {
    return (
      ctx.session.professionals?.find((person) => person.id === memberId)
        ?.name ?? 'Profissional da casa'
    );
  }

  private professionalLine(ctx: IBotContext) {
    const { professionalId } = ctx.session;
    return professionalId
      ? ` com ${this.professionalName(ctx, professionalId)}`
      : '';
  }

  private selectedAppointment(ctx: IBotContext) {
    return ctx.session.appointments?.find(
      (appointment) => appointment.id === ctx.session.appointmentId,
    );
  }

  private currentAppointment(ctx: IBotContext) {
    return ctx.session.rescheduleId
      ? ctx.session.appointments?.find((a) => a.id === ctx.session.rescheduleId)
      : undefined;
  }

  private async expired(ctx: IBotContext) {
    await this.clearSession(ctx);
    await this.sendText(ctx, 'Sua sessão expirou. Vamos recomeçar 🙂');
    return this.enterMenu(ctx);
  }

  private async isDuplicate(config: WhatsappConfig, messageId: string) {
    const key = `whatsapp:message:${config.phoneNumberId}:${messageId}`;

    if (await this.cacheManager.get(key)) return true;

    await this.cacheManager.set(key, 1, MESSAGE_DEDUP_TTL_MS);
    return false;
  }

  /** Por número da loja: a mesma pessoa pode conversar com duas lojas. */
  private sessionKey(config: WhatsappConfig, from: string) {
    return `whatsapp:session:${config.phoneNumberId}:${from}`;
  }

  private async saveSession(ctx: IBotContext, session: IBotSession) {
    ctx.session = session;
    await this.cacheManager.set(
      this.sessionKey(ctx.config, ctx.from),
      session,
      SESSION_TTL_MS,
    );
  }

  private async clearSession(ctx: IBotContext) {
    ctx.session = { state: BotState.MENU };
    await this.cacheManager.del(this.sessionKey(ctx.config, ctx.from));
  }

  private sendText(ctx: IBotContext, body: string) {
    return this.whatsappService.sendText(
      ctx.config.phoneNumberId,
      ctx.from,
      body,
      ctx.config.accessToken,
    );
  }

  private sendButtons(
    ctx: IBotContext,
    body: string,
    buttons: { id: string; title: string }[],
  ) {
    return this.whatsappService.sendInteractiveButtons(
      ctx.config.phoneNumberId,
      ctx.from,
      body,
      buttons.map((button) => ({
        ...button,
        title: truncate(button.title, WHATSAPP_LIMITS.buttonTitle),
      })),
      ctx.config.accessToken,
    );
  }

  private sendList(
    ctx: IBotContext,
    {
      header,
      body,
      sections,
    }: {
      header: string;
      body: string;
      sections: {
        title: string;
        rows: { id: string; title: string; description?: string }[];
      }[];
    },
  ) {
    return this.whatsappService.sendInteractiveList({
      phoneNumberId: ctx.config.phoneNumberId,
      to: ctx.from,
      headerText: truncate(header, WHATSAPP_LIMITS.header),
      bodyText: body,
      footerText: FOOTER,
      buttonText: LIST_BUTTON,
      // A Meta recusa descrição vazia
      sections: sections.map((section) => ({
        ...section,
        rows: section.rows.map(({ description, ...row }) =>
          description ? { ...row, description } : row,
        ),
      })),
      accessToken: ctx.config.accessToken,
    });
  }
}
