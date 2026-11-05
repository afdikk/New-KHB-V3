import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="public-shell">
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 64, fontWeight: 800, color: 'var(--green)', letterSpacing: '-2px' }}>404</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink)', margin: '4px 0 8px' }}>Halaman tidak ditemukan</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>
          Tautan yang Anda buka mungkin sudah dipindahkan atau tidak tersedia pada prototipe ini.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/admin/dashboard">Ke Panel Admin</Link>
          <Link className="btn btn-secondary" to="/">Buka Situs</Link>
        </div>
      </div>
    </div>
  );
}
