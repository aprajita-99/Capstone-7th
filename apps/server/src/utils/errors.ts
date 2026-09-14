// utils/errors.ts
export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public code: string = "INTERNAL_ERROR") {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
