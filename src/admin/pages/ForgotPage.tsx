import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ForgotPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { notify('Masukkan alamat email yang valid'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try { sessionStorage.setItem('khb_reset_email', email.trim()); } catch {}
      notify('Kode OTP dikirim ke ' + email.trim());
      navigate('/admin/reset');
    }, 800);
  };

  return (
    <>
<div className="auth-pages" id="auth-pages">
<div className="auth-page active" id="page-forgot">
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
            <h2 className="auth-panel-tagline">Lupa kata sandi? Tenang, kami bantu.</h2>
            <p className="auth-panel-desc">Masukkan email terdaftar — kode OTP meluncur ke inbox Anda dalam hitungan detik.</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <Link to="/" className="auth-back-link back-home">Beranda</Link>
              <div><span className="auth-badge"><i></i>RESET AKSES</span></div>
              <h1>Lupa Kata Sandi?</h1>
              <p>Masukkan email terdaftar — kode OTP 6 digit meluncur ke inbox Anda.</p>
            </div>
            <form className="auth-form" id="forgot-form" noValidate onSubmit={submit}>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <span className="input-icon"><svg viewBox="0 0 20 20" fill="none"><path d="M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/><path d="m2 6 8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></span>
                  <input type="email" id="forgot-email" placeholder=" " required aria-label="Alamat Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label className="floating" htmlFor="forgot-email">Alamat Email</label>
                </div>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                <span className="btn-text">{loading ? 'Mengirim...' : 'Kirim Kode OTP'}</span>
                <span className={`btn-loader${loading ? '' : ' hidden'}`}></span>
              </button>
            </form>
            <div className="auth-card-footer">
              <Link to="/admin/login" className="auth-back-link">Kembali ke halaman masuk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
    </>
  );
}
