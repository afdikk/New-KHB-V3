import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { rateLimit } from '../../common/middleware/rate-limit';
import { authenticate, currentAdmin, issueToken } from './auth.service';
import { requireAuth } from '../../common/middleware/require-auth';

/** Rute autentikasi panel admin. */
export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().min(3).max(190),
  password: z.string().min(6).max(200),
});

/** POST /api/v1/auth/login — tukar email+sandi dengan token sesi. */
authRouter.post(
  '/login',
  rateLimit({ name: 'login', windowMs: 60_000, max: 10 }),
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const body = validated<{ email: string; password: string }>(req);
    const user = authenticate(body.email, body.password);
    const { token, expiresAt } = issueToken(user);
    ok(res, { token, expiresAt, user });
  }),
);

/** GET /api/v1/auth/me — profil admin dari token yang dipakai. */
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (_req, res) => {
    ok(res, currentAdmin());
  }),
);
