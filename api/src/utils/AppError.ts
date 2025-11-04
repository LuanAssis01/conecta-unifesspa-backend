export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);
  }
}
