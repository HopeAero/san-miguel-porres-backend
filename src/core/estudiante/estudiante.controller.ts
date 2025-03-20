import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreatePersonaDto } from '@/core/personas/dto/create-persona.dto';
import { UpdatePersonaDto } from '@/core/personas/dto/update-persona.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageDto } from '@/common/dto/page.dto';
import { Estudiante } from './entities/estudiante.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role';

@ApiTags('Estudiante')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Post()
  async create(@Body() createEstudianteDto: CreatePersonaDto) {
    return await this.estudianteService.create(createEstudianteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('paginated')
  async findPaginated(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<Estudiante>> {
    return await this.estudianteService.findPaginated(paginationDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.estudianteService.findOne(id);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstudianteDto: UpdatePersonaDto,
  ) {
    return await this.estudianteService.update(id, updateEstudianteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.estudianteService.remove(id);
  }
}
