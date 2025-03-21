import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PaginationEmployeeDto } from './dto/pagination-employee.dto';

@Controller('empleado') // Base route for all endpoints
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post() // POST /empleado
  create(@Body() createEmpleadoDto: CreateEmployeeDTO) {
    return this.employeeService.create(createEmpleadoDto); // Call service to create
  }

  @Put(':id') // PUT /empleado/:id
  update(
    @Param('id') id: number,
    @Body() updateEmpleadoDto: CreateEmployeeDTO,
  ) {
    return this.employeeService.update(id, updateEmpleadoDto); // Call service to update
  }

  @Get(':id') // GET /empleado/:id
  findOne(@Param('id') id: number) {
    return this.employeeService.findOne(id); // Call service to find one
  }

  @Get() // GET /empleado
  findAll(@Query() paginationDto: PaginationEmployeeDto) {
    return this.employeeService.findAll(paginationDto); // Call service to find all with pagination
  }

  @Delete(':id') // DELETE /empleado/:id
  remove(@Param('id') id: number) {
    return this.employeeService.remove(id); // Call service to soft-delete
  }
}
