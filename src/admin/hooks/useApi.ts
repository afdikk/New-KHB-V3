import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/api';

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Pemuat data sederhana: panggil `loader` saat mount / saat `deps` berubah,
 * sediakan `reload()` untuk memuat ulang setelah aksi (simpan/hapus).
 */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<ResourceState<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      // Satu percobaan ulang untuk gangguan sesaat (backend baru restart,
      // koneksi putus sebentar). Kegagalan nyata tetap dilaporkan apa adanya.
      const transient = error instanceof ApiError && (error.status === 0 || error.status >= 500);
      if (transient) {
        await new Promise((resolve) => setTimeout(resolve, 1_200));
        try {
          const retry = await loaderRef.current();
          setState({ data: retry, loading: false, error: null });
          return retry;
        } catch (retryError) {
          const retryMessage =
            retryError instanceof Error && retryError.message.length > 0
              ? retryError.message
              : 'Terjadi kesalahan saat memuat data.';
          setState({ data: null, loading: false, error: retryMessage });
          return null;
        }
      }

      const message =
        error instanceof Error && error.message.length > 0
          ? error.message
          : 'Terjadi kesalahan saat memuat data.';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload };
}

/** Format tanggal ringkas ala panel: "Hari ini, 10:42" / "12 Jun 2025". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86_400_000);
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (sameDay) return `Hari ini, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Kemarin, ${time}`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Jarak waktu relatif: "2 mnt", "3 j", "5 h". */
export function timeAgo(value: string | null | undefined): string {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '—';
  const minutes = Math.max(0, Math.round(diff / 60_000));
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} j`;
  return `${Math.round(hours / 24)} h`;
}

/** Inisial nama untuk avatar, mis. "Rina Amelia" → "RA". */
export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
