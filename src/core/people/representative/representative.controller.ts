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
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { UpdatePersonDto } from '../people/dto/update-person.dto';
import { RepresentanteService } from './representative.service';
import { RepresentativeDto } from './dto/representative.dto';

@ApiTags('Representative')
@Controller('representative')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class RepresentativeController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Post() // POST /representative
  async create(@Body() createRepresentanteDto: CreatePersonDto) {
    return await this.representanteService.create(createRepresentanteDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepresentanteDto: UpdatePersonDto,
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
  async paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<RepresentativeDto>> {
    return await this.representanteService.paginate(paginationDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.representanteService.remove(id);
  }
}
