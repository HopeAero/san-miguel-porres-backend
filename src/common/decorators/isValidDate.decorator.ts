import { registerDecorator, ValidationOptions } from 'class-validator';
import { DateTime } from 'luxon';

export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: '$property debe ser una fecha válida',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          // Verificamos que el valor sea una cadena
          if (typeof value !== 'string') {
            return false;
          }

          // Intentamos crear un objeto DateTime con Luxon
          const dt = DateTime.fromISO(value);

          // Verificamos si la fecha es válida
          return dt.isValid;
        },
      },
    });
  };
}
