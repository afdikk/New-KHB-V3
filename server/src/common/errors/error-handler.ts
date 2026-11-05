import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import { logger } from '../utils/logger';

/** Bentuk balasan error yang seragam untuk semua endpoint. */
interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorBody = {
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} tidak tersedia`,
      requestId: (req as Request & { requestId?: string }).requestId,
    },
  };
  res.status(404).json(body);
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as Request & { requestId?: string }).requestId;

  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data yang dikirim tidak valid',
        details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        requestId,
      },
    } satisfies ErrorBody);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details, requestId },
    } satisfies ErrorBody);
    return;
  }

  logger.error({ err: error, requestId, path: req.path }, 'Kesalahan tak terduga');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server', requestId },
  } satisfies ErrorBody);
}
