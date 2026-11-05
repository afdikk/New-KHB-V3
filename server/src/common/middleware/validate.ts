import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Validasi request dengan skema Zod, hasil parse disimpan ke `req.validated`.
 * Sama seperti `common/middleware/validate.ts` pada backend omnicare.
 */
export function validate<T>(schema: ZodType<T>, part: RequestPart = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(result.error);
      return;
    }
    const bag = (req as Request & { validated?: Record<string, unknown> }).validated ?? {};
    bag[part] = result.data;
    (req as Request & { validated?: Record<string, unknown> }).validated = bag;
    next();
  };
}

/** Ambil hasil validasi yang sudah dijamin ada oleh middleware `validate`. */
export function validated<T>(req: Request, part: RequestPart = 'body'): T {
  const bag = (req as Request & { validated?: Record<string, unknown> }).validated;
  return bag?.[part] as T;
}
