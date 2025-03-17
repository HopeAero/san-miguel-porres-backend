import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleGuard } from '@/auth/guards/roles.guard';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('users')
@Roles(Role.ADMIN)
@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
