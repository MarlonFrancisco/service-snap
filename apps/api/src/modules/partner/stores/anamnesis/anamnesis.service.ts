import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  createSignedToken,
  decryptText,
  encryptText,
  parseEncryptionKey,
  readSignedToken,
} from '../../../../utils/helpers/crypto.helpers';
import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import { addDaysToDateKey } from '../../../../utils/helpers/store-date.helpers';
import { AuditService } from '../../../audit/audit.service';
import { Service } from '../category/service/service.entity';
import { Schedule } from '../schedule/schedule.entity';
import { AnamnesisForm } from './anamnesis-form.entity';
import { AnamnesisResponse } from './anamnesis-response.entity';
import {
  buildAnamnesisConsentText,
  deriveAnamnesisLinkSecret,
  formAppliesTo,
  normalizeFields,
  validateAnswers,
} from './anamnesis.helpers';
import type { TAnamnesisAnswers, TAnamnesisInvite } from './anamnesis.types';
import type {
  CreateAnamnesisFormDto,
  SubmitAnamnesisDto,
  UpdateAnamnesisFormDto,
} from './dto/anamnesis.dto';

/** Quem está lendo: o papel e, se for profissional, qual membro é. */
type TViewer = {
  userId: string;
  role: string;
  storeMemberId?: string;
};

@Injectable()
export class AnamnesisService {
  constructor(
    @InjectRepository(AnamnesisForm)
    private readonly formRepository: Repository<AnamnesisForm>,
    @InjectRepository(AnamnesisResponse)
    private readonly responseRepository: Repository<AnamnesisResponse>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  listForms(storeId: string) {
    return this.formRepository.find({
      where: { store: { id: storeId } },
      order: { name: 'ASC' },
    });
  }

  async createForm(storeId: string, dto: CreateAnamnesisFormDto) {
    await this.assertServices(storeId, dto.serviceIds);

    return this.formRepository.save({
      name: dto.name,
      description: dto.description ?? null,
      fields: normalizeFields(dto.fields),
      serviceIds: [...new Set(dto.serviceIds ?? [])],
      store: { id: storeId },
    });
  }

  async updateForm(storeId: string, id: string, dto: UpdateAnamnesisFormDto) {
    const form = await this.findForm(storeId, id);

    if (dto.serviceIds) await this.assertServices(storeId, dto.serviceIds);

    const fields = dto.fields && normalizeFields(dto.fields);
    const fieldsChanged =
      fields && JSON.stringify(fields) !== JSON.stringify(form.fields);

    await this.formRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.serviceIds && { serviceIds: [...new Set(dto.serviceIds)] }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(fieldsChanged && { fields, version: form.version + 1 }),
    });

    return this.findForm(storeId, id);
  }

  /**
   * Link sem login para o cliente preencher antes do atendimento. Vale até o
   * dia seguinte ao atendimento; o painel envia por WhatsApp ou e-mail.
   */
  async createLink(storeId: string, scheduleId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, store: { id: storeId } },
      relations: ['service'],
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    const forms = await this.applicableForms(storeId, schedule);

    if (!forms.length) {
      throw new BadRequestException('No anamnesis form for this service');
    }

    const expiresAt = new Date(
      `${addDaysToDateKey(toDateKey(schedule.date), 2)}T00:00:00Z`,
    );
    const token = createSignedToken(this.linkSecret, schedule.id, expiresAt);

    return {
      url: `${this.configService.get<string>('FRONTEND_URL')}/anamnese/${token}`,
      expiresAt,
      forms: forms.map(({ id, name }) => ({ id, name })),
    };
  }

  /** O que a página pública mostra. Sem nenhuma resposta já enviada. */
  async getInvite(token: string): Promise<TAnamnesisInvite> {
    const schedule = await this.scheduleFromToken(token);
    const forms = await this.applicableForms(schedule.store.id, schedule);
    const responses = await this.responseRepository.find({
      where: { schedule: { id: schedule.id } },
      relations: ['form'],
    });

    return {
      storeName: schedule.store.name,
      customerFirstName: schedule.user?.firstName ?? null,
      date: toDateKey(schedule.date),
      startTime: schedule.startTime,
      consentText: buildAnamnesisConsentText(schedule.store.name),
      forms: forms.map((form) => ({
        id: form.id,
        name: form.name,
        description: form.description,
        version: form.version,
        fields: form.fields,
        submittedAt:
          responses.find((response) => response.form?.id === form.id)
            ?.updatedAt ?? null,
      })),
    };
  }

  /** Enviar de novo antes do atendimento substitui as respostas anteriores. */
  async submit(token: string, dto: SubmitAnamnesisDto) {
    const schedule = await this.scheduleFromToken(token);
    const form = (await this.applicableForms(schedule.store.id, schedule)).find(
      (candidate) => candidate.id === dto.formId,
    );

    if (!form) throw new NotFoundException('Form not found');
    if (!schedule.user)
      throw new BadRequestException('Schedule has no customer');

    const answers = validateAnswers(form.fields, dto.answers);
    const existing = await this.responseRepository.findOne({
      where: { form: { id: form.id }, schedule: { id: schedule.id } },
    });

    await this.responseRepository.save({
      ...(existing && { id: existing.id }),
      formName: form.name,
      formVersion: form.version,
      fields: form.fields,
      answersEncrypted: encryptText(JSON.stringify(answers), this.key),
      consentAt: new Date(),
      consentText: buildAnamnesisConsentText(schedule.store.name),
      store: { id: schedule.store.id },
      form: { id: form.id },
      schedule: { id: schedule.id },
      customer: { id: schedule.user.id },
    });

    return { formId: form.id, submitted: true };
  }

  /** Lista sem respostas: só qual ficha, de quando e de qual atendimento. */
  async listForCustomer(storeId: string, customerId: string) {
    const responses = await this.responseRepository.find({
      where: { store: { id: storeId }, customer: { id: customerId } },
      relations: ['schedule', 'schedule.storeMember'],
      order: { createdAt: 'DESC' },
    });

    return responses.map((response) => ({
      id: response.id,
      formName: response.formName,
      formVersion: response.formVersion,
      submittedAt: response.updatedAt,
      consentAt: response.consentAt,
      schedule: response.schedule && {
        id: response.schedule.id,
        date: toDateKey(response.schedule.date),
        startTime: response.schedule.startTime,
        storeMemberId: response.schedule.storeMember?.id ?? null,
      },
    }));
  }

  /**
   * Respostas abertas: dono, gerente ou o profissional daquele atendimento.
   * Toda leitura fica na auditoria (GET não passa pelo interceptor).
   */
  async readResponse(storeId: string, id: string, viewer: TViewer) {
    const response = await this.responseRepository
      .createQueryBuilder('response')
      .addSelect('response.answersEncrypted')
      .leftJoinAndSelect('response.schedule', 'schedule')
      .leftJoinAndSelect('schedule.storeMember', 'member')
      .leftJoinAndSelect('response.customer', 'customer')
      .where('response.id = :id', { id })
      .andWhere('response.storeId = :storeId', { storeId })
      .getOne();

    if (!response) throw new NotFoundException('Anamnesis not found');

    const isManagement = ['owner', 'manager'].includes(viewer.role);
    const attends =
      Boolean(viewer.storeMemberId) &&
      response.schedule?.storeMember?.id === viewer.storeMemberId;

    if (!isManagement && !attends) {
      throw new ForbiddenException(
        'Only management or the attending professional can read it',
      );
    }

    await this.auditService.record({
      storeId,
      actorType: 'user',
      actorUserId: viewer.userId,
      action: 'anamnesis.response.viewed',
      resourceType: 'anamnesis-responses',
      resourceId: id,
    });

    return {
      id: response.id,
      formName: response.formName,
      formVersion: response.formVersion,
      fields: response.fields,
      answers: JSON.parse(
        decryptText(response.answersEncrypted, this.key),
      ) as TAnamnesisAnswers,
      consentAt: response.consentAt,
      consentText: response.consentText,
      submittedAt: response.updatedAt,
      customer: {
        id: response.customer.id,
        firstName: response.customer.firstName,
        lastName: response.customer.lastName,
      },
      scheduleId: response.schedule?.id ?? null,
    };
  }

  /** Pedido de exclusão do cliente feito à loja. */
  async deleteResponse(storeId: string, id: string) {
    const result = await this.responseRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) throw new NotFoundException('Anamnesis not found');

    return { id };
  }

  private async scheduleFromToken(token: string) {
    const scheduleId = readSignedToken(this.linkSecret, token);

    if (!scheduleId) throw new GoneException('Link expired or invalid');

    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['store', 'service', 'user'],
    });

    if (!schedule || schedule.status === 'cancelled') {
      throw new GoneException('Link expired or invalid');
    }

    return schedule;
  }

  private async applicableForms(storeId: string, schedule: Schedule) {
    const forms = await this.formRepository.find({
      where: { store: { id: storeId }, isActive: true },
      order: { name: 'ASC' },
    });

    return forms.filter((form) =>
      formAppliesTo(form, schedule.service ? [schedule.service.id] : []),
    );
  }

  private async findForm(storeId: string, id: string) {
    const form = await this.formRepository.findOne({
      where: { id, store: { id: storeId } },
    });

    if (!form) throw new NotFoundException('Form not found');

    return form;
  }

  private async assertServices(storeId: string, serviceIds?: string[]) {
    const ids = [...new Set(serviceIds ?? [])];

    if (!ids.length) return;

    const found = await this.serviceRepository.count({
      where: { id: In(ids), store: { id: storeId } },
    });

    if (found !== ids.length) {
      throw new BadRequestException('Service not found in this store');
    }
  }

  private get key(): Buffer {
    const key = parseEncryptionKey(
      this.configService.get<string>('DATA_ENCRYPTION_KEY'),
    );

    if (!key) {
      throw new ServiceUnavailableException(
        'Data encryption is not configured',
      );
    }

    return key;
  }

  private get linkSecret() {
    return deriveAnamnesisLinkSecret(this.key);
  }
}
