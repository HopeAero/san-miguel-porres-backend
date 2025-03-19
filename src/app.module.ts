import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { EstudianteModule } from './estudiante/estudiante.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PersonasModule } from './personas/personas.module';
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
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware);
  }
}
