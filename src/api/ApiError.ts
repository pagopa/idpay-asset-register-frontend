import {
  RegisterErrorDTO,
  PermissionErrorDTO,
  ErrorDTO,
  UploadsErrorDTO,
} from './generated/register';

/**
 * Union type of all possible error codes defined in openapi.register.yml
 * Fully aligned with generated OpenAPI DTOs.
 */
export type RegisterPortalErrorCode =
  | RegisterErrorDTO['code']
  | PermissionErrorDTO['code']
  | ErrorDTO['code']
  | UploadsErrorDTO['code'];

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: RegisterPortalErrorCode;
  public readonly details?: unknown;

  constructor(status: number, message: string, code?: RegisterPortalErrorCode, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
