import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  /** Em dev, isola objetos em buckets `*-dev` (ex.: stores → stores-dev). */
  private resolveBucket(bucket: string): string {
    return this.isDev ? `${bucket}-dev` : bucket;
  }

  /** Devolve a chave do objeto, que é o que os chamadores gravam no banco. */
  async uploadFile({
    bucket,
    filePath,
    file,
    contentType,
  }: {
    bucket: string;
    filePath: string;
    file: Buffer;
    contentType?: string;
  }): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.resolveBucket(bucket),
        Key: filePath,
        Body: file,
        ContentType: contentType,
      }),
    );

    return filePath;
  }

  async deleteFile({
    bucket,
    path,
  }: {
    bucket: string;
    path: string;
  }): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.resolveBucket(bucket),
        Key: path,
      }),
    );
  }
}
