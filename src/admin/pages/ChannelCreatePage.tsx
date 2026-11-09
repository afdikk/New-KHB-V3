import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { TextField } from '../components/ui/Fields';
import {
  IconAlert,
  IconArrowRight,
  IconCheckCircle,
  IconExternal,
  IconLink,
  IconPlug,
  IconSend,
  IconShield,
} from '../components/ui/Icons';

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

  const STEPS = [
    { n: 1, title: 'Buka @BotFather', desc: 'Cari bot resmi Telegram untuk membuat bot baru.', done: true },
    { n: 2, title: 'Kirim /newbot', desc: 'Ikuti instruksi nama dan username bot Anda.', done: true },
    { n: 3, title: 'Salin token', desc: 'BotFather memberi token format angka:huruf.', done: true },
    { n: 4, title: 'Tempel & hubungkan', desc: 'Token divalidasi ke Telegram lalu disimpan terenkripsi.', done: false },
  ];

  return (
    <section className="view active" id="view-channel-create">
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Kanal Percakapan</span>
          <h1>Hubungkan Telegram</h1>
          <p className="m-sub">Token bot divalidasi ke Telegram sebelum disimpan (terenkripsi).</p>
        </div>
        <div className="m-head-actions">
          <Link className="m-btn m-btn-ghost" to="/admin/channels">
            Kembali ke Channels
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        {/* ── Formulir ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Data bot</h2>
                <p>Buat bot lewat @BotFather di Telegram, lalu salin tokennya.</p>
              </div>
              <span className="m-pill green">Langkah 4 dari 4</span>
            </div>

            <form onSubmit={submit}>
              <div className="m-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  id="channel-name"
                  label="Nama kanal"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                  placeholder="Telegram KHB"
                  maxLength={120}
                  hint="Hanya untuk panel admin, tidak terlihat pengguna Telegram."
                />

                <div className="m-field">
                  <div className="m-field-head">
                    <label htmlFor="bot-token">Token bot</label>
                    <span className="m-field-count">disimpan terenkripsi</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="bot-token"
                      className="m-input"
                      style={{ paddingRight: 44, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12.5 }}
                      value={form.botToken}
                      onChange={(event) => setForm({ ...form, botToken: event.target.value })}
                      placeholder="123456789:AAH..."
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--m-text-3)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <IconShield />
                    </span>
                  </div>
                  <p className="m-field-hint">
                    Format <code>angka:huruf</code>. Disimpan terenkripsi dan tidak pernah ditampilkan lagi.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '11px 13px',
                    borderRadius: 10,
                    background: 'var(--green-subtle)',
                    border: '1px solid rgba(22,163,74,.16)',
                  }}
                >
                  <span style={{ color: 'var(--green-dark)', flex: 'none', marginTop: 1, display: 'grid', placeItems: 'center' }}>
                    <IconCheckCircle />
                  </span>
                  <span style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--green-dark)' }}>
                    Token diuji ke <code>getMe</code> Telegram lebih dulu. Kalau tidak valid, kanal tidak dibuat.
                  </span>
                </div>

                {error ? (
                  <div className="a2-error" role="alert">
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 9,
                  padding: '14px 22px',
                  borderTop: '1px solid var(--m-border)',
                  background: '#fcfdfe',
                }}
              >
                <Link className="m-btn m-btn-ghost" to="/admin/channels">Batal</Link>
                <button className="m-btn m-btn-primary" type="submit" disabled={saving || !form.botToken.trim()}>
                  {saving ? <span className="a2-spinner" /> : <IconPlug />}
                  {saving ? 'Menghubungkan…' : 'Hubungkan bot'}
                </button>
              </div>
            </form>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Tentang webhook</h2>
                <p>Bagaimana pesan Telegram sampai ke asisten</p>
              </div>
            </div>
            <div className="m-card-pad" style={{ paddingTop: 4 }}>
              <div className="m-kv">
                <div className="m-kv-row">
                  <span><IconLink /> Pendaftaran webhook</span>
                  <strong>Otomatis setelah token valid</strong>
                </div>
                <div className="m-kv-row">
                  <span><IconShield /> Syarat domain</span>
                  <strong>Harus HTTPS publik</strong>
                </div>
                <div className="m-kv-row">
                  <span><IconSend /> Penyimpanan token</span>
                  <strong>Terenkripsi</strong>
                </div>
              </div>
              <p className="m-field-hint" style={{ marginTop: 12 }}>
                Webhook memakai <code>PUBLIC_BASE_URL</code>. Saat pengembangan di localhost, bot tetap
                tersimpan tetapi webhook belum aktif sampai aplikasi punya domain HTTPS.
              </p>
            </div>
          </div>
        </div>

        {/* ── Panduan langkah ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Langkah singkat</h2>
                <p>Empat langkah dari nol sampai bot aktif</p>
              </div>
            </div>
            <div style={{ padding: '4px 20px 12px' }}>
              <div className="m-steps">
                {STEPS.map((step) => (
                  <div className={`m-step${step.done ? ' done' : ''}`} key={step.n}>
                    <span className="m-step-num">{step.done ? <IconCheckCircle /> : step.n}</span>
                    <div className="m-step-body">
                      <strong>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                padding: '13px 20px',
                borderTop: '1px solid var(--m-border)',
                background: '#fcfdfe',
              }}
            >
              <a
                className="m-btn m-btn-soft m-btn-sm"
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                style={{ width: '100%' }}
              >
                Buka @BotFather di Telegram
                <IconExternal />
              </a>
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Setelah terhubung</h2>
                <p>Apa yang bisa Anda lakukan berikutnya</p>
              </div>
            </div>
            <div className="m-card-pad" style={{ paddingTop: 6 }}>
              <div className="m-actions-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                <Link className="m-action" to="/admin/chatbot">
                  <span className="m-action-icon"><IconPlug /></span>
                  <span className="m-action-copy">
                    <strong>Atur gaya jawaban</strong>
                    <span>Sesuaikan nada dan kebijakan asisten.</span>
                  </span>
                  <span className="m-action-arrow"><IconArrowRight /></span>
                </Link>
                <Link className="m-action" to="/admin/chat">
                  <span className="m-action-icon blue"><IconSend /></span>
                  <span className="m-action-copy">
                    <strong>Uji percakapan</strong>
                    <span>Kirim pertanyaan contoh ke asisten.</span>
                  </span>
                  <span className="m-action-arrow"><IconArrowRight /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
