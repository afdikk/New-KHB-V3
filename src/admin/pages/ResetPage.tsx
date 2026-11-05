import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ResetPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sec, setSec] = useState(60);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let em = '';
    try { em = sessionStorage.getItem('khb_reset_email') || ''; } catch {}
    if (!em) { notify('Isi email dulu di halaman lupa kata sandi'); navigate('/admin/forgot'); return; }
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
    const nd = [...digits]; nd[i] = v; setDigits(nd);
    if (v && i < 5) boxes.current[i + 1]?.focus();
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.join('').length < 6) { notify('Lengkapi 6 digit OTP'); return; }
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
    if (!pw || pw.length < 8) { notify('Kata sandi minimal 8 karakter'); return; }
    if (pw !== confirm) { notify('Kata sandi tidak cocok'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try { sessionStorage.removeItem('khb_otp_ok'); sessionStorage.removeItem('khb_reset_email'); } catch {}
      notify('Kata sandi berhasil direset!');
      navigate('/admin/login');
    }, 700);
  };

  return (
    <>
<div className="auth-pages" id="auth-pages">
<div className="auth-page active" id="page-reset">
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
            <h2 className="auth-panel-tagline">Satu langkah lagi kembali masuk.</h2>
            <p className="auth-panel-desc">Verifikasi OTP, lalu buat kata sandi baru yang kuat.</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <Link to="/" className="auth-back-link back-home">Beranda</Link>
              <div><span className="auth-badge"><i></i>KATA SANDI BARU</span></div>
              <h1>Reset Kata Sandi</h1>
              <p>{verified ? 'OTP terverifikasi. Buat kata sandi baru Anda.' : 'Masukkan 6 digit kode OTP yang dikirim ke email Anda.'}</p>
            </div>
            <div className="stepper-mini">
              <span className={`step-mini${verified ? '' : ' on'}`}><i>{verified ? '✓' : '1'}</i>OTP</span>
              <span className="step-mini-bar"></span>
              <span className={`step-mini${verified ? ' on' : ''}`}><i>{verified ? '✓' : '2'}</i>Sandi baru</span>
            </div>
            {!verified ? (
            <form className="auth-form" id="otp-form" noValidate onSubmit={verify}>
              <div className="form-group">
                <label>Kode OTP</label>
                <div className="otp-row" id="otp-row">
                  {digits.map((d, i) => (
                    <input key={i} ref={(el) => { boxes.current[i] = el; }} className={`otp-box${d ? ' filled' : ''}`}
                      inputMode="numeric" maxLength={1} aria-label={'Digit ' + (i + 1)} value={d}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus(); }}
                      onPaste={(e) => {
                        const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
                        if (!t) return;
                        e.preventDefault();
                        const nd = [...digits];
                        t.split('').forEach((ch, j) => { nd[j] = ch; });
                        setDigits(nd);
                        boxes.current[Math.min(t.length, 5)]?.focus();
                      }} />
                  ))}
                </div>
                <div className="otp-meta">
                  <span>Dikirim ke {email || 'email Anda'}</span>
                  <button type="button" className="otp-resend" disabled={sec > 0} onClick={() => { notify('Kode OTP baru dikirim'); setSec(60); }}>
                    {sec > 0 ? 'Kirim ulang (' + sec + 'd)' : 'Kirim ulang kode'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                <span className="btn-text">{loading ? 'Memeriksa...' : 'Verifikasi OTP'}</span>
                <span className={`btn-loader${loading ? '' : ' hidden'}`}></span>
              </button>
            </form>
            ) : (
            <form className="auth-form" id="reset-form" noValidate onSubmit={reset}>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type="password" id="reset-password" placeholder=" " required aria-label="Kata Sandi Baru" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <label className="floating" htmlFor="reset-password">Kata Sandi Baru (min. 8)</label>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrap float-wrap">
                  <input type="password" id="reset-confirm" placeholder=" " required aria-label="Konfirmasi Kata Sandi" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  <label className="floating" htmlFor="reset-confirm">Konfirmasi Kata Sandi</label>
                </div>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                <span className="btn-text">{loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                <span className={`btn-loader${loading ? '' : ' hidden'}`}></span>
              </button>
            </form>
            )}
            <div className="auth-card-footer" style={{marginTop:'18px'}}>
              <Link to="/admin/login" className="auth-back-link">Kembali masuk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
    </>
  );
}
