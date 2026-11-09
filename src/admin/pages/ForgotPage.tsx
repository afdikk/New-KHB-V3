import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import AuthLayout from '../components/AuthLayout';

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.2h.01" />
  </svg>
);

export default function ForgotPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErr('Masukkan alamat email yang valid');
      return;
    }
    setErr('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try { sessionStorage.setItem('khb_reset_email', email.trim()); } catch {}
      notify('Kode OTP dikirim ke ' + email.trim());
      navigate('/admin/reset');
    }, 800);
  };

  return (
    <AuthLayout
      badge="Reset akses"
      title="Lupa kata sandi?"
      description="Masukkan email terdaftar — kami kirim kode OTP 6 digit untuk membuat kata sandi baru."
      brandTagline="Lupa kata sandi? Tenang, kami bantu."
      brandDesc="Verifikasi lewat email terdaftar, lalu buat kata sandi baru. Prosesnya kurang dari satu menit."
      footer={
        <>
          Sudah ingat sandi? <Link to="/admin/login">Kembali masuk</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <div className="a2-fields">
          <div className="a2-field">
            <label htmlFor="forgot-email">Alamat Email Terdaftar</label>
            <div className="a2-input-wrap">
              <IconMail />
              <input
                type="email"
                id="forgot-email"
                placeholder="nama@email.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {err ? (
            <div className="a2-error" role="alert">
              <IconAlert />
              <span>{err}</span>
            </div>
          ) : null}

          <button type="submit" className="a2-submit" disabled={loading}>
            {loading ? <span className="a2-spinner" /> : null}
            {loading ? 'Mengirim…' : 'Kirim Kode OTP'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
