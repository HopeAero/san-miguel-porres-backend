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
import { PageOptionsDto } from '@/common/dto/page.option.dto';

@Controller('employee') // Base route for all endpoints
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post() // POST /employee
  create(@Body() createEmpleadoDto: CreateEmployeeDTO) {
    return this.employeeService.create(createEmpleadoDto); // Call service to create
  }

  @Put(':id') // PUT /employee/:id
  update(
    @Param('id') id: number,
    @Body() updateEmpleadoDto: CreateEmployeeDTO,
  ) {
    return this.employeeService.update(id, updateEmpleadoDto); // Call service to update
  }

  @Get(':id') // GET /employee/:id
  findOne(@Param('id') id: number) {
    return this.employeeService.findOne(id); // Call service to find one
  }

  @Get() // GET /employee
  paginate(@Query() paginationDto: PageOptionsDto) {
    return this.employeeService.paginate(paginationDto); // Call service to paginate employees
  }

  @Delete(':id') // DELETE /employee/:id
  remove(@Param('id') id: number) {
    return this.employeeService.remove(id); // Call service to soft-delete
  }
}
