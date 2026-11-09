import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, CHANNEL_STATUS_LABEL, type ChannelRow } from '../services/api';
import { formatDateTime, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import {
  IconAlert,
  IconChat,
  IconCheckCircle,
  IconEdit,
  IconLink,
  IconPlug,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
} from '../components/ui/Icons';

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
  const webhooks = rows.filter((row) => row.webhookConfigured).length;

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
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Kanal Percakapan</span>
          <h1>Channels</h1>
          <p className="m-sub">Kanal Telegram tempat UMKM menghubungi asisten halal KHB.</p>
        </div>
        <div className="m-head-actions">
          <button className="m-btn m-btn-ghost" type="button" onClick={() => void reload()} disabled={loading}>
            <IconRefresh />
            Muat ulang
          </button>
          <Link className="m-btn m-btn-primary" to="/admin/channels/new">
            <IconPlus />
            Hubungkan Telegram
          </Link>
        </div>
      </div>

      <div className="m-stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <article className="m-stat green">
          <div className="m-stat-top">
            <span className="m-stat-label">Kanal aktif</span>
            <span className="m-stat-icon"><IconCheckCircle /></span>
          </div>
          <div className="m-stat-value">{active}</div>
          <div className="m-stat-foot">dari {rows.length} kanal terdaftar</div>
        </article>
        <article className="m-stat blue">
          <div className="m-stat-top">
            <span className="m-stat-label">Pesan Telegram</span>
            <span className="m-stat-icon"><IconSend /></span>
          </div>
          <div className="m-stat-value">{messages}</div>
          <div className="m-stat-foot">masuk + keluar</div>
        </article>
        <article className="m-stat violet">
          <div className="m-stat-top">
            <span className="m-stat-label">Webhook</span>
            <span className="m-stat-icon"><IconLink /></span>
          </div>
          <div className="m-stat-value">{webhooks}</div>
          <div className="m-stat-foot">terdaftar di Telegram</div>
        </article>
      </div>

      <div className="m-card">
        <div className="m-card-head">
          <div>
            <h2>Kanal Telegram</h2>
            <p>Satu bot Telegram melayani semua percakapan; riwayat per pengguna tersimpan otomatis.</p>
          </div>
        </div>

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
            <strong>Memuat kanal…</strong>
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="m-empty">
            <span className="m-empty-icon"><IconPlug /></span>
            <strong>Belum ada kanal terhubung</strong>
            <p>Hubungkan bot Telegram agar asisten bisa menerima pesan nyata dari UMKM.</p>
            <Link className="m-btn m-btn-primary m-btn-sm" to="/admin/channels/new">
              <IconPlus />
              Hubungkan Telegram
            </Link>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="m-table-wrap">
            <table className="m-table">
              <thead>
                <tr>
                  <th>Kanal</th>
                  <th>Status</th>
                  <th>Webhook</th>
                  <th>Pesan</th>
                  <th>Verifikasi</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isActive = row.status === 'active';
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="m-prod-cell">
                          <span className="m-prod-thumb">
                            <IconChat />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <strong>{row.name}</strong>
                            <small>{row.botUsername ? `@${row.botUsername.replace(/^@/, '')}` : 'bot belum terhubung'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`m-pill ${isActive ? 'green' : 'slate'}`}>
                          {CHANNEL_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td>
                        <span className={`m-pill ${row.webhookConfigured ? 'blue' : 'amber'}`}>
                          {row.webhookConfigured ? 'Terdaftar' : 'Belum aktif'}
                        </span>
                      </td>
                      <td><span className="m-price">{row.messageCount}</span></td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--m-text-3)' }}>
                          {row.lastVerifiedAt ? formatDateTime(row.lastVerifiedAt) : 'Belum dicek'}
                        </span>
                        {row.lastError ? (
                          <small style={{ display: 'block', fontSize: 11, color: '#b42318', marginTop: 2 }}>
                            {row.lastError}
                          </small>
                        ) : null}
                      </td>
                      <td>
                        <div className="m-row-actions">
                          <button
                            className="m-btn m-btn-ghost m-btn-sm"
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void verify(row)}
                          >
                            {busyId === row.id ? 'Memeriksa…' : 'Uji koneksi'}
                          </button>
                          <Link className="m-icon-btn" to={`/admin/channels/${row.id}/edit`} aria-label={`Kelola ${row.name}`} title="Kelola">
                            <IconEdit />
                          </Link>
                          <button
                            className="m-icon-btn danger"
                            type="button"
                            aria-label={`Hapus ${row.name}`}
                            title="Hapus"
                            onClick={() => void remove(row)}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="m-table-foot">
            <span><strong>{active}</strong> kanal aktif · <strong>{webhooks}</strong> webhook terdaftar</span>
            <span>{messages} pesan terkirim dan diterima</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
