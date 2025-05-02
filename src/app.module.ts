import { AuthModule } from '@/auth/auth.module';
import { PeopleModule } from '@/core/people/people/people.module';
import { UsersModule } from '@/users/users.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CoursesModule } from '@/core/courses/courses.module';
import { RepresentanteModule } from '@/core/people/representative/representative.module';
import { StudentModule } from '@/core/people/student/student.module';
import { EmployeeModule } from './core/people/employee/employee.module';
import { SchoolYearModule } from './core/school-year/school-year.module';
import { InscriptionsModule } from './core/inscriptions/inscriptions.module';
import { ContractsModule } from './core/contracts/contracts.module';
import { CourseSchoolYearModule } from './core/course-school-year/course-school-year.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    PeopleModule,
    StudentModule,
    RepresentanteModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    EmployeeModule,
    SchoolYearModule,
    InscriptionsModule,
    CourseSchoolYearModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware);
  }
}
