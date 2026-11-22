import type { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getWorkerBinding } from '../../utils/runtime';
import type { TStorageFolder } from './storage.types';

/** Parte do binding de R2 usada aqui (Cloudflare Workers). */
interface IR2BucketBinding {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

@Injectable()
export class StorageService {
  /** No Worker o bucket chega como binding (`STORAGE_BUCKET`), sem chaves S3. */
  private readonly bucketBinding =
    getWorkerBinding<IR2BucketBinding>('STORAGE_BUCKET');
  private s3Client?: Promise<S3Client>;

  constructor(private readonly configService: ConfigService) {}

  /** Um bucket por ambiente (ex.: ssnap-production, ssnap-development). */
  private get bucket(): string {
    return this.configService.getOrThrow('R2_BUCKET');
  }

  /** Fora do Worker: R2 pela API S3. O SDK só carrega quando é usado. */
  private getS3Client(): Promise<S3Client> {
    this.s3Client ??= import('@aws-sdk/client-s3').then(
      ({ S3Client }) =>
        new S3Client({
          region: 'auto',
          endpoint: `https://${this.configService.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.configService.getOrThrow('R2_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.getOrThrow(
              'R2_SECRET_ACCESS_KEY',
            ),
          },
        }),
    );
    return this.s3Client;
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
    const key = this.buildKey(folder, filePath);

    if (this.bucketBinding) {
      await this.bucketBinding.put(key, new Uint8Array(file), {
        httpMetadata: { contentType },
      });
      return filePath;
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
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
    const key = this.buildKey(folder, path);

    if (this.bucketBinding) {
      await this.bucketBinding.delete(key);
      return;
    }

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getS3Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
