import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconEye = ({ off }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="2.6" />
    {off ? <path d="m3 3 18 18" /> : null}
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.2h.01" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const notify = useToast();
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('khb_email') || ''; } catch { return ''; }
  });
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
    <AuthLayout
      badge="Masuk"
      title="Masuk ke akun Anda"
      description="Akses khusus pengelola KHB. Kelola basis pengetahuan, kanal, dan percakapan UMKM."
      brandTagline="Edukasi halal untuk semua pelaku usaha Indonesia"
      brandDesc="Asisten AI berbasis pengetahuan resmi BPJPH, siap membantu UMKM dalam proses sertifikasi halal."
      footer={
        <>
          Belum punya akses?{' '}
          <a href="https://halalbandung.com" target="_blank" rel="noreferrer">Hubungi admin KHB</a>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <div className="a2-fields">
          <div className="a2-field">
            <label htmlFor="login-email">Alamat Email</label>
            <div className={`a2-input-wrap${err ? ' has-error' : ''}`}>
              <IconMail />
              <input
                type="email"
                id="login-email"
                placeholder="nama@email.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="a2-field">
            <div className="a2-field-head">
              <label htmlFor="login-password">Kata Sandi</label>
              <Link to="/admin/forgot">Lupa kata sandi?</Link>
            </div>
            <div className="a2-input-wrap has-toggle">
              <IconLock />
              <input
                type={showPw ? 'text' : 'password'}
                id="login-password"
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="a2-pw-toggle"
                aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                onClick={() => setShowPw((v) => !v)}
              >
                <IconEye off={showPw} />
              </button>
            </div>
          </div>

          <label className="a2-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Ingat saya di perangkat ini</span>
          </label>

          {err ? (
            <div className="a2-error" role="alert">
              <IconAlert />
              <span>{err}</span>
            </div>
          ) : null}

          <button type="submit" className="a2-submit" disabled={loading}>
            {loading ? <span className="a2-spinner" /> : null}
            {loading ? 'Memeriksa…' : 'Masuk'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
