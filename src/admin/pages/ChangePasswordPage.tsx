import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.next.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setError('');
    notify('Kata sandi berhasil diperbarui');
    navigate('/admin/settings');
  };

  return (
    <div className="auth-pages">
      <div className="auth-page active">
        <div className="auth-centered">
          <div className="auth-card">
            <div className="auth-card-icon-wrap">
              <div className="auth-card-icon">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <h1 className="auth-card-title">Ubah kata sandi</h1>
            <p className="auth-card-desc">Gunakan kata sandi baru yang kuat dan belum pernah dipakai.</p>

            <form className="auth-form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="cur">Kata sandi saat ini</label>
                <div className="input-wrap">
                  <input id="cur" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} placeholder="••••••••" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="new">Kata sandi baru</label>
                <div className="input-wrap">
                  <input id="new" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} placeholder="Minimal 8 karakter" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="conf">Konfirmasi kata sandi baru</label>
                <div className="input-wrap">
                  <input id="conf" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Ulangi kata sandi baru" required />
                </div>
              </div>

              {error ? <p className="field-err" role="alert">{error}</p> : null}

              <button className="btn-auth" type="submit">Simpan Kata Sandi</button>
            </form>

            <div className="auth-card-footer">
              <Link className="auth-link-small" to="/admin/settings">Kembali ke pengaturan</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
