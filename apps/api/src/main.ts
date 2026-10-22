import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json, raw, urlencoded, type Request, type Response } from 'express';
import { AppModule } from './modules/app.module';

let cachedApp: INestApplication | null = null;

const isServeless = process.env.IS_SERVELESS === 'true';
const isProduction = process.env.NODE_ENV === 'production';

/** Path do webhook Stripe — body deve permanecer bytes exatos (HMAC). */
const STRIPE_WEBHOOK_PATH = '/subscription/webhook';

export async function createApp(): Promise<INestApplication> {
  // Cache da app APENAS em produção serverless
  // Em dev, sempre recria para permitir hot reload
  if (cachedApp && isProduction) {
    return cachedApp;
  }

  // bodyParser: false — registramos parsers manualmente para o webhook
  // receber Buffer bruto (Nest rawBody:true sozinho falha na Vercel: o JSON
  // é re-serializado e o constructEvent rejeita a assinatura).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const http = app.getHttpAdapter().getInstance();

  // raw ANTES do json — só nesta rota; req.body vira Buffer
  http.use(
    STRIPE_WEBHOOK_PATH,
    raw({ type: 'application/json', limit: '10mb' }),
  );
  http.use(json({ limit: '10mb' }));
  http.use(urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe());

  http.set('trust proxy', true);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  await app.init();

  if (isProduction) {
    cachedApp = app;
  }

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

if (!isServeless) {
  void bootstrap();
}

/** Impede o @vercel/node de parsear o body (quebra assinatura Stripe). */
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: Request, res: Response) {
  const app = await createApp();
  return app.getHttpAdapter().getInstance().handle(req, res);
}
