import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Subscription } from '../../subscription/subscription.entity';
import { UsersService } from '../../users/users.service';
import { Category } from '../stores/category/category.entity';
import { Service } from '../stores/category/service/service.entity';
import { Gallery } from '../stores/gallery/gallery.entity';
import { UpdateStoreMemberDto } from '../stores/store-member/dto/update-store-member.dto';
import { StoreMember } from '../stores/store-member/store-member.entity';
import { StoreMemberService } from '../stores/store-member/store-member.service';
import { Store } from '../stores/store.entity';
import { StoresService } from '../stores/stores.services';
import {
  AddMemberDto,
  AddServiceDto,
  SaveHoursDto,
  SaveOwnerDto,
  SaveSpaceDto,
  SetMonthlyGoalDto,
  SetStepDto,
} from './dto/onboarding.dto';
import {
  furthestStep,
  isBookableProfessional,
  isStoreDraft,
  validateBusinessHours,
} from './onboarding.helpers';
import type { TChecklistItem, TOnboardingStatus } from './onboarding.types';
import { StoreOnboarding } from './store-onboarding.entity';

const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/** A API exige estes campos, mas o assistente só pede o nome da categoria. */
const DEFAULT_CATEGORY_COLOR = 'purple';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(StoreOnboarding)
    private readonly onboardingRepository: Repository<StoreOnboarding>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StoreMember)
    private readonly storeMemberRepository: Repository<StoreMember>,
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly storeMemberService: StoreMemberService,
    private readonly storesService: StoresService,
    private readonly usersService: UsersService,
  ) {}

  async getState(userId: string) {
    const stores = await this.findOwnedStores(userId);
    const draft = stores.find(isStoreDraft);
    const status: TOnboardingStatus = draft
      ? 'in_progress'
      : stores.length
        ? 'not_needed'
        : 'welcome';

    if (!draft) {
      return {
        status,
        step: status === 'welcome' ? ('space' as const) : null,
        hasActiveSubscription: await this.hasActiveSubscription(userId),
        store: null,
        businessType: null,
        categories: [],
        services: [],
        members: [],
        gallery: [],
        plan: await this.storeMemberService.getProfessionalUsage(userId),
      };
    }

    const [categories, services, members, gallery, plan, hasSubscription] =
      await Promise.all([
        this.categoryRepository.find({
          where: { store: { id: draft.id } },
          order: { createdAt: 'ASC' },
        }),
        this.serviceRepository.find({
          where: { store: { id: draft.id } },
          relations: ['category'],
          order: { createdAt: 'ASC' },
        }),
        this.storeMemberRepository.find({
          where: { store: { id: draft.id } },
          relations: ['user', 'services'],
          order: { createdAt: 'ASC' },
        }),
        this.galleryRepository.find({
          where: { store: { id: draft.id } },
          order: { createdAt: 'ASC' },
        }),
        this.storeMemberService.getProfessionalUsage(userId, draft.id),
        this.hasActiveSubscription(userId),
      ]);

    return {
      status,
      step: draft.onboarding.step,
      hasActiveSubscription: hasSubscription,
      store: this.toStoreSummary(draft),
      businessType: draft.onboarding.businessType,
      categories: categories.map(({ id, name }) => ({ id, name })),
      services: services.map(({ id, name, duration, price, category }) => ({
        id,
        name,
        duration,
        price,
        category: category
          ? { id: category.id, name: category.name }
          : null,
      })),
      members: members.map((member) => ({
        id: member.id,
        isOwner: member.user?.id === userId,
        name: [member.user?.firstName, member.user?.lastName]
          .filter(Boolean)
          .join(' '),
        email: member.user?.email ?? null,
        serviceIds: member.services.map((service) => service.id),
      })),
      gallery: gallery.map(({ id, url, isMain }) => ({ id, url, isMain })),
      plan,
    };
  }

  async saveSpace(userId: string, { businessType, ...space }: SaveSpaceDto) {
    await this.assertActiveSubscription(userId);

    const stores = await this.findOwnedStores(userId);
    const draft = stores.find(isStoreDraft);
    const fields = { ...space, state: space.state.toUpperCase() };

    if (draft) {
      await this.storeRepository.update(draft.id, fields);
      await this.onboardingRepository.update(draft.onboarding.id, {
        businessType,
        step: furthestStep(draft.onboarding.step, 'hours'),
      });
      return this.getState(userId);
    }

    if (stores.length) {
      throw new ConflictException('Você já tem um espaço cadastrado');
    }

    // Loja e progresso nascem juntos: uma loja sem a linha de onboarding não
    // seria rascunho e poderia aparecer para clientes.
    await this.storeRepository.manager.transaction(async (manager) => {
      const store = await manager.save(Store, {
        ...fields,
        amenities: [],
        isActive: false,
        owner: { id: userId },
      });

      await manager.save(StoreOnboarding, {
        store: { id: store.id },
        businessType,
        step: 'hours',
      });
    });

    return this.getState(userId);
  }

  async saveHours(userId: string, dto: SaveHoursDto) {
    const draft = await this.getDraftOrFail(userId);
    const businessDays = Object.fromEntries(
      WEEK_DAYS.map((day) => [day, dto.businessDays[day] === true]),
    ) as Store['businessDays'];

    if (!WEEK_DAYS.some((day) => businessDays[day])) {
      throw new BadRequestException('Escolha pelo menos um dia de atendimento');
    }

    const error = validateBusinessHours(dto);
    if (error) {
      throw new BadRequestException(error);
    }

    await this.storeRepository.update(draft.id, {
      businessDays,
      openTime: dto.openTime,
      closeTime: dto.closeTime,
      lunchStartTime: dto.lunchStartTime ?? null,
      lunchEndTime: dto.lunchEndTime ?? null,
    });
    await this.onboardingRepository.update(draft.onboarding.id, {
      step: furthestStep(draft.onboarding.step, 'services'),
    });

    return this.getState(userId);
  }

  async addService(userId: string, dto: AddServiceDto) {
    const draft = await this.getDraftOrFail(userId);
    const category = await this.findOrCreateCategory(
      draft.id,
      dto.categoryName,
    );
    const siblings = await this.serviceRepository.find({
      where: { store: { id: draft.id }, category: { id: category.id } },
    });

    if (siblings.some((s) => s.name.toLowerCase() === dto.name.toLowerCase())) {
      throw new ConflictException('Este serviço já foi adicionado');
    }

    await this.serviceRepository.save({
      name: dto.name,
      // Fica vazia em vez de inventar um texto que o parceiro não escreveu e
      // que o cliente veria no agendamento. O editor de serviços pede depois.
      description: '',
      duration: dto.duration,
      price: dto.price,
      isActive: true,
      store: { id: draft.id },
      category: { id: category.id },
    });

    return this.getState(userId);
  }

  async removeService(userId: string, serviceId: string) {
    const draft = await this.getDraftOrFail(userId);
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, store: { id: draft.id } },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    await this.serviceRepository.delete(service.id);

    if (service.category) {
      const remaining = await this.serviceRepository.count({
        where: { category: { id: service.category.id } },
      });

      // Evita que uma categoria digitada errado fique sobrando na lista.
      if (!remaining) {
        await this.categoryRepository.delete(service.category.id);
      }
    }

    return this.getState(userId);
  }

  async setStep(userId: string, { step }: SetStepDto) {
    const draft = await this.getDraftOrFail(userId);
    const { services, members } = await this.loadRequirements(draft.id);

    if (['team', 'photos'].includes(step) && !services.length) {
      throw new BadRequestException('Adicione pelo menos um serviço');
    }

    if (step === 'photos' && !members.some(isBookableProfessional)) {
      throw new BadRequestException(
        'Adicione pelo menos um profissional com serviços',
      );
    }

    await this.onboardingRepository.update(draft.onboarding.id, {
      step: furthestStep(draft.onboarding.step, step),
    });

    return this.getState(userId);
  }

  async saveOwner(userId: string, { enabled, serviceIds }: SaveOwnerDto) {
    const draft = await this.getDraftOrFail(userId);
    const member = await this.storeMemberRepository.findOne({
      where: { store: { id: draft.id }, user: { id: userId } },
    });

    if (!enabled) {
      if (member) {
        await this.storeMemberService.delete(draft.id, member.id);
      }
      return this.getState(userId);
    }

    if (!serviceIds.length) {
      throw new BadRequestException('Escolha pelo menos um serviço');
    }

    await this.assertServicesInStore(draft.id, serviceIds);
    const services = serviceIds.map((id) => ({ id }));

    if (member) {
      await this.storeMemberService.update({
        id: member.id,
        role: 'professional',
        isActive: true,
        services,
      } as UpdateStoreMemberDto);
    } else {
      await this.storeMemberService.createForUser({
        userId,
        storeId: draft.id,
        ownerUserId: userId,
        role: 'professional',
        services,
      });
    }

    return this.getState(userId);
  }

  async addMember(userId: string, { email, serviceIds }: AddMemberDto) {
    const draft = await this.getDraftOrFail(userId);
    await this.assertServicesInStore(draft.id, serviceIds);

    const user = await this.usersService.findByOne({ email });

    if (!user) {
      throw new NotFoundException('Não encontramos uma conta com este e-mail');
    }

    if (user.id === userId) {
      throw new ConflictException('Para se incluir, use "Eu mesmo atendo"');
    }

    const existing = await this.storeMemberRepository.findOne({
      where: { store: { id: draft.id }, user: { id: user.id } },
    });

    if (existing) {
      throw new ConflictException('Esta pessoa já foi adicionada');
    }

    await this.storeMemberService.createForUser({
      userId: user.id,
      storeId: draft.id,
      ownerUserId: userId,
      role: 'professional',
      services: serviceIds.map((id) => ({ id })),
    });

    return this.getState(userId);
  }

  async removeMember(userId: string, memberId: string) {
    const draft = await this.getDraftOrFail(userId);
    await this.storeMemberService.delete(draft.id, memberId);
    return this.getState(userId);
  }

  async complete(userId: string) {
    const stores = await this.findOwnedStores(userId);
    const draft = stores.find(isStoreDraft);

    if (!draft) {
      throw new NotFoundException('Nenhum espaço em preparação');
    }

    const { services, members } = await this.loadRequirements(draft.id);

    if (!draft.openTime || !draft.businessDays) {
      throw new BadRequestException({
        message: 'Defina os horários de atendimento',
        step: 'hours',
      });
    }

    if (!services.length) {
      throw new BadRequestException({
        message: 'Adicione pelo menos um serviço',
        step: 'services',
      });
    }

    if (!members.some(isBookableProfessional)) {
      throw new BadRequestException({
        message: 'Adicione pelo menos um profissional com serviços',
        step: 'team',
      });
    }

    // As duas escritas andam juntas: nem loja ativa ainda em rascunho, nem
    // onboarding concluído com a loja inativa.
    await this.storeRepository.manager.transaction(async (manager) => {
      await manager.update(StoreOnboarding, draft.onboarding.id, {
        completedAt: new Date(),
      });
      await manager.update(Store, draft.id, { isActive: true });
    });

    await this.storesService.syncSearchIndex(draft.id);

    const gallery = await this.galleryRepository.find({
      where: { store: { id: draft.id } },
    });

    return {
      store: this.toStoreSummary(draft),
      services: services.map(({ id, name, price }) => ({ id, name, price })),
      gallery: gallery.map(({ id, url, isMain }) => ({ id, url, isMain })),
    };
  }

  async getChecklist(userId: string, storeId: string) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId, owner: { id: userId } },
      relations: [
        'onboarding',
        'gallery',
        'storeMembers',
        'storeMembers.user',
        'notificationsSettings',
        'whatsappConfig',
      ],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Só quem passou pelo assistente vê este checklist.
    if (!store.onboarding?.completedAt) {
      return { visible: false, storeId, items: [] as TChecklistItem[] };
    }

    const subscription = await this.findActiveSubscription(userId);
    const hasOtherProfessional = store.storeMembers.some(
      (member) =>
        member.role === 'professional' && member.user?.id !== userId,
    );

    const items: TChecklistItem[] = [
      { id: 'share_link', done: Boolean(store.onboarding.linkSharedAt) },
      { id: 'photos', done: store.gallery.length > 0 },
      {
        id: 'email_reminders',
        done: Boolean(store.notificationsSettings?.emailReminderEnabled),
      },
      ...(subscription?.features?.WHATSAPP_INTEGRATION
        ? [
            {
              id: 'whatsapp' as const,
              done: Boolean(store.whatsappConfig?.isActive),
            },
          ]
        : []),
      { id: 'team', done: hasOtherProfessional },
      { id: 'monthly_goal', done: store.monthlyGoal > 0 },
    ];

    return {
      visible:
        !store.onboarding.checklistDismissedAt &&
        items.some((item) => !item.done),
      storeId,
      items,
    };
  }

  async markLinkShared(userId: string, storeId: string) {
    const onboarding = await this.getCompletedOnboardingOrFail(userId, storeId);

    if (!onboarding.linkSharedAt) {
      await this.onboardingRepository.update(onboarding.id, {
        linkSharedAt: new Date(),
      });
    }

    return this.getChecklist(userId, storeId);
  }

  async dismissChecklist(userId: string, storeId: string) {
    const onboarding = await this.getCompletedOnboardingOrFail(userId, storeId);

    await this.onboardingRepository.update(onboarding.id, {
      checklistDismissedAt: new Date(),
    });

    return this.getChecklist(userId, storeId);
  }

  async setMonthlyGoal(
    userId: string,
    storeId: string,
    { monthlyGoal }: SetMonthlyGoalDto,
  ) {
    await this.getCompletedOnboardingOrFail(userId, storeId);
    await this.storeRepository.update(storeId, { monthlyGoal });
    return this.getChecklist(userId, storeId);
  }

  private findOwnedStores(userId: string) {
    return this.storeRepository.find({
      where: { owner: { id: userId } },
      relations: ['onboarding'],
    });
  }

  private async getDraftOrFail(userId: string) {
    const draft = (await this.findOwnedStores(userId)).find(isStoreDraft);

    if (!draft) {
      throw new NotFoundException('Nenhum espaço em preparação');
    }

    return draft;
  }

  private async getCompletedOnboardingOrFail(userId: string, storeId: string) {
    const onboarding = await this.onboardingRepository.findOne({
      where: { store: { id: storeId, owner: { id: userId } } },
    });

    if (!onboarding?.completedAt) {
      throw new NotFoundException('Checklist não encontrado');
    }

    return onboarding;
  }

  private async loadRequirements(storeId: string) {
    const [services, members] = await Promise.all([
      this.serviceRepository.find({
        where: { store: { id: storeId }, isActive: true },
      }),
      this.storeMemberRepository.find({
        where: { store: { id: storeId } },
        relations: ['services'],
      }),
    ]);

    return { services, members };
  }

  private async findOrCreateCategory(storeId: string, name: string) {
    const categories = await this.categoryRepository.find({
      where: { store: { id: storeId } },
    });
    const existing = categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    return this.categoryRepository.save({
      name,
      description: `Serviços de ${name}`,
      color: DEFAULT_CATEGORY_COLOR,
      store: { id: storeId },
    });
  }

  /** Sem esta checagem, um id de outra loja viraria vínculo com serviço alheio. */
  private async assertServicesInStore(storeId: string, serviceIds: string[]) {
    const found = await this.serviceRepository.count({
      where: { id: In(serviceIds), store: { id: storeId } },
    });

    if (found !== new Set(serviceIds).size) {
      throw new BadRequestException('Serviço não encontrado neste espaço');
    }
  }

  private findActiveSubscription(userId: string) {
    return this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: In(['active', 'paid', 'trialing']),
        currentPeriodEnd: MoreThanOrEqual(new Date()),
      },
    });
  }

  private async hasActiveSubscription(userId: string) {
    return Boolean(await this.findActiveSubscription(userId));
  }

  private async assertActiveSubscription(userId: string) {
    if (!(await this.hasActiveSubscription(userId))) {
      throw new ForbiddenException('Assinatura ativa não encontrada');
    }
  }

  private toStoreSummary(store: Store) {
    return {
      id: store.id,
      name: store.name,
      description: store.description,
      zipCode: store.zipCode,
      address: store.address,
      city: store.city,
      state: store.state,
      telephone: store.telephone,
      businessDays: store.businessDays,
      openTime: store.openTime,
      closeTime: store.closeTime,
      lunchStartTime: store.lunchStartTime,
      lunchEndTime: store.lunchEndTime,
    };
  }
}
