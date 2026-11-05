import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useResource } from '../hooks/useApi';

/**
 * Pengaturan panel admin.
 *
 * Semua nilai disimpan di `workspaces.preferences` (JSON) lewat
 * `PUT /api/v1/settings`, sehingga bertahan setelah reload dan berlaku untuk
 * seluruh perangkat yang masuk dengan akun yang sama.
 */

type Tab = 'akun' | 'tampilan' | 'notifikasi' | 'keamanan';

interface Preferences {
  profile?: { firstName?: string; lastName?: string; email?: string; phone?: string; organization?: string };
  appearance?: { density?: 'comfortable' | 'compact'; sidebarCollapsed?: boolean; theme?: 'light' | 'system' };
  notifications?: {
    emailOnNewChat?: boolean;
    emailOnHandoff?: boolean;
    dailyDigest?: boolean;
    productUpdates?: boolean;
  };
  security?: { twoFactor?: boolean; sessionTimeoutMinutes?: number };
}

interface SettingsPayload {
  workspace: { name: string; city: string | null; tagline: string | null };
  preferences: Preferences;
}

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'akun', label: 'Akun' },
  { id: 'tampilan', label: 'Tampilan' },
  { id: 'notifikasi', label: 'Notifikasi' },
  { id: 'keamanan', label: 'Keamanan' },
];

export default function SettingsPage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource<SettingsPayload>(() => api.settings.get(), []);
  const [tab, setTab] = useState<Tab>('akun');
  const [form, setForm] = useState<SettingsPayload | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const patch = (section: keyof Preferences, key: string, value: unknown) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            preferences: {
              ...prev.preferences,
              [section]: { ...(prev.preferences[section] as Record<string, unknown>), [key]: value },
            },
          }
        : prev,
    );

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const saved = await api.settings.update({
        name: form.workspace.name,
        city: form.workspace.city ?? '',
        tagline: form.workspace.tagline ?? '',
        preferences: form.preferences as Record<string, Record<string, unknown>>,
      });
      setForm(saved);
      notify('Pengaturan disimpan');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <section className="view active">
        <div className="page-title-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> PREFERENSI</div>
            <h1>Pengaturan</h1>
          </div>
        </div>
        {error ? <p className="knowledge-note" style={{ color: '#b91c1c' }}>{error}</p> : <p className="knowledge-note">Memuat pengaturan…</p>}
      </section>
    );
  }

  const { preferences: prefs, workspace } = form;

  return (
    <section className="view active" id="view-settings">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PREFERENSI</div>
          <h1>Pengaturan</h1>
          <p className="subheading">Kelola akun, tampilan panel, notifikasi, dan keamanan sesi.</p>
        </div>
        <button className="btn btn-primary" onClick={() => void save()} disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </button>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Bagian pengaturan">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="settings-card">
          {tab === 'akun' ? (
            <>
              <div className="settings-field">
                <label htmlFor="org-name">Nama organisasi</label>
                <input
                  id="org-name"
                  className="settings-input"
                  value={workspace.name}
                  onChange={(event) => setForm({ ...form, workspace: { ...workspace, name: event.target.value } })}
                />
                <small>Tampil di header admin dan halaman publik.</small>
              </div>
              <div className="settings-field">
                <label htmlFor="org-city">Kota</label>
                <input
                  id="org-city"
                  className="settings-input"
                  value={workspace.city ?? ''}
                  onChange={(event) => setForm({ ...form, workspace: { ...workspace, city: event.target.value } })}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="org-tagline">Tagline</label>
                <input
                  id="org-tagline"
                  className="settings-input"
                  value={workspace.tagline ?? ''}
                  onChange={(event) => setForm({ ...form, workspace: { ...workspace, tagline: event.target.value } })}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="profile-email">Email pengelola</label>
                <input
                  id="profile-email"
                  type="email"
                  className="settings-input"
                  value={prefs.profile?.email ?? ''}
                  onChange={(event) => patch('profile', 'email', event.target.value)}
                  placeholder="admin@khb.or.id"
                />
              </div>
              <div className="settings-field">
                <label htmlFor="profile-phone">WhatsApp pengelola</label>
                <input
                  id="profile-phone"
                  className="settings-input"
                  value={prefs.profile?.phone ?? ''}
                  onChange={(event) => patch('profile', 'phone', event.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </>
          ) : null}

          {tab === 'tampilan' ? (
            <>
              <div className="settings-field">
                <label htmlFor="density">Kerapatan tampilan</label>
                <select
                  id="density"
                  className="settings-select"
                  value={prefs.appearance?.density ?? 'comfortable'}
                  onChange={(event) => patch('appearance', 'density', event.target.value)}
                >
                  <option value="comfortable">Nyaman</option>
                  <option value="compact">Padat</option>
                </select>
              </div>
              <label className="settings-toggle-item">
                <div>
                  <strong>Sidebar otomatis menutup</strong>
                  <p>Panel samping langsung mengecil saat halaman dibuka.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.appearance?.sidebarCollapsed ?? false}
                  onChange={(event) => patch('appearance', 'sidebarCollapsed', event.target.checked)}
                />
              </label>
              <div className="settings-field">
                <label htmlFor="theme">Tema</label>
                <select
                  id="theme"
                  className="settings-select"
                  value={prefs.appearance?.theme ?? 'light'}
                  onChange={(event) => patch('appearance', 'theme', event.target.value)}
                >
                  <option value="light">Terang</option>
                  <option value="system">Ikuti sistem</option>
                </select>
              </div>
            </>
          ) : null}

          {tab === 'notifikasi' ? (
            <>
              {(
                [
                  ['emailOnNewChat', 'Email saat ada percakapan baru', 'Ringkasan pertanyaan pertama pengunjung dikirim ke email pengelola.'],
                  ['emailOnHandoff', 'Email saat percakapan dieskalasi', 'Dikirim ketika asisten meneruskan pertanyaan ke pendamping.'],
                  ['dailyDigest', 'Ringkasan harian', 'Rekap jumlah percakapan dan pertanyaan populer setiap pagi.'],
                  ['productUpdates', 'Info pembaruan produk', 'Kabar fitur baru dari tim KHB.'],
                ] as const
              ).map(([key, title, description]) => (
                <label className="settings-toggle-item" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(prefs.notifications?.[key])}
                    onChange={(event) => patch('notifications', key, event.target.checked)}
                  />
                </label>
              ))}
            </>
          ) : null}

          {tab === 'keamanan' ? (
            <>
              <label className="settings-toggle-item">
                <div>
                  <strong>Verifikasi dua langkah</strong>
                  <p>Minta kode tambahan saat masuk dari perangkat baru.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.security?.twoFactor ?? false}
                  onChange={(event) => patch('security', 'twoFactor', event.target.checked)}
                />
              </label>
              <div className="settings-field">
                <label htmlFor="timeout">Batas sesi (menit)</label>
                <input
                  id="timeout"
                  type="number"
                  min={5}
                  max={720}
                  className="settings-input"
                  value={prefs.security?.sessionTimeoutMinutes ?? 60}
                  onChange={(event) => patch('security', 'sessionTimeoutMinutes', Number(event.target.value))}
                />
                <small>Berlaku lokal di panel; token server memakai SESSION_TTL_HOURS.</small>
              </div>
              <div className="settings-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    void api.auth.me().then(
                      () => notify('Sesi aktif dan token valid'),
                      () => notify('Sesi tidak valid — silakan masuk ulang'),
                    );
                  }}
                >
                  Periksa sesi
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
