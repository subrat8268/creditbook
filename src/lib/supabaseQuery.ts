/**
 * Normalized error thrown by every API function in this project.
 * Extends Error so existing `err.message` usage in hooks and UI is unchanged.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: string;
  readonly hint: string;

  constructor(
    code: string,
    message: string,
    status: number,
    details = "",
    hint = "",
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.hint = hint;
  }
}

/** Maps well-known Postgres / PostgREST error codes to HTTP status codes. */
const PG_STATUS: Record<string, number> = {
  "23505": 409, // unique_violation
  "23503": 422, // foreign_key_violation
  "23514": 422, // check_violation
  "42501": 403, // insufficient_privilege (RLS)
  PGRST301: 401, // JWT expired
  PGRST302: 401, // JWT invalid
};

/** Minimal type matching @supabase/postgrest-js PostgrestError. */
interface RawPostgrestError {
  message: string;
  code: string;
  details: string;
  hint: string;
}

export function toApiError(err: RawPostgrestError): ApiError {
  const status = PG_STATUS[err.code] ?? 500;
  return new ApiError(err.code, err.message, status, err.details, err.hint);
}
