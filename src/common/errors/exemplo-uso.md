# Ejemplos de uso del manejo de errores

## Forma simplificada (recomendada)

Con el filtro global de excepciones, puedes simplemente lanzar errores en tu código y estos serán manejados automáticamente.

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { StatusError } from '../../common';
import { STATUS } from '../../common/constants';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // No necesitas @Res() ni try/catch
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findById(+id);
    
    if (!product) {
      // Este error será capturado automáticamente por HttpExceptionFilter
      throw new StatusError({
        message: `Producto con ID ${id} no encontrado`,
        statusCode: STATUS.NOT_FOUND
      });
    }
    
    return product; // NestJS devolverá esta respuesta automáticamente
  }
}
```

## Ejemplo: Lanzando diferentes tipos de errores

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StatusError } from '../../common';
import { STATUS } from '../../common/constants';

@Injectable()
export class ExampleService {
  // 1. Usando StatusError personalizado
  async findItem(id: number) {
    const item = await this.repository.findOne(id);
    
    if (!item) {
      throw new StatusError({
        message: `El elemento con ID ${id} no fue encontrado`,
        statusCode: STATUS.NOT_FOUND
      });
    }
    
    return item;
  }
  
  // 2. Usando excepciones propias de NestJS
  async getUser(id: number) {
    const user = await this.usersRepository.findOne(id);
    
    if (!user) {
      // También puedes usar las excepciones estándar de NestJS
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return user;
  }
  
  // 3. Validación con excepciones de NestJS
  async validateData(data: any) {
    if (!data.requiredField) {
      throw new BadRequestException('Campo requerido no proporcionado');
    }
    
    return true;
  }
}
```

## Ejemplo: Errores con detalles de validación

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { StatusError, SchemaError } from '../../common';
import { STATUS } from '../../common/constants';

@Controller('example')
export class ExampleController {
  @Post()
  async create(@Body() createDto: any) {
    // Validación manual
    const errors: SchemaError[] = [];
    
    if (!createDto.name) {
      errors.push({ field: 'name', message: 'El nombre es requerido' });
    }
    
    if (!createDto.email) {
      errors.push({ field: 'email', message: 'El correo es requerido' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createDto.email)) {
      errors.push({ field: 'email', message: 'Formato de correo inválido' });
    }
    
    if (errors.length > 0) {
      // Lanzar un error con detalles
      throw new StatusError({
        message: 'Error de validación',
        statusCode: STATUS.BAD_REQUEST
      });
      // El filtro detectará los detalles y los incluirá en la respuesta
    }
    
    // Procesar la solicitud...
    const result = await this.service.create(createDto);
    return result;
  }
} 