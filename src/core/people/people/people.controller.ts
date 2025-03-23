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
import { PeopleService } from './people.service';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { PageDto } from '@/common/dto/page.dto';
import { Person } from './entities/person.entity';
import { Role } from '@/common/enum/role';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Persona')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('people')
export class PersonasController {
  constructor(private readonly personasService: PeopleService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get()
  async findAll(): Promise<Person[]> {
    return await this.personasService.findAll();
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('paginate')
  async paginate(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Person>> {
    return await this.personasService.paginate(pageOptionsDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Person> {
    return await this.personasService.findOne(id);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonDto,
  ) {
    return await this.personasService.update(id, updatePersonaDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.personasService.remove(id);
  }
}
