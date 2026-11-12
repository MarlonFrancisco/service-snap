import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../category/service/service.entity';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { Schedule } from '../schedule/schedule.entity';
import { AnamnesisForm } from './anamnesis-form.entity';
import { AnamnesisPublicController } from './anamnesis-public.controller';
import { AnamnesisResponse } from './anamnesis-response.entity';
import { AnamnesisController } from './anamnesis.controller';
import { AnamnesisService } from './anamnesis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnamnesisForm,
      AnamnesisResponse,
      Schedule,
      Service,
    ]),
    StoreGuardsModule,
  ],
  controllers: [AnamnesisController, AnamnesisPublicController],
  providers: [AnamnesisService],
})
export class AnamnesisModule {}
