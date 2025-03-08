import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CORS } from './common';
import { NestExpressApplication } from '@nestjs/platform-express';
import envConfig from './config/environment';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = envConfig.PORT || 8000;

  app.set('trust proxy', true);

  app.setGlobalPrefix('api/v1');

  app.enableCors(CORS);

  await app.listen(PORT);

  console.log(`Servidor corriendo en el puerto: ${PORT}`);
}
bootstrap();
