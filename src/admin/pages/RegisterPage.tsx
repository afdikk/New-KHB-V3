import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const { user, setUser } = useApp();
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', pw: '', confirm: '', terms: false });
  const [loading, setLoading] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } as typeof f);

  const score = [f.pw.length >= 8, /[A-Z]/.test(f.pw), /[0-9]/.test(f.pw), /[^a-zA-Z0-9]/.test(f.pw)].filter(Boolean).length;
  const bar = f.pw ? (score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong') : '';
  const label = !f.pw ? 'Masukkan kata sandi' : score <= 1 ? 'Lemah' : score <= 2 ? 'Sedang' : 'Kuat';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.first || !f.last || !f.email || !f.pw) { notify('Harap lengkapi semua kolom yang wajib'); return; }
    if (f.pw.length < 8) { notify('Kata sandi minimal 8 karakter'); return; }
    if (f.pw !== f.confirm) { notify('Kata sandi tidak cocok'); return; }
    if (!f.terms) { notify('Harap setujui syarat & ketentuan'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({ ...user, firstName: f.first, lastName: f.last, email: f.email, initials: (f.first[0] + (f.last[0] || '')).toUpperCase() });
      notify('Akun berhasil dibuat! Selamat datang, ' + f.first + '!');
      navigate('/admin/dashboard');
    }, 900);
  };

  return (
    <>
<div className="auth-pages" id="auth-pages">
<div className="auth-page active" id="page-register">
      <div className="auth-split">
        <div className="auth-brand-panel">
          <span className="blob auth-blob-1"></span>
          <span className="blob auth-blob-2"></span>
          <div className="auth-brand-inner">
            <div className="auth-logo-wrap">
              <div className="auth-logo">
                <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
                  <path d="M22 4 36 9.5v11C36 29.8 30 35.3 22 38.8 14 35.3 8 29.8 8 20.5v-11L22 4Z" fill="currentColor" opacity=".18"/>
                  <path d="m13.5 22 5.2 5.1 11-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="auth-brand-name">komunitas<span>halal</span></div>
                <div className="auth-brand-sub">BANDUNG · AI ASSISTANT</div>
              </div>
            </div>
            <h2 className="auth-panel-tagline">Bergabung dengan 847+ UMKM halal.</h2>
            <p className="auth-panel-desc">Daftar gratis — akses edukasi halal, chat AI, dan panduan sertifikasi.</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <Link to="/" className="auth-back-link back-home">Beranda</Link>
              <div><span className="auth-badge"><i></i>DAFTAR</span></div>
              <h1>Buat akun baru</h1>
              <p>Sudah punya akun? <Link to="/admin/login" className="auth-link">Masuk</Link></p>
            </div>
            <form className="auth-form" id="register-form" noValidate onSubmit={submit}>
              <div className="form-row-2">
                <div className="form-group">
                  <div className="input-wrap float-wrap">
                    <input type="text" id="reg-firstname" placeholder=" " required value={f.first} onChange={set('first')} />
                    <label className="floating" htmlFor="reg-firstname">Nama Depan</label>
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-wrap float-wrap">
                    <input type="text" id="reg-lastname" placeholder=" " required value={f.last} onChange={set('last')} />
                    <label className="floating" htmlFor="reg-lastname">Nama Belakang</label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type="email" id="reg-email" placeholder=" " required value={f.email} onChange={set('email')} />
                  <label className="floating" htmlFor="reg-email">Alamat Email</label>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type="tel" id="reg-phone" placeholder=" " value={f.phone} onChange={set('phone')} />
                  <label className="floating" htmlFor="reg-phone">No. WhatsApp (opsional)</label>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type={show1 ? 'text' : 'password'} id="reg-password" placeholder=" " required value={f.pw} onChange={set('pw')} />
                  <label className="floating" htmlFor="reg-password">Kata Sandi (min. 8)</label>
                  <button type="button" className="input-toggle-pw" aria-label="Tampilkan" onClick={() => setShow1((v) => !v)}>👁</button>
                </div>
                <div className="pw-strength"><span id="pw-bar-fill" className={bar} style={{ width: f.pw ? (score / 4) * 100 + '%' : '0' }}></span></div>
                <span id="pw-strength-label">{label}</span>
              </div>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type={show2 ? 'text' : 'password'} id="reg-confirm" placeholder=" " required value={f.confirm} onChange={set('confirm')} />
                  <label className="floating" htmlFor="reg-confirm">Konfirmasi Kata Sandi</label>
                  <button type="button" className="input-toggle-pw" aria-label="Tampilkan" onClick={() => setShow2((v) => !v)}>👁</button>
                </div>
              </div>
              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" id="reg-terms" required checked={f.terms} onChange={set('terms')} />
                  <span className="checkbox-custom"></span>
                  <span>Saya setuju dengan <Link to="/admin/syarat" className="auth-link">Syarat</Link> &amp; <Link to="/admin/privasi" className="auth-link">Privasi</Link></span>
                </label>
              </div>
              <button type="submit" className="btn-auth" id="register-btn" disabled={loading}>
                <span className="btn-text">{loading ? 'Membuat akun...' : 'Buat Akun'}</span>
                <span className={`btn-loader${loading ? '' : ' hidden'}`}></span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
</div>
    </>
  );
}
