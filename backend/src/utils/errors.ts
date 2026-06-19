// Custom error class to pass readable error codes to controllers
export class ServiceError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
