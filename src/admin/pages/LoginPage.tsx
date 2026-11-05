import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const notify = useToast();
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('khb_email') || ''; } catch { return ''; } });
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(!!email);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    setErr(bad ? 'Masukkan email yang valid' : '');
    if (bad) return;
    if (loading) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      try {
        if (remember) localStorage.setItem('khb_email', email.trim());
        else localStorage.removeItem('khb_email');
      } catch {
        // abaikan storage penuh
      }
      notify('Berhasil masuk');
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Email atau sandi salah');
      notify(error instanceof Error ? error.message : 'Email atau sandi salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
<div className="auth-pages" id="auth-pages">
<div className="auth-page active" id="page-login">
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
            <h2 className="auth-panel-tagline">Edukasi halal untuk semua pelaku usaha Indonesia</h2>
            <p className="auth-panel-desc">Asisten AI berbasis pengetahuan resmi BPJPH, siap membantu UMKM dalam proses sertifikasi halal.</p>
            <div className="auth-hero-card">
              <div className="kicker">KENAPA KHB?</div>
              <h3>Jawaban halal akurat dalam &lt; 2 detik</h3>
              <p>Berbasis 38 dokumen resmi BPJPH — bukan tebakan AI generik.</p>
              <span className="proof"><span className="avatars"><span style={{background:'#86efac',color:'#15803d'}}>RA</span><span style={{background:'#93c5fd',color:'#1d4ed8'}}>DP</span><span style={{background:'#fca5a5',color:'#dc2626'}}>SW</span></span>847+ UMKM terbantu</span>
            </div>
            <div className="auth-trust">
              <span>✦ Gratis selamanya</span><span>✦ Data terenkripsi</span><span>✦ Rujukan BPJPH</span>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <Link to="/" className="auth-back-link back-home">
                <svg viewBox="0 0 20 20" fill="none"><path d="M13 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Beranda
              </Link>
              <div><span className="auth-badge"><i></i>MASUK</span></div>
              <h1>Masuk ke akun Anda</h1>
              <p>Belum punya akun? <Link to="/admin/register" className="auth-link">Daftar sekarang</Link></p>
            </div>
            <form className="auth-form" id="login-form" noValidate onSubmit={submit}>
              <div className="form-group">
                <div className={`input-wrap float-wrap${err ? ' invalid' : ''}`}>
                  <span className="input-icon">
                    <svg viewBox="0 0 20 20" fill="none"><path d="M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/><path d="m2 6 8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </span>
                  <input type="email" id="login-email" placeholder=" " autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label className="floating" htmlFor="login-email">Alamat Email</label>
                </div>
                {err ? <span className="field-err show">{err}</span> : null}
              </div>
              <div className="form-group">
                <div className="pw-label-row">
                  <span>Kata Sandi</span>
                  <Link to="/admin/forgot" className="auth-link-small">Lupa kata sandi?</Link>
                </div>
                <div className="input-wrap float-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </span>
                  <input type={showPw ? 'text' : 'password'} id="login-password" placeholder=" " autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <label className="floating" htmlFor="login-password">Masukkan kata sandi</label>
                  <button type="button" className="input-toggle-pw" aria-label="Tampilkan kata sandi" onClick={() => setShowPw((v) => !v)}>
                    <svg viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/></svg>
                  </button>
                </div>
              </div>
              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" id="login-remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="checkbox-custom"></span>
                  <span>Ingat saya</span>
                </label>
              </div>
              <button type="submit" className="btn-auth" id="login-btn" disabled={loading}>
                <span className="btn-text">{loading ? 'Memeriksa...' : 'Masuk'}</span>
                <span className={`btn-loader${loading ? '' : ' hidden'}`}></span>
              </button>
              <div className="auth-social">
                <button type="button" className="btn-social" id="google-login" onClick={() => notify('Masuk dengan Google belum tersedia. Gunakan email dan sandi.')}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
</div>
    </>
  );
}
