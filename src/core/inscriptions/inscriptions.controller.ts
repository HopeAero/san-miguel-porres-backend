import { Controller, Get } from '@nestjs/common';
// import { InscriptionsService } from './inscriptions.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Inscriptions')
@Controller('inscriptions')
export class InscriptionsController {
  // constructor(private readonly inscriptionsService: InscriptionsService) {}

  @Get()
  findAll() {
    return { message: 'Módulo de inscripciones en construcción' };
  }
}
