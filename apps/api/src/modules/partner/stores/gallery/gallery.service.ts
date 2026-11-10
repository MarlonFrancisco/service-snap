import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sharp from 'sharp';
import { Repository, UpdateResult } from 'typeorm';
import { StorageService } from '../../../storage/storage.service';
import { Store } from '../store.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { Gallery } from './gallery.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    private readonly storageService: StorageService,
  ) {}

  async create(galleryDto: CreateGalleryDto): Promise<Gallery> {
    // Com `id` no corpo, o save sobrescreveria uma imagem existente
    let gallery = this.galleryRepository.create({
      ...galleryDto,
      id: undefined,
    });

    gallery = await this.galleryRepository.save(gallery);

    const cleanBase64 = galleryDto.url.split('base64,')[1];
    const arrayBuffer = Buffer.from(cleanBase64, 'base64');
    const webpBuffer = await sharp(arrayBuffer).webp().toBuffer();

    gallery.url = await this.storageService.uploadFile({
      folder: 'stores',
      filePath: `${gallery.store.id}/gallery/${gallery.id}.webp`,
      file: webpBuffer,
      contentType: 'image/webp',
    });

    return this.galleryRepository.save(gallery);
  }

  async findAll(storeId: string): Promise<Gallery[]> {
    return this.galleryRepository.find({ where: { store: { id: storeId } } });
  }

  async findOne(id: string): Promise<Gallery> {
    return this.galleryRepository.findOne({ where: { id } });
  }

  async update(gallery: UpdateGalleryDto): Promise<UpdateResult> {
    return await this.galleryRepository.update(
      { id: gallery.id, store: { id: gallery.store.id } },
      gallery,
    );
  }

  async delete(
    storeId: string,
    id: string,
  ): Promise<{ id: string; store: Store }> {
    const result = await this.galleryRepository.delete({
      id,
      store: { id: storeId },
    });

    if (!result.affected) {
      throw new NotFoundException('Gallery image not found');
    }

    await this.storageService.deleteFile({
      folder: 'stores',
      path: `${storeId}/gallery/${id}.webp`,
    });

    return { id, store: { id: storeId } as Store };
  }

  async updateMainImage(gallery: UpdateGalleryDto): Promise<Gallery> {
    // Confere antes de desmarcar a imagem principal atual
    const exists = await this.galleryRepository.exists({
      where: { id: gallery.id, store: { id: gallery.store.id } },
    });

    if (!exists) {
      throw new NotFoundException('Gallery image not found');
    }

    const image = await this.galleryRepository.findOne({
      where: { store: { id: gallery.store.id }, isMain: true },
    });

    if (image) {
      image.isMain = false;
      await this.galleryRepository.save(image);
    }

    await this.update(gallery);

    const updatedImage = await this.findOne(gallery.id);

    return { ...updatedImage, store: { id: gallery.store.id } as Store };
  }
}
