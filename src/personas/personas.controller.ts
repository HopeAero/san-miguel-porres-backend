import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { Persona } from './entities/persona.entity';

@ApiTags('Persona')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}
  @Get()
  async findAll(): Promise<Persona[]> {
    return await this.personasService.findAll();
  }

  @Get('paginated')
  async findAllPaginated(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Persona>> {
    return await this.personasService.findAllPaginated(pageOptionsDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Persona> {
    return await this.personasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return await this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.personasService.remove(id);
  }
}
