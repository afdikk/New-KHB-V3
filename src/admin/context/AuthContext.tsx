import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError, api } from '../services/api';
import { AUTH_EXPIRED_EVENT, clearSession, getIdentity, getToken, saveSession, type AdminIdentity } from '../services/auth';

/**
 * Konteks sesi admin.
 *
 * Token disimpan di localStorage (`khb_admin_token`) dan dikirim otomatis oleh
 * `services/api.ts`. Bila server menolak token (401), konteks membersihkan sesi
 * dan seluruh shell admin diarahkan ke halaman masuk.
 */
interface AuthState {
  user: AdminIdentity | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState>({
  user: null,
  ready: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = (): AuthState => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminIdentity | null>(() => (getToken() ? getIdentity() : null));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Verifikasi token ke server sekali saat aplikasi dimuat.
    let active = true;
    void (async () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const me = await api.auth.me();
        if (active) {
          setUser(me);
          saveSession(getToken(), me);
        }
      } catch (error) {
        if (!active) return;
        // Hanya 401 yang berarti token benar-benar ditolak. Gangguan jaringan
        // atau server yang sedang restart tidak boleh mengeluarkan pengguna.
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          setUser(null);
        } else {
          setUser(getIdentity());
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login({ email, password });
    saveSession(result.token, result.user);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** Bungkus rute yang butuh sesi; arahkan ke halaman masuk bila belum ada. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <span className="auth-spinner" />
        Memeriksa sesi…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
