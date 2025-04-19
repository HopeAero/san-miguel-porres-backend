import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Response,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { UserDTO } from './dto/user.dto';
import * as express from 'express';
import { STATUS } from '@/common/constants';

@Controller('users')
@Roles(Role.ADMIN)
@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get('all')
  async findAll(): Promise<UserDTO[]> {
    return await this.usersService.findAll();
  }

  @Get('paginate')
  async paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<UserDTO>> {
    return await this.usersService.paginate(paginationDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Response() res: express.Response,
  ) {
    const user = await this.usersService.findOneById(id);

    if (user) {
      delete user.password;

      return res.status(200).json({
        user,
      });
    }

    return res.status(STATUS.NOT_FOUND).json({
      message: `Usuario no encontrado`,
    });
  }
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Response() res: express.Response,
  ) {
    const result = await this.usersService.remove(id);

    if (result.affected === 1) {
      return res.status(200).json({
        message: 'Usuario eliminado correctamente',
      });
    } else {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }
  }
}
