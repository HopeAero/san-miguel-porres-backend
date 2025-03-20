import { Roles } from '@/common/decorators/roles.decorator';
import { PageDto } from '@/common/dto/page.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { Role } from '@/common/enum/role';
import { JwtGuard } from '@/core/auth/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePersonaDto } from '../people/dto/create-person.dto';
import { UpdatePersonaDto } from '../people/dto/update-person.dto';
import { RepresentanteService } from './representante.service';
import { RepresentantePersona } from './dto/RepresentantePersona.dto';

@ApiTags('Representante')
@Controller('representante')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Post() // POST /representante
  async create(@Body() createRepresentanteDto: CreatePersonaDto) {
    return await this.representanteService.create(createRepresentanteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdatePersonaDto,
  ) {
    return await this.representanteService.update(id, updateRepresentanteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.representanteService.findOne(id);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get()
  async findAll(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<RepresentantePersona>> {
    return await this.representanteService.findAll(paginationDto);
  }
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
