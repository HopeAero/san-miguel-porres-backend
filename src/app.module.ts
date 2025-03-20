import { AuthModule } from '@/auth/auth.module';
import { PersonasModule } from '@/people/personas/personas.module';
import { UsersModule } from '@/users/users.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { AuthMiddleware } from './middleware/auth.middleware';
import { RepresentanteModule } from './peopleModule/representante/representante.module';
import { StudentModule } from './peopleModule/student/student.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    PersonasModule,
    StudentModule,
    RepresentanteModule,
    AuthModule,
    UsersModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware);
  }
}
