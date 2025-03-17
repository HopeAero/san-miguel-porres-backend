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
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { PageDto } from '@/common/dto/page.dto';
import { Estudiante } from './entities/estudiante.entity';
import { PageOptionsDto } from '@/common/dto/page.option.dto';

@ApiTags('Estudiante')
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  async create(@Body() createEstudianteDto: CreatePersonaDto) {
    return await this.estudianteService.create(createEstudianteDto);
  }

  @Get('paginated')
  async findPaginated(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<Estudiante>> {
    return await this.estudianteService.findPaginated(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.estudianteService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstudianteDto: UpdatePersonaDto,
  ) {
    return await this.estudianteService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.estudianteService.remove(id);
  }
}
