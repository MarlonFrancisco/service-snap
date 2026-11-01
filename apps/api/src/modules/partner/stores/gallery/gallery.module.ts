import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../../../storage/storage.module';
import { StoreGuardsModule } from '../guards/store-guards.module';
import { GalleryController } from './gallery.controller';
import { Gallery } from './gallery.entity';
import { GalleryService } from './gallery.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gallery]),
    StorageModule,
    StoreGuardsModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
