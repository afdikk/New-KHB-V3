import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import AuthLayout from '../components/AuthLayout';

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.2h.01" />
  </svg>
);

export default function ResetPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [sec, setSec] = useState(60);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let em = '';
    try { em = sessionStorage.getItem('khb_reset_email') || ''; } catch {}
    if (!em) {
      notify('Isi email dulu di halaman lupa kata sandi');
      navigate('/admin/forgot');
      return;
    }
    setEmail(em);
    boxes.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (sec <= 0) return;
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);

  const setDigit = (i: number, v: string) => {
    v = v.replace(/\D/g, '').slice(0, 1);
    const nd = [...digits];
    nd[i] = v;
    setDigits(nd);
    if (v && i < 5) boxes.current[i + 1]?.focus();
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.join('').length < 6) {
      setErr('Lengkapi 6 digit OTP terlebih dahulu');
      return;
    }
    setErr('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try { sessionStorage.setItem('khb_otp_ok', '1'); } catch {}
      setVerified(true);
      notify('OTP benar — buat kata sandi baru');
    }, 700);
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || pw.length < 8) {
      setErr('Kata sandi minimal 8 karakter');
      return;
    }
    if (pw !== confirm) {
      setErr('Kata sandi tidak cocok');
      return;
    }
    setErr('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.removeItem('khb_otp_ok');
        sessionStorage.removeItem('khb_reset_email');
      } catch {}
      notify('Kata sandi berhasil direset!');
      navigate('/admin/login');
    }, 700);
  };

  return (
    <AuthLayout
      badge="Kata sandi baru"
      title="Reset kata sandi"
      description={
        verified
          ? 'OTP terverifikasi. Buat kata sandi baru yang kuat.'
          : `Masukkan 6 digit kode yang dikirim ke ${email || 'email Anda'}.`
      }
      brandTagline="Satu langkah lagi kembali masuk."
      brandDesc="Verifikasi kode OTP, lalu buat kata sandi baru yang aman untuk akun pengelola KHB."
      footer={
        <>
          Sudah selesai? <Link to="/admin/login">Kembali masuk</Link>
        </>
      }
    >
      <div className="a2-steps">
        <span className={`a2-step${verified ? '' : ' on'}`}>
          <i>{verified ? '✓' : '1'}</i>OTP
        </span>
        <span className="a2-step-bar" />
        <span className={`a2-step${verified ? ' on' : ''}`}>
          <i>{verified ? '✓' : '2'}</i>Sandi baru
        </span>
      </div>

      {!verified ? (
        <form onSubmit={verify} noValidate>
          <div className="a2-fields">
            <div className="a2-field">
              <label>Kode OTP</label>
              <div className="a2-otp">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el; }}
                    className={d ? 'filled' : ''}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
                    }}
                    onPaste={(e) => {
                      const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
                      if (!t) return;
                      e.preventDefault();
                      const nd = [...digits];
                      t.split('').forEach((ch, j) => { nd[j] = ch; });
                      setDigits(nd);
                      boxes.current[Math.min(t.length, 5)]?.focus();
                    }}
                  />
                ))}
              </div>
              <div className="a2-otp-meta">
                <span>Dikirim ke {email || 'email Anda'}</span>
                <button
                  type="button"
                  className="a2-resend"
                  disabled={sec > 0}
                  onClick={() => { notify('Kode OTP baru dikirim'); setSec(60); }}
                >
                  {sec > 0 ? `Kirim ulang dalam ${sec} detik` : 'Kirim ulang kode'}
                </button>
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
              {loading ? 'Memeriksa…' : 'Verifikasi OTP'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={reset} noValidate>
          <div className="a2-fields">
            <div className="a2-field">
              <label htmlFor="reset-password">Kata Sandi Baru</label>
              <div className="a2-input-wrap">
                <IconLock />
                <input
                  type="password"
                  id="reset-password"
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  required
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
              </div>
            </div>

            <div className="a2-field">
              <label htmlFor="reset-confirm">Konfirmasi Kata Sandi</label>
              <div className="a2-input-wrap">
                <IconLock />
                <input
                  type="password"
                  id="reset-confirm"
                  placeholder="Ulangi kata sandi baru"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? 'Menyimpan…' : 'Simpan Kata Sandi Baru'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
