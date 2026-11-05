import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  name: string;
  windowMs: number;
  max: number;
}

/**
 * Rate limit in-memory sederhana (satu proses). Cukup untuk prototipe PKM;
 * untuk produksi multi-instance ganti dengan penyimpanan bersama (Redis).
 */
export function rateLimit({ name, windowMs, max }: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const key = `${name}:${req.ip ?? 'unknown'}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(max));
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan, coba lagi sebentar.' },
      });
      return;
    }

    next();
  };
}
