import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, CHANNEL_STATUS_LABEL, type ChannelRow } from '../services/api';
import { formatDateTime } from '../hooks/useApi';
import { useToast } from '../components/Toast';

export default function ChannelEditPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();

  const [channel, setChannel] = useState<ChannelRow | null>(null);
  const [form, setForm] = useState({ name: '', handle: '', status: 'draft' as ChannelRow['status'] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await api.channels.list();
        const found = rows.find((row) => row.id === channelId) ?? null;
        setChannel(found);
        if (found) setForm({ name: found.name, handle: found.handle ?? '', status: found.status });
      } catch {
        notify('Gagal memuat kanal');
      } finally {
        setLoading(false);
      }
    })();
  }, [channelId, notify]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!channel) return;
    setSaving(true);
    try {
      await api.channels.update(channel.id, {
        name: form.name.trim(),
        handle: form.handle.trim(),
        status: form.status,
      });
      notify('Perubahan kanal disimpan');
      navigate('/admin/channels');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal menyimpan kanal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view active" id="view-channel-edit">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KANAL PERCAKAPAN</div>
          <h1>Edit kanal</h1>
          <p className="subheading">Perbarui identitas dan status kanal.</p>
        </div>
        <Link className="btn btn-secondary" to="/admin/channels">Kembali</Link>
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 28 }}><p className="knowledge-note">Memuat kanal…</p></div>
      ) : !channel ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="knowledge-note">Kanal tidak ditemukan.</p>
          <Link className="btn btn-primary" to="/admin/channels">Kembali ke daftar</Link>
        </div>
      ) : (
        <div className="grid-2-1">
          <div className="panel" style={{ padding: 22 }}>
            <div className="panel-heading">
              <div>
                <h2>Pengaturan kanal</h2>
                <p>Platform: {channel.platform}</p>
              </div>
            </div>
            <form onSubmit={submit}>
              <div className="settings-field">
                <label htmlFor="channel-name">Nama kanal</label>
                <input
                  id="channel-name"
                  className="settings-input"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
              <div className="settings-field">
                <label htmlFor="channel-handle">Nomor / akun</label>
                <input
                  id="channel-handle"
                  className="settings-input"
                  value={form.handle}
                  onChange={(event) => setForm({ ...form, handle: event.target.value })}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="channel-status">Status</label>
                <select
                  id="channel-status"
                  className="settings-select"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as ChannelRow['status'] })}
                >
                  {(Object.keys(CHANNEL_STATUS_LABEL) as Array<ChannelRow['status']>).map((key) => (
                    <option key={key} value={key}>{CHANNEL_STATUS_LABEL[key]}</option>
                  ))}
                </select>
              </div>
              <div className="settings-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/channels')}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>

          <div className="panel" style={{ padding: 22 }}>
            <div className="panel-heading">
              <div>
                <h2>Informasi kanal</h2>
                <p>Ringkasan status koneksi</p>
              </div>
            </div>
            <div className="kv">
              <div className="kv-row"><span>Platform</span><strong>{channel.platform}</strong></div>
              <div className="kv-row"><span>Status</span><strong>{CHANNEL_STATUS_LABEL[channel.status]}</strong></div>
              <div className="kv-row"><span>Sinkron terakhir</span><strong>{formatDateTime(channel.lastSyncAt)}</strong></div>
              <div className="kv-row"><span>Pesan tercatat</span><strong>{channel.messageCount.toLocaleString('id-ID')}</strong></div>
              <div className="kv-row"><span>Percakapan</span><strong>{channel.conversations}</strong></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
