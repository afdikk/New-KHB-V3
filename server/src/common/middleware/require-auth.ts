import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../errors/app-error';
import { verifyToken, type SessionPayload } from '../../modules/auth/auth.service';

declare module 'express-serve-static-core' {
  interface Request {
    admin?: SessionPayload;
  }
}

/**
 * Middleware penjaga rute admin.
 *
 * Token dikirim lewat header `Authorization: Bearer <token>` atau, untuk
 * kemudahan embed/iframeless, `x-admin-token`. Rute publik (chat widget,
 * formulir landing, health) tidak memakai middleware ini.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const token = bearer || (req.header('x-admin-token') ?? '').trim();

  if (token.length === 0) {
    next(unauthorized('Masuk ke panel admin terlebih dahulu'));
    return;
  }

  try {
    req.admin = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
