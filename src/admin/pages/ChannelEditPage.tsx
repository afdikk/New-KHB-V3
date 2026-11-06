import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, CHANNEL_STATUS_LABEL, type ChannelRow } from '../services/api';
import { formatDateTime } from '../hooks/useApi';
import { useToast } from '../components/Toast';

/**
 * Kelola satu kanal Telegram: nama, status webhook, uji koneksi,
 * daftar ulang webhook, ganti token, dan putuskan kanal.
 */
export default function ChannelEditPage() {
  const { channelId } = useParams();
  const notify = useToast();

  const [channel, setChannel] = useState<ChannelRow | null>(null);
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const rows = await api.channels.list();
    const found = rows.find((row) => row.id === channelId) ?? null;
    setChannel(found);
    if (found) setName(found.name);
  };

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch {
        notify('Gagal memuat kanal');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const act = async (action: 'save' | 'verify' | 'webhook' | 'reconnect' | 'disconnect' | 'delete') => {
    if (!channel) return;
    if (action === 'delete' || action === 'disconnect') {
      const label = action === 'delete' ? 'Hapus kanal ini?' : 'Putuskan kanal ini? Token bot akan dihapus dan webhook dilepas.';
      if (!window.confirm(label)) return;
    }

    setBusy(action);
    try {
      if (action === 'save') {
        await api.channels.update(channel.id, { name: name.trim() });
        notify('Nama kanal disimpan');
      } else if (action === 'verify') {
        const result = await api.channels.verifyTelegram(channel.id);
        notify(result.status === 'active' ? 'Bot terhubung dan webhook aktif' : result.lastError ?? 'Webhook belum aktif');
      } else if (action === 'webhook') {
        await api.channels.refreshWebhook(channel.id);
        notify('Webhook didaftarkan ulang ke Telegram');
      } else if (action === 'reconnect') {
        if (!token.trim()) {
          notify('Tempel token bot baru terlebih dahulu');
          return;
        }
        const result = await api.channels.connectTelegram(channel.id, { botToken: token.trim(), name: name.trim() });
        notify(result.status === 'active' ? 'Token diperbarui, webhook aktif' : result.lastError ?? 'Token tersimpan, webhook belum aktif');
        setToken('');
      } else if (action === 'disconnect') {
        await api.channels.disconnectTelegram(channel.id);
        notify('Kanal diputus');
      } else if (action === 'delete') {
        await api.channels.remove(channel.id);
        notify('Kanal dihapus');
        window.location.href = '/admin/channels';
        return;
      }
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Aksi gagal');
    } finally {
      setBusy(null);
    }
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      notify('Disalin ke clipboard');
    } catch {
      notify('Gagal menyalin, salin manual dari kolom teks');
    }
  };

  if (loading) {
    return (
      <section className="view active">
        <div className="page-title-row">
          <div><div className="eyebrow"><span className="eyebrow-dot"></span> KANAL</div><h1>Kelola kanal</h1></div>
        </div>
        <p className="knowledge-note">Memuat kanal…</p>
      </section>
    );
  }

  if (!channel) {
    return (
      <section className="view active">
        <div className="page-title-row">
          <div><div className="eyebrow"><span className="eyebrow-dot"></span> KANAL</div><h1>Kanal tidak ditemukan</h1></div>
          <Link className="btn btn-secondary" to="/admin/channels">Kembali</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="view active" id="view-channel-edit">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KANAL TELEGRAM</div>
          <h1>{channel.name}</h1>
          <p className="subheading">
            {channel.botUsername ?? 'Bot belum terhubung'} · {CHANNEL_STATUS_LABEL[channel.status]}
          </p>
        </div>
        <Link className="btn btn-secondary" to="/admin/channels">Kembali</Link>
      </div>

      {channel.lastError ? (
        <div className="panel">
          <div className="panel-body">
            <p className="knowledge-note" style={{ color: '#b45309' }}>
              <strong>Perlu perhatian:</strong> {channel.lastError}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid-2-1">
        <div className="panel">
          <div className="panel-heading"><div><h2>Identitas kanal</h2></div></div>
          <div className="panel-body">
            <div className="settings-field">
              <label htmlFor="channel-name">Nama kanal</label>
              <input
                id="channel-name"
                className="settings-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="channel-handle">Username bot</label>
              <input id="channel-handle" className="settings-input" value={channel.botUsername ?? '—'} readOnly />
            </div>
            <div className="settings-field">
              <label htmlFor="channel-webhook">URL webhook</label>
              <input id="channel-webhook" className="settings-input" value={channel.webhookUrl ?? ''} readOnly />
              <small>Didaftarkan otomatis. Tombol “Daftarkan ulang” dipakai setelah domain/HTTPS berubah.</small>
            </div>
            <div className="page-actions">
              <button className="btn btn-primary" type="button" disabled={busy === 'save'} onClick={() => void act('save')}>
                {busy === 'save' ? 'Menyimpan…' : 'Simpan nama'}
              </button>
              <button className="btn btn-secondary" type="button" disabled={busy === 'verify'} onClick={() => void act('verify')}>
                {busy === 'verify' ? 'Memeriksa…' : 'Uji koneksi'}
              </button>
              <button className="btn btn-secondary" type="button" disabled={busy === 'webhook'} onClick={() => void act('webhook')}>
                {busy === 'webhook' ? 'Mendaftarkan…' : 'Daftarkan ulang webhook'}
              </button>
            </div>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-heading"><div><h2>Status & token</h2></div></div>
          <div className="panel-body">
            <div className="flat-list">
              <div className="flat-row">
                <div><strong>Webhook</strong><small>{channel.webhookConfigured ? 'Terdaftar di Telegram' : 'Belum terdaftar'}</small></div>
              </div>
              <div className="flat-row">
                <div><strong>Terakhir dicek</strong><small>{channel.lastVerifiedAt ? formatDateTime(channel.lastVerifiedAt) : 'Belum pernah'}</small></div>
              </div>
              <div className="flat-row">
                <div><strong>Pesan</strong><small>{channel.messageCount} pesan</small></div>
              </div>
            </div>

            <div className="settings-field" style={{ marginTop: 16 }}>
              <label htmlFor="new-token">Ganti token bot</label>
              <input
                id="new-token"
                className="settings-input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="123456789:AAH..."
                autoComplete="off"
                spellCheck={false}
              />
              <small>Token lama tidak bisa ditampilkan. Tempel token baru hanya bila ingin mengganti bot.</small>
            </div>

            <div className="page-actions">
              <button className="btn btn-secondary" type="button" disabled={busy === 'reconnect'} onClick={() => void act('reconnect')}>
                {busy === 'reconnect' ? 'Menghubungkan…' : 'Hubungkan ulang'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => void act('disconnect')}>Putuskan</button>
              <button className="btn btn-secondary" type="button" onClick={() => void act('delete')}>Hapus</button>
            </div>

            <p className="knowledge-note" style={{ marginTop: 12 }}>
              Uji nyata: buka bot di Telegram, kirim pertanyaan halal, lalu cek percakapan di halaman
              Percakapan dan pelanggan baru di halaman Pelanggan.
            </p>
          </div>
        </aside>
      </div>

      <div className="panel">
        <div className="panel-heading"><div><h2>Webhook secret</h2><p>Dipakai Telegram untuk membuktikan permintaan berasal dari kanal ini.</p></div></div>
        <div className="panel-body">
          <p className="knowledge-note">
            Secret disimpan terenkripsi dan hanya ditampilkan sebagian. Bila perlu mendaftarkan webhook manual:
          </p>
          <div className="settings-field">
            <code style={{ wordBreak: 'break-all' }}>
              https://api.telegram.org/bot&lt;TOKEN&gt;/setWebhook?url={channel.webhookUrl ?? ''}
            </code>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" type="button" onClick={() => void copy(channel.webhookUrl ?? '')}>
              Salin URL webhook
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
