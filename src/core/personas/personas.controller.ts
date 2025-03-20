import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { Persona } from './entities/persona.entity';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Persona')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get()
  async findAll(): Promise<Persona[]> {
    return await this.personasService.findAll();
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('paginated')
  async findAllPaginated(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Persona>> {
    return await this.personasService.findAllPaginated(pageOptionsDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Persona> {
    return await this.personasService.findOne(id);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return await this.personasService.update(id, updatePersonaDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.personasService.remove(id);
  }
}
