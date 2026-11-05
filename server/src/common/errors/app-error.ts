/**
 * Error aplikasi dengan status HTTP eksplisit.
 * Semua error yang kita lempar sendiri memakai kelas ini supaya error-handler
 * bisa membedakan kesalahan klien (4xx) dari bug server (5xx).
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(message, 400, 'BAD_REQUEST', details);

export const unauthorized = (message = 'Tidak terautentikasi') =>
  new AppError(message, 401, 'UNAUTHORIZED');

export const notFound = (message = 'Data tidak ditemukan') =>
  new AppError(message, 404, 'NOT_FOUND');

export const conflict = (message: string) => new AppError(message, 409, 'CONFLICT');

export const unprocessable = (message: string, details?: unknown) =>
  new AppError(message, 422, 'UNPROCESSABLE', details);
