/**
 * Penyimpanan token sesi admin di sisi klien.
 *
 * Token berasal dari `POST /api/v1/auth/login` dan dikirim pada setiap
 * permintaan admin sebagai `Authorization: Bearer <token>`.
 */
const TOKEN_KEY = 'khb_admin_token';
const USER_KEY = 'khb_admin_user';

export interface AdminIdentity {
  email: string;
  name: string;
  role: 'admin';
}

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function getIdentity(): AdminIdentity | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminIdentity) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AdminIdentity): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage penuh/diblokir — sesi tetap hidup di memori sampai reload
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // abaikan
  }
}

/** Sinyal agar shell admin kembali ke halaman masuk saat token ditolak. */
export const AUTH_EXPIRED_EVENT = 'khb:auth-expired';

export function notifyAuthExpired(): void {
  clearSession();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
