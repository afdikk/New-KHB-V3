import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useResource } from '../hooks/useApi';

/**
 * Profil pengelola — disimpan pada `preferences.profile` workspace.
 * Data yang sama dipakai halaman Pengaturan agar tidak ada dua sumber.
 */
interface Preferences {
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
}

export default function EditProfilePage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource<{
    workspace: { name: string; city: string | null; tagline: string | null };
    preferences: Preferences;
  }>(() => api.settings.get(), []);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const profile = data.preferences.profile ?? {};
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      organization: profile.organization ?? data.workspace.name,
    });
  }, [data]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.settings.update({ preferences: { profile: form } });
      notify('Profil diperbarui');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="view active">
        <div className="page-title-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> AKUN</div>
            <h1>Edit Profil</h1>
          </div>
        </div>
        {error ? <p className="knowledge-note" style={{ color: '#b91c1c' }}>{error}</p> : <p className="knowledge-note">Memuat profil…</p>}
      </section>
    );
  }

  return (
    <section className="view active" id="view-edit-profile">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> AKUN</div>
          <h1>Edit Profil</h1>
          <p className="subheading">Nama dan kontak ini dipakai pada email notifikasi serta tanda tangan balasan.</p>
        </div>
      </div>

      <form className="settings-card" onSubmit={save}>
        <div className="grid-2">
          <div className="settings-field">
            <label htmlFor="first-name">Nama depan</label>
            <input
              id="first-name"
              className="settings-input"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              required
            />
          </div>
          <div className="settings-field">
            <label htmlFor="last-name">Nama belakang</label>
            <input
              id="last-name"
              className="settings-input"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
          </div>
        </div>
        <div className="settings-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="settings-input"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="settings-field">
          <label htmlFor="phone">WhatsApp</label>
          <input
            id="phone"
            className="settings-input"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </div>
        <div className="settings-field">
          <label htmlFor="organization">Organisasi</label>
          <input
            id="organization"
            className="settings-input"
            value={form.organization}
            onChange={(event) => setForm({ ...form, organization: event.target.value })}
          />
        </div>
        <div className="settings-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </section>
  );
}
