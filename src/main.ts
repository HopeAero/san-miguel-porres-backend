import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AppModule } from './app.module';
import { CORS } from './common';
import envConfig from './config/environment';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = envConfig.PORT || 8000;

  app.set('trust proxy', true);

  app.setGlobalPrefix('api/v1');

  app.enableCors(CORS);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Sistema de Gestion Escolar')
    .setDescription('API para el sistema de gestion escolar')
    .setContact(
      'Emmanuel David Salcedo Gonzalez',
      '',
      'davidsalcedo388@gmail.com',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Persona')
    .addTag('Student')
    .addTag('Representative')
    .addTag('Courses')
    .addTag('SchoolarYear')
    .addTag('Employee')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(PORT);

  console.log(`Servidor corriendo en el puerto: ${PORT}`);
}
bootstrap();
