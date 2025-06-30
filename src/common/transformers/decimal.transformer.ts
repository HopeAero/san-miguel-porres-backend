import Decimal from 'decimal.js';
import { ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  to(decimal?: Decimal): string {
    if (!decimal) {
      return '0';
    }
    return decimal.toString();
  }

  from(decimal: string): Decimal {
    if (!decimal || decimal === null || decimal === undefined) {
      return new Decimal(0);
    }
    return new Decimal(decimal);
  }
}

export function decimalToString({ value }: { value: Decimal }): string {
  return value?.toFixed(0) || '0';
}
