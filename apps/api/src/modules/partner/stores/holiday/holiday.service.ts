import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  type Repository,
} from 'typeorm';
import { CreateHolidayDto, HolidayQueryDto } from './holiday.dto';
import { StoreHoliday } from './holiday.entity';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
  ) {}

  async findAll(
    storeId: string,
    { from, to }: HolidayQueryDto = {},
  ): Promise<StoreHoliday[]> {
    const date =
      from && to
        ? Between(from, to)
        : from
          ? MoreThanOrEqual(from)
          : to
            ? LessThanOrEqual(to)
            : undefined;

    return this.holidayRepository.find({
      where: { store: { id: storeId }, ...(date && { date }) },
      order: { date: 'ASC' },
    });
  }

  async isHoliday(storeId: string, date: string): Promise<boolean> {
    return this.holidayRepository.exists({
      where: { store: { id: storeId }, date },
    });
  }

  async create(
    storeId: string,
    { date, name }: CreateHolidayDto,
  ): Promise<StoreHoliday> {
    if (await this.isHoliday(storeId, date)) {
      throw new ConflictException('There is already a holiday on this date');
    }

    return this.holidayRepository.save({
      store: { id: storeId },
      date,
      name: name?.trim() || null,
    });
  }

  async delete(storeId: string, id: string): Promise<{ id: string }> {
    const result = await this.holidayRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) {
      throw new NotFoundException('Holiday not found');
    }

    return { id };
  }
}
