import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, CHANNEL_STATUS_LABEL, type ChannelRow } from '../services/api';
import { formatDateTime, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

/**
 * Daftar kanal — KHB hanya memakai Telegram (permintaan pengguna).
 * Setiap baris menampilkan status bot + webhook, dengan aksi uji koneksi dan hapus.
 */
export default function ChannelListPage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource(() => api.channels.list(), []);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = data ?? [];
  const active = rows.filter((row) => row.status === 'active').length;
  const messages = rows.reduce((sum, row) => sum + row.messageCount, 0);

  const verify = async (row: ChannelRow) => {
    setBusyId(row.id);
    try {
      const result = await api.channels.verifyTelegram(row.id);
      notify(result.status === 'active' ? 'Bot terhubung dan webhook aktif' : result.lastError ?? 'Webhook belum aktif');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memeriksa kanal');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row: ChannelRow) => {
    if (!window.confirm(`Hapus kanal "${row.name}"? Percakapan lama tetap tersimpan.`)) return;
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
          <p className="subheading">Kanal Telegram tempat UMKM menghubungi asisten halal KHB.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/channels/new">Hubungkan Telegram</Link>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span>Kanal aktif</span><span className="stat-icon green">●</span></div>
          <strong>{active}</strong>
          <small>dari {rows.length} kanal</small>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Pesan Telegram</span><span className="stat-icon">✈️</span></div>
          <strong>{messages}</strong>
          <small>masuk + keluar</small>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Webhook</span><span className="stat-icon">🔗</span></div>
          <strong>{rows.filter((row) => row.webhookConfigured).length}</strong>
          <small>terdaftar di Telegram</small>
        </article>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Kanal Telegram</h2>
            <p>Satu bot Telegram melayani semua percakapan; riwayat per pengguna tersimpan otomatis.</p>
          </div>
        </div>
        <div className="panel-body">
          {loading ? <p className="knowledge-note">Memuat kanal…</p> : null}
          {error ? (
            <p className="knowledge-note" style={{ color: '#b91c1c' }}>
              {error}{' '}
              <button className="btn btn-secondary" type="button" onClick={() => void reload()}>Coba lagi</button>
            </p>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="flat-list">
              <div className="flat-row">
                <div>
                  <strong>Belum ada kanal</strong>
                  <small>Hubungkan bot Telegram agar asisten bisa menerima pesan nyata.</small>
                </div>
                <Link className="btn btn-primary" to="/admin/channels/new">Hubungkan Telegram</Link>
              </div>
            </div>
          ) : null}

          {rows.length > 0 ? (
            <div className="flat-list">
              {rows.map((row) => (
                <div className="flat-row" key={row.id}>
                  <div>
                    <strong>
                      {row.name} {row.botUsername ? <span className="badge">{row.botUsername}</span> : null}
                    </strong>
                    <small>
                      {CHANNEL_STATUS_LABEL[row.status]}
                      {row.webhookConfigured ? ' · webhook terdaftar' : ' · webhook belum aktif'}
                      {row.lastVerifiedAt ? ` · dicek ${formatDateTime(row.lastVerifiedAt)}` : ''}
                      {row.lastError ? ` · ${row.lastError}` : ''}
                    </small>
                  </div>
                  <div className="page-actions">
                    <Link className="btn btn-secondary" to={`/admin/channels/${row.id}/edit`}>Kelola</Link>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => void verify(row)}
                    >
                      {busyId === row.id ? 'Memeriksa…' : 'Uji koneksi'}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => void remove(row)}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
