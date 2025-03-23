import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Response,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PageOptionsDto } from '@/common/dto/page.option.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtGuard } from '@/core/auth/guards/jwt.guard';
import { Role } from '@/common/enum/role';
import * as express from 'express';

@ApiTags('Employee')
@Controller('employee')
@Roles(Role.MODERATOR, Role.ADMIN)
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post() // POST /employee
  async create(@Body() createEmpleadoDto: CreateEmployeeDTO) {
    return await this.employeeService.create(createEmpleadoDto); // Call service to create
  }

  @Put(':id') // PUT /employee/:id
  async update(
    @Param('id') id: number,
    @Body() updateEmpleadoDto: UpdateEmployeeDTO,
    @Response() res: express.Response,
  ) {
    await this.employeeService.update(id, updateEmpleadoDto);

    return res.status(200).json({
      message: 'Empleado actualizado correctamente',
    });
  }

  @Get(':id') // GET /employee/:id
  async findOne(@Param('id') id: number) {
    return await this.employeeService.findOne(id); // Call service to find one
  }

  @Get() // GET /employee
  async paginate(@Query() paginationDto: PageOptionsDto) {
    return await this.employeeService.paginate(paginationDto); // Call service to paginate employees
  }

  @Delete(':id') // DELETE /employee/:id
  async remove(@Param('id') id: number) {
    return await this.employeeService.remove(id); // Call service to soft-delete
  }
}
