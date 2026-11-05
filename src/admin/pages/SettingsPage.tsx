import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  {
    id: 'account',
    label: 'Akun',
    icon: <><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  },
  {
    id: 'appearance',
    label: 'Tampilan',
    icon: <><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  },
  {
    id: 'notifications-settings',
    label: 'Notifikasi',
    icon: <><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  },
  {
    id: 'security',
    label: 'Keamanan',
    icon: <><path d="M10 2l7 3v6c0 4.8-3.2 7.6-7 9-3.8-1.4-7-4.2-7-9V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 10l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  },
  {
    id: 'chatbot',
    label: 'Chatbot AI',
    icon: <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('account');
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  return (
    <>
{/*─── SETTINGS VIEW ───*/}
      <section className="view active" id="view-settings">
        <div className="page-title-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> KONFIGURASI SISTEM</div>
            <h1>Pengaturan</h1>
            <p className="subheading">Sesuaikan preferensi dan konfigurasi akun Anda.</p>
          </div>
        </div>
        <div className="settings-layout">
          <div className="settings-nav-wrap">
            <nav className="settings-nav panel" role="tablist" aria-label="Kategori pengaturan">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  aria-controls={`settings-${t.id}`}
                  className={`settings-nav-item${tab === t.id ? ' active' : ''}`}
                  data-settings={t.id}
                  onClick={() => setTab(t.id)}
                >
                  <svg viewBox="0 0 20 20" fill="none">{t.icon}</svg>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="settings-content">
            {/*Account Settings*/}
            <div className={`settings-section${tab === 'account' ? ' active' : ''}`} id="settings-account" role="tabpanel">
              <div className="settings-card panel">
                <div className="settings-card-header settings-card-header-row">
                  <div><h3>Informasi Akun</h3><p>Detail dasar akun Anda</p></div>
                  <button className="btn btn-secondary btn-sm settings-edit-cta" onClick={() => navigate('/admin/edit-profile')}>Edit Profil</button>
                </div>
                <div className="settings-field"><label>Nama Lengkap</label><div className="settings-value">Admin KHB</div></div>
                <div className="settings-field"><label>Email</label><div className="settings-value">admin@khb.or.id</div></div>
                <div className="settings-field"><label>Peran</label><div className="settings-value"><span className="role-badge">Administrator</span></div></div>
                <div className="settings-field"><label>Bergabung sejak</label><div className="settings-value">1 Januari 2024</div></div>
              </div>
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Zona Waktu &amp; Bahasa</h3><p>Sesuaikan regional Anda</p></div>
                <div className="settings-field">
                  <label>Zona waktu</label>
                  <select className="settings-select" defaultValue="Asia/Jakarta (WIB, GMT+7)">
                    <option>Asia/Jakarta (WIB, GMT+7)</option>
                    <option>Asia/Makassar (WITA, GMT+8)</option>
                    <option>Asia/Jayapura (WIT, GMT+9)</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Bahasa antarmuka</label>
                  <select className="settings-select" defaultValue="Bahasa Indonesia">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="settings-actions"><button className="btn btn-primary btn-sm">Simpan Perubahan</button></div>
              </div>
            </div>

            {/*Appearance Settings*/}
            <div className={`settings-section${tab === 'appearance' ? ' active' : ''}`} id="settings-appearance" role="tabpanel">
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Tema Antarmuka</h3><p>Pilih tampilan yang nyaman</p></div>
                <div className="theme-options">
                  {[
                    ['light', 'Terang', 'theme-preview-light'],
                    ['dark', 'Gelap', 'theme-preview-dark'],
                    ['system', 'Ikuti sistem', 'theme-preview-system'],
                  ].map(([val, label, preview]) => (
                    <label className={`theme-option${theme === val ? ' selected' : ''}`} key={val} id={`theme-${val}-label`}>
                      <input type="radio" name="theme" value={val} id={`theme-${val}`} checked={theme === val} onChange={() => setTheme(val)} />
                      <div className={`theme-preview ${preview}`}>
                        <div className="tp-sidebar"></div>
                        <div className="tp-content"><div className="tp-bar"></div><div className="tp-card"></div></div>
                      </div>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Ukuran Teks</h3><p>Sesuaikan keterbacaan</p></div>
                <div className="font-size-options">
                  <button className="font-size-opt">Kecil</button>
                  <button className="font-size-opt active">Sedang</button>
                  <button className="font-size-opt">Besar</button>
                </div>
              </div>
            </div>

            {/*Notification Settings*/}
            <div className={`settings-section${tab === 'notifications-settings' ? ' active' : ''}`} id="settings-notifications-settings" role="tabpanel">
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Preferensi Notifikasi</h3><p>Atur kapan Anda ingin diberitahu</p></div>
                <div className="settings-toggle-list">
                  <div className="settings-toggle-item">
                    <div><strong>Pesan chat baru</strong><small>Notifikasi saat ada pertanyaan masuk</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><strong>Pembaruan dokumen</strong><small>Notifikasi saat dokumen diperbarui</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><strong>Laporan mingguan</strong><small>Ringkasan aktivitas setiap Senin</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><strong>Peringatan sistem</strong><small>Notifikasi kritis tentang status sistem</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><strong>Notifikasi email</strong><small>Kirim notifikasi ke email terdaftar</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/*Security Settings*/}
            <div className={`settings-section${tab === 'security' ? ' active' : ''}`} id="settings-security" role="tabpanel">
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Kata Sandi</h3><p>Perbarui kata sandi secara berkala</p></div>
                <div className="form-group">
                  <label htmlFor="sec-current-pw">Kata Sandi Saat Ini</label>
                  <div className="input-wrap">
                    <span className="input-icon"><svg viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></span>
                    <input type="password" id="sec-current-pw" placeholder="Kata sandi saat ini" />
                    <button type="button" className="input-toggle-pw" data-target="sec-current-pw" aria-label="Tampilkan"><svg viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/></svg></button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="sec-new-pw">Kata Sandi Baru</label>
                  <div className="input-wrap">
                    <span className="input-icon"><svg viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></span>
                    <input type="password" id="sec-new-pw" placeholder="Min. 8 karakter" />
                    <button type="button" className="input-toggle-pw" data-target="sec-new-pw" aria-label="Tampilkan"><svg viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/></svg></button>
                  </div>
                </div>
                <div className="settings-actions"><button className="btn btn-primary btn-sm" id="change-pw-btn">Ubah Kata Sandi</button></div>
              </div>
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Sesi Aktif</h3><p>Kelola perangkat yang masuk</p></div>
                <div className="session-item">
                  <div className="session-icon">
                    <svg viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="9.5" r="1" fill="currentColor"/></svg>
                  </div>
                  <div className="session-info">
                    <strong>Windows · Chrome</strong>
                    <small>Bandung, Indonesia · Sekarang (Sesi ini)</small>
                  </div>
                  <span className="session-badge current">Aktif</span>
                </div>
                <div className="session-item">
                  <div className="session-icon">
                    <svg viewBox="0 0 20 20" fill="none"><rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>
                  </div>
                  <div className="session-info">
                    <strong>Android · Chrome</strong>
                    <small>Bandung, Indonesia · 2 hari lalu</small>
                  </div>
                  <button className="btn btn-danger-outline btn-sm">Hapus</button>
                </div>
              </div>
            </div>

            {/*Chatbot Settings*/}
            <div className={`settings-section${tab === 'chatbot' ? ' active' : ''}`} id="settings-chatbot" role="tabpanel">
              <div className="settings-card panel">
                <div className="settings-card-header"><h3>Konfigurasi Asisten AI</h3><p>Atur perilaku chatbot Anda</p></div>
                <div className="form-group">
                  <label>Bahasa respons chatbot</label>
                  <select className="settings-select" defaultValue="Bahasa Indonesia">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                    <option>Bilingual (ID/EN)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gaya respons</label>
                  <select className="settings-select" defaultValue="Formal & informatif">
                    <option>Formal &amp; informatif</option>
                    <option>Santai &amp; ramah</option>
                    <option>Singkat &amp; padat</option>
                  </select>
                </div>
                <div className="settings-toggle-list">
                  <div className="settings-toggle-item">
                    <div><strong>Tampilkan sumber referensi</strong><small>Cantumkan sumber dokumen dalam jawaban</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><strong>Mode saran otomatis</strong><small>Tampilkan pertanyaan terkait setelah respons</small></div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="settings-actions"><button className="btn btn-primary btn-sm">Simpan Konfigurasi</button></div>
              </div>
            </div>
          </div>
        </div>
      </section>

<footer className="page-footer"><span>© 2025 Komunitas Halal Bandung</span><span>Chatbot edukasi halal <i>●</i> 1 role: Admin</span></footer>
    </>
  );
}
