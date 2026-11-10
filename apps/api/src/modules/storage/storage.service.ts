import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TStorageFolder } from './storage.types';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  /** Um bucket por ambiente (ex.: ssnap-production, ssnap-development). */
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow('R2_BUCKET');
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  private buildKey(folder: TStorageFolder, filePath: string): string {
    return `${folder}/${filePath.replace(/^\/+/, '')}`;
  }

  /**
   * Grava em `<folder>/<filePath>` e devolve só o `filePath`, que é o que os
   * chamadores gravam no banco; o front acrescenta a pasta ao montar a URL.
   */
  async uploadFile({
    folder,
    filePath,
    file,
    contentType,
  }: {
    folder: TStorageFolder;
    filePath: string;
    file: Buffer;
    contentType?: string;
  }): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.buildKey(folder, filePath),
        Body: file,
        ContentType: contentType,
      }),
    );

    return filePath;
  }

  async deleteFile({
    folder,
    path,
  }: {
    folder: TStorageFolder;
    path: string;
  }): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: this.buildKey(folder, path),
      }),
    );
  }
}
