import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RepresentanteService } from './representante.service';
import { UpdatePersonaDto } from '@/core/personas/dto/update-persona.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePersonaDto } from '@/core/personas/dto/create-persona.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { Representante } from './entities/representante.entity';
import { PageDto } from '@/common/dto/page.dto';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';

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
  ): Promise<PageDto<Representante>> {
    return await this.representanteService.findAll(paginationDto);
  }
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
