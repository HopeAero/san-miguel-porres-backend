interface StatusErrorOptions {
  message: string;
  statusCode: number;
}

export class StatusError extends Error {
  readonly statusCode: number;

  constructor({ message, statusCode }: StatusErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'StatusError';
  }

  getStatus(): number {
    return this.statusCode;
  }
}
