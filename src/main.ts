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
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import envConfig from './config/environment';
import { RootUserInitService } from './core/users/root-user-init.service';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Inicializar usuario root
  try {
    const rootUserInitService = app.get(RootUserInitService);
    await rootUserInitService.initializeRootUser();
  } catch (error) {
    console.error('Error al inicializar usuario root:', error);
  }

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

  // Registrar el filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

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
    .addTag('Contract')
    .build();

  try {
    console.log('Creando documento de Swagger...');
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    console.log('Documento de Swagger creado exitosamente');

    console.log('Configurando Swagger UI...');
    SwaggerModule.setup('docs', app, documentFactory);
    console.log('Swagger UI configurado exitosamente');
  } catch (error) {
    console.error('Error al configurar Swagger:', error);
    console.error('Stack trace:', error.stack);
  }

  await app.listen(PORT);

  console.log(`Servidor corriendo en el puerto: ${PORT}`);
}
bootstrap();
