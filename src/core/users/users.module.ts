import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccessControlService } from '@/auth/strategy/access-control-service';
import { RootUserInitService } from './root-user-init.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, AccessControlService, RootUserInitService],
  exports: [UsersService, RootUserInitService],
})
export class UsersModule {}
