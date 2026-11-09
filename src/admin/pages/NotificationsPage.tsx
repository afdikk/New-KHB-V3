import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { api, type NotificationRow } from '../services/api';
import { timeAgo, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import {
  IconAlert,
  IconBell,
  IconChat,
  IconCheckCircle,
  IconDocument,
  IconLink,
  IconRefresh,
  IconSettings,
} from '../components/ui/Icons';

/** Ikon per jenis notifikasi (menggantikan emoji agar konsisten dengan UI). */
const TYPE_ICON: Record<NotificationRow['type'], ComponentType<{ className?: string }>> = {
  chat: IconChat,
  knowledge: IconDocument,
  system: IconSettings,
  channel: IconLink,
};

/** Kelompokkan notifikasi ke "Hari ini", "Kemarin", lalu tanggal. */
function dayBucket(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86_400_000);

  if (diffDays <= 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NotificationsPage() {
  const notify = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'chat'>('all');

  const { data, loading, error, reload } = useResource(() => api.notifications.list(), []);
  const all = data?.rows ?? [];
  const unread = data?.unread ?? 0;

  const rows = all.filter((row) => {
    if (filter === 'unread') return !row.isRead;
    if (filter === 'system') return row.type === 'system' || row.type === 'knowledge';
    if (filter === 'chat') return row.type === 'chat' || row.type === 'channel';
    return true;
  });

  /** Notifikasi dikelompokkan per hari, urutan tetap sesuai data server. */
  const grouped = useMemo(() => {
    const buckets: Array<{ label: string; items: NotificationRow[] }> = [];
    rows.forEach((row) => {
      const label = dayBucket(row.createdAt);
      const last = buckets[buckets.length - 1];
      if (last && last.label === label) last.items.push(row);
      else buckets.push({ label, items: [row] });
    });
    return buckets;
  }, [rows]);

  const markAll = async () => {
    try {
      const result = await api.notifications.markAllRead();
      notify(`${result.updated} notifikasi ditandai sudah dibaca`);
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menandai notifikasi');
    }
  };

  const open = async (row: NotificationRow) => {
    if (row.isRead) return;
    try {
      await api.notifications.markRead(row.id);
      await reload();
    } catch {
      notify('Gagal memperbarui notifikasi');
    }
  };

  return (
    <section className="view active" id="view-notifications">
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Pusat Notifikasi</span>
          <h1>Notifikasi</h1>
          <p className="m-sub">Pantau aktivitas terbaru dan pembaruan sistem.</p>
        </div>
        <div className="m-head-actions">
          <button className="m-btn m-btn-ghost" type="button" onClick={() => void reload()} disabled={loading}>
            <IconRefresh />
            Muat ulang
          </button>
          <button className="m-btn m-btn-primary" type="button" onClick={() => void markAll()} disabled={unread === 0}>
            <IconCheckCircle />
            Tandai semua dibaca
          </button>
        </div>
      </div>

      <div className="m-card">
        <div className="m-toolbar">
          <div className="m-segmented" role="tablist" aria-label="Filter notifikasi">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={filter === 'all' ? 'is-active' : ''}
              onClick={() => setFilter('all')}
            >
              Semua <span className="m-count">{all.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'unread'}
              className={filter === 'unread' ? 'is-active' : ''}
              onClick={() => setFilter('unread')}
            >
              Belum dibaca <span className="m-count">{unread}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'system'}
              className={filter === 'system' ? 'is-active' : ''}
              onClick={() => setFilter('system')}
            >
              Sistem
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'chat'}
              className={filter === 'chat' ? 'is-active' : ''}
              onClick={() => setFilter('chat')}
            >
              Chat
            </button>
          </div>

          <span style={{ fontSize: 12, color: 'var(--m-text-3)' }}>
            {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
          </span>
        </div>

        <div className="m-feed">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="m-feed-day">{group.label}</div>
              {group.items.map((row) => {
                const Icon = TYPE_ICON[row.type] ?? IconBell;
                return (
                  <button
                    key={row.id}
                    type="button"
                    className={`m-notif${row.isRead ? '' : ' is-unread'}`}
                    onClick={() => void open(row)}
                  >
                    <span className={`m-notif-icon ${row.type}`}>
                      <Icon />
                    </span>
                    <span className="m-notif-body">
                      <span className="m-notif-title">{row.title}</span>
                      <p className="m-notif-desc">{row.description}</p>
                    </span>
                    <span className="m-notif-side">
                      <span className="m-notif-time">{timeAgo(row.createdAt)}</span>
                      {row.isRead ? null : <span className="m-notif-dot" aria-label="Belum dibaca" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {error ? (
            <div className="m-alert">
              <IconAlert />
              <span>{error}</span>
              <button className="m-btn m-btn-ghost m-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => void reload()}>
                Coba lagi
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="m-empty">
              <span className="m-empty-icon"><IconRefresh /></span>
              <strong>Memuat notifikasi…</strong>
            </div>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="m-empty">
              <span className="m-empty-icon"><IconBell /></span>
              <strong>Tidak ada notifikasi</strong>
              <p>
                {filter === 'unread'
                  ? 'Semua notifikasi sudah Anda baca. Kerja bagus!'
                  : 'Belum ada aktivitas pada filter ini.'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
