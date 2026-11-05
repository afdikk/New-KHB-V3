import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, CHANNEL_STATUS_LABEL, type ChannelRow } from '../services/api';
import { formatDateTime, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

const PLATFORM_ICON: Record<ChannelRow['platform'], string> = {
  whatsapp: 'WA',
  instagram: 'IG',
  web: 'WEB',
  telegram: 'TG',
};

export default function ChannelListPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [filter, setFilter] = useState<'Semua' | 'active' | 'draft'>('Semua');

  const { data, loading, error, reload } = useResource(() => api.channels.list(), []);
  const rows = (data ?? []).filter((row) => filter === 'Semua' || row.status === filter);
  const total = data?.length ?? 0;
  const active = data?.filter((row) => row.status === 'active').length ?? 0;
  const messages = data?.reduce((sum, row) => sum + row.messageCount, 0) ?? 0;

  const disconnect = async (row: ChannelRow) => {
    if (!window.confirm(`Putuskan kanal "${row.name}"?`)) return;
    try {
      await api.channels.update(row.id, { status: 'draft' });
      notify('Kanal diputuskan (status draf)');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memperbarui kanal');
    }
  };

  const remove = async (row: ChannelRow) => {
    if (!window.confirm(`Hapus kanal "${row.name}"?`)) return;
    try {
      await api.channels.remove(row.id);
      notify('Kanal dihapus');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menghapus kanal');
    }
  };

  return (
    <section className="view active" id="view-channels">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KANAL PERCAKAPAN</div>
          <h1>Channels</h1>
          <p className="subheading">Kanal tempat UMKM menghubungi asisten halal KHB.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/channels/new">Hubungkan Kanal</Link>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span>Kanal aktif</span><span className="stat-icon green">●</span></div>
          <div className="stat-value">{active}</div>
          <div className="stat-foot"><span className="stat-muted">dari {total} kanal terdaftar</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Pesan tercatat</span><span className="stat-icon blue">▤</span></div>
          <div className="stat-value">{messages.toLocaleString('id-ID')}</div>
          <div className="stat-foot"><span className="stat-muted">akumulasi semua kanal</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Belum aktif</span><span className="stat-icon orange">!</span></div>
          <div className="stat-value">{total - active}</div>
          <div className="stat-foot"><span className="stat-muted">perlu kredensial</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Percakapan web</span><span className="stat-icon purple">◍</span></div>
          <div className="stat-value">{data?.find((row) => row.platform === 'web')?.conversations ?? 0}</div>
          <div className="stat-foot"><span className="stat-muted">dari widget website</span></div>
        </article>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="history-toolbar">
          <div>
            <h2>Daftar kanal</h2>
            <p>{rows.length} kanal ditampilkan</p>
          </div>
          <div className="filter-tabs" style={{ height: 36 }}>
            {(['Semua', 'active', 'draft'] as const).map((item) => (
              <button key={item} className={`filter-tab${filter === item ? ' selected' : ''}`} onClick={() => setFilter(item)}>
                {item === 'Semua' ? 'Semua' : CHANNEL_STATUS_LABEL[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>KANAL</th><th>IDENTITAS</th><th>STATUS</th><th>SINKRON TERAKHIR</th><th>PESAN</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar avatar-soft-green" style={{ width: 30, height: 30, fontSize: 10 }}>{PLATFORM_ICON[row.platform]}</span>
                      <div>
                        <strong>{row.name}</strong>
                        <small>{row.platform}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.handle ?? '—'}</td>
                  <td>
                    <span className={`badge-pill ${row.status === 'active' ? 'badge-green' : 'badge-slate'}`}>
                      <i></i>{CHANNEL_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td>{formatDateTime(row.lastSyncAt)}</td>
                  <td>{row.messageCount.toLocaleString('id-ID')}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-action" aria-label="Edit kanal" onClick={() => navigate(`/admin/channels/${row.id}/edit`)}>✎</button>
                      <button className="icon-action" aria-label="Putuskan kanal" onClick={() => void disconnect(row)}>⏻</button>
                      <button className="icon-action danger" aria-label="Hapus kanal" onClick={() => void remove(row)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? <p className="knowledge-note" style={{ padding: '0 18px' }}>Memuat kanal…</p> : null}
          {error ? (
            <div style={{ padding: '0 18px', color: '#b91c1c' }} className="knowledge-note">
              {error}{' '}
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>
                Coba lagi
              </button>
            </div>
          ) : null}
          {!loading && !error && rows.length === 0 ? <div className="empty-state">Belum ada kanal.</div> : null}
        </div>

        <div className="table-footer">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{total}</strong> kanal</span>
          <button className="btn btn-secondary btn-sm" onClick={() => void reload()}>Muat ulang</button>
        </div>
      </div>
    </section>
  );
}
