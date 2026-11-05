import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Bungkus handler async agar error-nya diteruskan ke error-handler Express 5.
 * Express 5 sudah menangani promise rejection, tapi pembungkus ini membuat
 * perilakunya sama di semua versi dan aman dipakai di `tsx watch`.
 */
export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

/** Balasan sukses seragam: `{ data, meta? }`. */
export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ data });
}

export function created<T>(res: Response, data: T): void {
  ok(res, data, 201);
}

export function paginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; perPage: number; total: number },
): void {
  res.json({
    data,
    meta: { ...meta, totalPages: Math.max(1, Math.ceil(meta.total / meta.perPage)) },
  });
}
