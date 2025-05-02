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
  Response,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';
import { StudentDto } from './dto/student';
import * as express from 'express';

@ApiTags('Student')
@Controller('student')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    return await this.studentService.create(createStudentDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda para filtrar por nombre, apellido o cédula' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados a devolver' })
  @ApiQuery({ name: 'ids', required: false, description: 'IDs específicos de estudiantes a incluir (separados por comas)' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes encontrados' })
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('ids') ids?: string,
  ): Promise<StudentDto[]> {
    return await this.studentService.findAllWithFilters(search, limit, ids);
  }

  @Get('paginate')
  async paginate(
    @Query() paginationDto: PageOptionsDto,
  ): Promise<PageDto<StudentDto>> {
    return await this.studentService.paginate(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.studentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Response() res: express.Response,
  ) {
    const result = await this.studentService.remove(id);

    if (result === 1) {
      return res.status(200).json({
        message: 'Estudiante eliminado correctamente',
      });
    } else {
      return res.status(404).json({
        message: 'Estudiante no encontrado',
      });
    }
  }
}
