import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Nomor bisnis & pesan pelanggan' },
  { id: 'instagram', name: 'Instagram', desc: 'DM dan komentar akun resmi' },
  { id: 'web', name: 'Web Chat', desc: 'Widget pada website komunitas' },
  { id: 'telegram', name: 'Telegram', desc: 'Bot percakapan 24 jam' },
] as const;

export default function ChannelCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [platform, setPlatform] = useState<string>('whatsapp');
  const [form, setForm] = useState({ name: '', handle: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.channels.create({
        platform,
        name: form.name.trim(),
        handle: form.handle.trim() || undefined,
        status: 'draft',
      });
      notify('Kanal ditambahkan (status draf)');
      navigate('/admin/channels');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal menambah kanal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view active" id="view-channel-create">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KANAL PERCAKAPAN</div>
          <h1>Hubungkan kanal baru</h1>
          <p className="subheading">Pilih platform lalu lengkapi identitas kanal.</p>
        </div>
        <Link className="btn btn-secondary" to="/admin/channels">Kembali</Link>
      </div>

      <div className="grid-2-1">
        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>1. Pilih platform</h2>
              <p>Kanal tempat UMKM menghubungi komunitas</p>
            </div>
          </div>

          <div className="flat-list" role="radiogroup" aria-label="Pilih platform">
            {PLATFORMS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={platform === item.id}
                className="flat-row"
                onClick={() => setPlatform(item.id)}
                style={{
                  width: '100%',
                  border: 0,
                  borderBottom: '1px solid var(--line-2)',
                  background: platform === item.id ? 'var(--green-subtle)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  paddingLeft: platform === item.id ? 10 : 0,
                  paddingRight: platform === item.id ? 10 : 0,
                  borderRadius: platform === item.id ? 8 : 0,
                }}
              >
                <span className="row-icon">{item.name.slice(0, 2).toUpperCase()}</span>
                <span className="row-copy">
                  <strong>{item.name}</strong>
                  <span>{item.desc}</span>
                </span>
                <span className="row-meta">{platform === item.id ? '✓ Dipilih' : ''}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ marginTop: 18 }}>
            <div className="settings-field">
              <label htmlFor="channel-name">Nama kanal</label>
              <input
                id="channel-name"
                className="settings-input"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Contoh: WhatsApp KHB"
              />
            </div>
            <div className="settings-field">
              <label htmlFor="channel-handle">Nomor / akun</label>
              <input
                id="channel-handle"
                className="settings-input"
                value={form.handle}
                onChange={(event) => setForm({ ...form, handle: event.target.value })}
                placeholder="+62 811-2233-445"
              />
            </div>
            <div className="settings-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/channels')}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan…' : 'Hubungkan'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Panduan singkat</h2>
              <p>Tiga langkah sebelum kanal aktif</p>
            </div>
          </div>
          <div className="flat-list">
            <div className="flat-row">
              <span className="row-icon">1</span>
              <span className="row-copy"><strong>Siapkan akses kanal</strong><span>Pastikan akun resmi komunitas sudah aktif.</span></span>
            </div>
            <div className="flat-row">
              <span className="row-icon">2</span>
              <span className="row-copy"><strong>Simpan identitas</strong><span>Kanal dibuat dengan status draf sampai kredensial siap.</span></span>
            </div>
            <div className="flat-row">
              <span className="row-icon">3</span>
              <span className="row-copy"><strong>Aktifkan kanal</strong><span>Ubah status menjadi aktif di halaman edit kanal.</span></span>
            </div>
          </div>
          <p className="knowledge-note">Integrasi pengiriman pesan ke WhatsApp/Instagram belum termasuk pada prototipe ini.</p>
        </div>
      </div>
    </section>
  );
}
