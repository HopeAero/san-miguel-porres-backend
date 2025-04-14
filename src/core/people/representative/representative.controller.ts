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
  async findAll(): Promise<RepresentativeDto[]> {
    return await this.representanteService.findAll();
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
