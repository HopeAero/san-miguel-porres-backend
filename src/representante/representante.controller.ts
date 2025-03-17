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
} from '@nestjs/common';
import { RepresentanteService } from './representante.service';
import { UpdatePersonaDto } from '@/personas/dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePersonaDto } from '@/personas/dto/create-persona.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { Representante } from './entities/representante.entity';
import { PageDto } from '@/common/dto/page.dto';

@ApiTags('Representante')
@Controller('representante')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Post() // POST /representante
  async create(@Body() createRepresentanteDto: CreatePersonaDto) {
    return await this.representanteService.create(createRepresentanteDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdatePersonaDto,
  ) {
    return await this.representanteService.update(id, updateRepresentanteDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.representanteService.findOne(id);
  }

  @Get()
  async findAll(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<Representante>> {
    return await this.representanteService.findAll(paginationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
