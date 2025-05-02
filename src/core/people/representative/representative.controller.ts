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
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RepresentanteService } from './representative.service';
import { RepresentativeDto } from './dto/representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { CreateRepresentativeDto } from './dto/create-representative.dto';

@ApiTags('Representative')
@Controller('representative')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class RepresentativeController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Post() // POST /representative
  async create(@Body() createRepresentanteDto: CreateRepresentativeDto) {
    return await this.representanteService.create(createRepresentanteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los representantes para selectores',
    description:
      'Retorna todos los representantes activos sin paginar, opcionalmente filtrados por término de búsqueda y con límite',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de representantes',
    type: [RepresentativeDto],
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    description: 'Filtrar por nombre, apellido o cédula (opcional)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limitar la cantidad de resultados (opcional)',
  })
  @ApiQuery({
    name: 'forceItemsIds',
    required: false,
    type: String,
    description:
      'IDs de representantes que deben incluirse siempre, separados por coma (opcional)',
  })
  async findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query(
      'limit',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    limit?: number | null,
    @Query('forceItemsIds') forceItemsIds?: string | null,
  ): Promise<RepresentativeDto[]> {
    // Construimos manualmente el objeto SearchRepresentativeDto para mantener compatibilidad
    const searchDto = {
      searchTerm,
      limit,
      forceItemsIds,
    };

    return await this.representanteService.findAll(searchDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('paginate')
  async paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    return await this.representanteService.paginate(paginationDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':name')
  async findByName(@Param('name') name: string) {
    return await this.representanteService.findByName(name);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':dni')
  async findByDocument(@Param('dni') dni: string) {
    return await this.representanteService.findByDocument(dni);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('search')
  async searchRepresentatives(@Query('term') term: string) {
    return await this.representanteService.searchRepresentatives(term);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.representanteService.findOne(id);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdateRepresentativeDto,
  ) {
    return await this.representanteService.update(id, updateRepresentanteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
