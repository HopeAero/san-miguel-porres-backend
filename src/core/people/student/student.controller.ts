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
import { StudentService } from './student.service';
import { StudentPersonDto } from './dto/StudentPerson.dto';

@ApiTags('Student')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() createStudentDto: CreatePersonDto) {
    return await this.studentService.create(createStudentDto);
  }

  @Get('paginate')
  async paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<StudentPersonDto>> {
    return await this.studentService.paginate(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.studentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdatePersonDto,
  ) {
    return await this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.studentService.remove(id);
  }
}
