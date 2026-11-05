import { useState } from 'react';
import { api, type NotificationRow } from '../services/api';
import { timeAgo, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

const TYPE_ICON: Record<NotificationRow['type'], string> = {
  chat: '💬',
  knowledge: '📄',
  system: '⚙️',
  channel: '🔗',
};

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
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PUSAT NOTIFIKASI</div>
          <h1>Notifikasi</h1>
          <p className="subheading">Pantau aktivitas terbaru dan pembaruan sistem.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void markAll()} disabled={unread === 0}>
          Tandai semua dibaca
        </button>
      </div>

      <div className="notif-tabs">
        <button className={`notif-tab${filter === 'all' ? ' selected' : ''}`} onClick={() => setFilter('all')}>
          Semua <span className="notif-tab-count">{all.length}</span>
        </button>
        <button className={`notif-tab${filter === 'unread' ? ' selected' : ''}`} onClick={() => setFilter('unread')}>
          Belum dibaca <span className="notif-tab-count unread">{unread}</span>
        </button>
        <button className={`notif-tab${filter === 'system' ? ' selected' : ''}`} onClick={() => setFilter('system')}>Sistem</button>
        <button className={`notif-tab${filter === 'chat' ? ' selected' : ''}`} onClick={() => setFilter('chat')}>Chat</button>
      </div>

      <div className="notif-list">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            className={`notif-item${row.isRead ? '' : ' unread'}`}
            onClick={() => void open(row)}
            style={{ width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', background: 'transparent' }}
          >
            <div className={`notif-icon ${row.type === 'chat' ? 'green' : row.type === 'knowledge' ? 'blue' : 'amber'}`}>
              {TYPE_ICON[row.type]}
            </div>
            <div className="notif-content">
              <span className="notif-title">{row.title}</span>
              <p className="notif-desc">{row.description}</p>
            </div>
            <div className="notif-side">
              <span className="notif-time">{timeAgo(row.createdAt)}</span>
              {row.isRead ? null : <div className="notif-dot"></div>}
            </div>
          </button>
        ))}

        {loading ? <p className="knowledge-note">Memuat notifikasi…</p> : null}
        {error ? (
          <div className="knowledge-note" style={{ color: '#b91c1c' }}>
            {error}{' '}
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>Coba lagi</button>
          </div>
        ) : null}
        {!loading && !error && rows.length === 0 ? <div className="empty-state">Tidak ada notifikasi pada filter ini.</div> : null}
      </div>
    </section>
  );
}
