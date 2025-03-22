import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCredentials } from './dto/login.dto';
import { AuthUser } from './types/AuthUser';
import { RegistrationCredentials } from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() credentials: LoginCredentials): Promise<AuthUser> {
    return this.authService.login(credentials);
  }
  @Post('register')
  async register(
    @Body() registerBody: RegistrationCredentials,
  ): Promise<AuthUser> {
    return await this.authService.register(registerBody);
  }
}
