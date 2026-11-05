import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Menempelkan `requestId` unik ke setiap request (dipakai log & balasan error).
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id');
  const id = incoming && incoming.trim().length > 0 ? incoming.trim() : randomUUID();
  (req as Request & { requestId?: string }).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}
