import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

/**
 * Hubungkan bot Telegram.
 *
 * Satu langkah: tempel token dari @BotFather → server memvalidasi ke `getMe`,
 * menyimpan token terenkripsi, lalu mendaftarkan webhook otomatis bila
 * `PUBLIC_BASE_URL` sudah HTTPS.
 */
export default function ChannelCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState({ name: 'Telegram KHB', botToken: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = form.botToken.trim();
    if (!token) {
      setError('Token bot wajib diisi (ambil dari @BotFather: /newbot).');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const channel = await api.channels.create({
        name: form.name.trim() || 'Telegram KHB',
        handle: undefined,
      });
      const connected = await api.channels.connectTelegram(channel.id, { botToken: token, name: form.name.trim() });
      if (connected.status === 'active') {
        notify('Bot Telegram terhubung dan webhook aktif');
      } else {
        notify(connected.lastError ?? 'Bot tersimpan, tetapi webhook belum aktif');
      }
      navigate(`/admin/channels/${channel.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghubungkan Telegram';
      setError(message);
      notify(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view active" id="view-channel-create">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KANAL PERCAKAPAN</div>
          <h1>Hubungkan Telegram</h1>
          <p className="subheading">Token bot divalidasi ke Telegram sebelum disimpan (terenkripsi).</p>
        </div>
        <Link className="btn btn-secondary" to="/admin/channels">Kembali</Link>
      </div>

      <div className="grid-2-1">
        <form className="panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>Data bot</h2>
              <p>Buat bot lewat @BotFather di Telegram, lalu salin tokennya.</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="settings-field">
              <label htmlFor="channel-name">Nama kanal</label>
              <input
                id="channel-name"
                className="settings-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Telegram KHB"
                maxLength={120}
              />
              <small>Hanya untuk panel admin, tidak terlihat pengguna Telegram.</small>
            </div>

            <div className="settings-field">
              <label htmlFor="bot-token">Token bot</label>
              <input
                id="bot-token"
                className="settings-input"
                value={form.botToken}
                onChange={(event) => setForm({ ...form, botToken: event.target.value })}
                placeholder="123456789:AAH..."
                autoComplete="off"
                spellCheck={false}
              />
              <small>Format: <code>angka:huruf</code>. Disimpan terenkripsi, tidak pernah ditampilkan lagi.</small>
            </div>

            {error ? <p className="knowledge-note" style={{ color: '#b91c1c' }}>{error}</p> : null}

            <div className="page-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Menghubungkan…' : 'Hubungkan bot'}
              </button>
              <Link className="btn btn-secondary" to="/admin/channels">Batal</Link>
            </div>
          </div>
        </form>

        <aside className="panel">
          <div className="panel-heading"><div><h2>Langkah singkat</h2></div></div>
          <div className="panel-body">
            <ol className="knowledge-note" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Buka Telegram, cari <strong>@BotFather</strong>.</li>
              <li>Kirim <code>/newbot</code>, ikuti nama & username bot.</li>
              <li>Salin token yang diberikan.</li>
              <li>Tempel di form, klik <strong>Hubungkan bot</strong>.</li>
              <li>Webhook didaftarkan otomatis bila alamat publik sudah HTTPS.</li>
              <li>Kirim pesan ke bot untuk mencoba jawaban asisten.</li>
            </ol>
            <p className="knowledge-note">
              Webhook memakai <code>PUBLIC_BASE_URL</code>. Saat pengembangan di localhost, bot tetap tersimpan
              tetapi webhook belum aktif sampai aplikasi punya domain HTTPS.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
