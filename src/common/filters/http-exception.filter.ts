import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '../errors';
import { StatusError } from '../errors/status-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. Manejo de StatusError personalizados
    if (exception instanceof StatusError) {
      return errorResponse(response, exception.getStatus(), exception.message);
    }

    // 2. Manejo de excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Comprobación para status 403 - FORBIDDEN
      if (status === HttpStatus.FORBIDDEN) {
        // Si es "Forbidden resource", lo reemplazamos con "Acceso prohibido"
        const message =
          typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse
            ? exceptionResponse['message']
            : exception.message;

        if (message === 'Forbidden resource') {
          return errorResponse(
            response,
            status,
            'No tienes permisos para acceder a este recurso',
          );
        }

        return errorResponse(
          response,
          status,
          typeof message === 'string'
            ? message
            : 'No tienes permisos para acceder a este recurso',
        );
      }

      // Errores de validación (ValidationPipe)
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const message = exceptionResponse['message'];

        console.log('message', message);

        // Array de mensajes de error (convertir a formato SchemaError)
        if (Array.isArray(message)) {
          const details = message.map((msg) => {
            // Extraer solo el nombre del campo del mensaje de error
            // Ejemplos típicos:
            // "name should not be empty" -> extraer "name"
            // "email must be a string" -> extraer "email"
            const fieldMatch = msg.match(/^([a-zA-Z0-9_.]+)/);
            const field = fieldMatch ? fieldMatch[1] : 'unknown';

            return {
              field: field,
              message: msg,
            };
          });

          return errorResponse(
            response,
            status,
            details?.[0]?.message ||
              'Ha ocurrido un error al validar los datos',
            details,
          );
        }

        return errorResponse(
          response,
          status,
          typeof message === 'string' ? message : 'Error de solicitud',
        );
      }

      return errorResponse(response, status, exception.message);
    }

    // 3. Manejo de excepciones específicas de NestJS
    if (exception instanceof BadRequestException) {
      return errorResponse(response, HttpStatus.BAD_REQUEST, exception.message);
    }

    if (exception instanceof NotFoundException) {
      return errorResponse(response, HttpStatus.NOT_FOUND, exception.message);
    }

    // 4. Manejo de errores de base de datos
    const error = exception as any;
    if (error?.detail !== undefined) {
      return errorResponse(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.detail,
      );
    }

    // 5. Error por defecto
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error?.message || 'Error interno del servidor';

    return errorResponse(
      response,
      statusCode,
      typeof message === 'string' ? message : 'Error interno del servidor',
    );
  }
}
