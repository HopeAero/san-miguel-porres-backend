import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import envConfig from '@/config/environment';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AccessControlService } from './strategy/access-control-service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: envConfig.JWT_SECRET,
        signOptions: {
          expiresIn: envConfig.JWT_EXPIRES_IN,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, AccessControlService],
  exports: [AuthService, JwtModule, AccessControlService],
})
export class AuthModule {}
