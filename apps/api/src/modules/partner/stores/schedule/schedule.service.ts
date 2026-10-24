import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { calculateEndTime } from '../../../../utils/helpers/schedule.helpers';
import { normalizePhoneNumber } from '../../../../utils/helpers/user.helpers';
import { UsersService } from '../../../users/users.service';
import { CreateSchedulesDto } from './dto/create-schedule.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { Schedule } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly usersService: UsersService,
  ) {}

  async create(scheduleDto: CreateSchedulesDto): Promise<Schedule[]> {
    const user = await this.usersService.upsert({
      email: scheduleDto.user?.email,
      telephone: normalizePhoneNumber(scheduleDto.user?.telephone),
      firstName: scheduleDto.user?.firstName,
      lastName: scheduleDto.user?.lastName,
    });

    scheduleDto.user = user;

    let endTime = '';

    const schedules = scheduleDto.services.map((service) => {
      const startTime = !endTime ? scheduleDto.startTime : endTime;
      const scheduleEndTime = calculateEndTime(startTime, service.duration);

      const nextSchedule = {
        ...scheduleDto,
        startTime,
        endTime: scheduleEndTime,
        service: { id: service.id },
        services: undefined,
      };

      endTime = scheduleEndTime;

      return nextSchedule;
    });

    const savedSchedules = await this.scheduleRepository.save(schedules);
    return await this.scheduleRepository.find({
      where: { id: In(savedSchedules.map((schedule) => schedule.id)) },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });
  }

  async findAll(storeId: string): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { store: { id: storeId } },
      relations: ['storeMember', 'storeMember.user', 'user', 'service'],
    });
  }

  /**
   * Slim public payload for booking slot checks (date/time + member id only).
   */
  async findAvailability(storeId: string): Promise<
    Array<
      Pick<Schedule, 'id' | 'date' | 'startTime' | 'endTime' | 'status'> & {
        storeMember: Pick<Schedule['storeMember'], 'id'>;
      }
    >
  > {
    const schedules = await this.scheduleRepository.find({
      where: {
        store: { id: storeId },
        status: In(['scheduled', 'completed']),
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        storeMember: { id: true },
      },
      relations: ['storeMember'],
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
      storeMember: { id: schedule.storeMember.id },
    }));
  }

  async findOne(id: string, relations: string[] = []): Promise<Schedule> {
    return this.scheduleRepository.findOne({ where: { id }, relations });
  }

  async update(schedule: ScheduleDto): Promise<Schedule> {
    await this.scheduleRepository.update(schedule.id, schedule);
    return this.findOne(schedule.id);
  }

  async delete(id: string): Promise<{ id: string }> {
    await this.scheduleRepository.update(id, { status: 'cancelled' });
    return { id };
  }

  async getSchedulesByMonth(
    storeOwnerId: string,
    day: number,
    month: number,
    year: number,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        date: Between(
          new Date(year, month, day),
          new Date(year, month + 1, day),
        ),
        store: {
          owner: {
            id: storeOwnerId,
          },
        },
      },
    });
  }
}
