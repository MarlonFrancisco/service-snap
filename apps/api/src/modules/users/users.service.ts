import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sharp from 'sharp';
import type { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { StripeService } from '../stripe';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly stripeService: StripeService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByOne({
    email,
    telephone,
    paymentCustomerId,
    includeSubscriptions = false,
  }: {
    email?: string;
    telephone?: string;
    paymentCustomerId?: string;
    includeSubscriptions?: boolean;
  }): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email,
        telephone,
        paymentCustomerId,
        subscriptions: includeSubscriptions ? { status: 'active' } : undefined,
      },
      relations: includeSubscriptions ? ['subscriptions'] : undefined,
    });
  }

  async createStripeCustomer(userData: Partial<User>): Promise<string> {
    const customer = await this.stripeService.customers.create({
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      phone: userData.telephone,
    });
    return customer.id;
  }

  async create(userData: Partial<User>): Promise<User> {
    const customer = await this.stripeService.customers.create({
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      phone: userData.telephone,
    });

    const user = this.userRepository.create({
      ...userData,
      paymentCustomerId: customer.id,
    });

    return this.userRepository.save(user);
  }

  /**
   * Cria ou atualiza usuário em uma única operação (otimizado para serverless)
   * Usa upsert para evitar múltiplas queries (findByOne + create)
   */
  async upsert(userData: Partial<User>): Promise<User> {
    // Tenta encontrar usuário existente por telefone ou email
    const existingUser = await this.userRepository.findOne({
      where: [{ telephone: userData.telephone }, { email: userData.email }],
    });

    if (existingUser) {
      return existingUser;
    }

    // Se não existe, cria novo (com Stripe customer)
    return this.create(userData);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const user = await this.findById(id);

    await this.stripeService.customers.update(user.paymentCustomerId, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.telephone,
    });

    return user;
  }

  async delete(id: string): Promise<{ id: string }> {
    await this.userRepository.update(id, { isDeleted: true });
    await this.storageService.deleteFile({
      bucket: 'users',
      path: `${id}/avatar.webp`,
    });

    return { id };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { updatedAt: new Date() });
  }

  async getUserDetails(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'favorites',
        'favorites.store',
        'favorites.store.gallery',
        'schedules',
        'schedules.service',
        'schedules.store',
        'schedules.store.gallery',
        'schedules.storeMember',
        'schedules.storeMember.user',
      ],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'telephone',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateAvatar(id: string, avatar: string): Promise<User> {
    const cleanBase64 = avatar.split('base64,')[1];
    const arrayBuffer = Buffer.from(cleanBase64, 'base64');
    const webpBuffer = await sharp(arrayBuffer).webp().toBuffer();

    const avatarUrl = await this.storageService.uploadFile({
      bucket: 'users',
      filePath: `${id}/avatar.webp`,
      file: webpBuffer,
    });

    await this.userRepository.update(id, { avatar: `/users/${avatarUrl}` });
    return this.findById(id);
  }
}
