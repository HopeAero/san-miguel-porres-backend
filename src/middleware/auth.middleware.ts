import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const bearerIndex = authHeader.indexOf('Bearer');
      const token = authHeader.substring(bearerIndex + 7);

      try {
        verify(token, process.env.JWT_SECRET);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new HttpException(
          'Token de acceso inválido',
          HttpStatus.FORBIDDEN,
        );
      }

      next();
    } else {
      throw new HttpException(
        'Token de acceso no encontrado',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
