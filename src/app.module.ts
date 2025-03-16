import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { PersonasModule } from './personas/personas.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { RepresentanteModule } from './representante/representante.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    PersonasModule,
    EstudianteModule,
    RepresentanteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
