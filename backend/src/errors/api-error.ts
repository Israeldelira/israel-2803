export interface FieldError {
  field: string;
  messages: string[];
}

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly errors?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}