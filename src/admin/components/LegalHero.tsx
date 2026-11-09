import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Header halaman legal (Syarat & Privasi).
 *
 * Versi sebelumnya mencampur tiga perataan sekaligus: tombol kembali dan
 * breadcrumb menempel ke tepi kiri layar, judul rata kiri, sementara subjudul
 * dan chip meta di tengah — tanpa pembungkus `max-width` sehingga isinya
 * menyentuh tepi jendela. Komponen ini memakai satu kolom terpusat:
 *
 *   baris atas (kembali · breadcrumb)  →  blok teks terpusat  →  chip meta
 *
 * Semua elemen berada di dalam `.legal-hero-inner` sehingga tepi kirinya
 * sejajar dengan kartu isi di bawahnya.
 */
export default function LegalHero({
  crumb,
  badge,
  title,
  subtitle,
  meta,
}: {
  /** Label halaman aktif di breadcrumb, mis. "Syarat & Ketentuan". */
  crumb: string;
  /** Teks kecil di atas judul, mis. "LEGAL · BERLAKU SEJAK 2025". */
  badge: string;
  title: string;
  subtitle: string;
  meta: ReactNode;
}) {
  return (
    <header className="legal-hero">
      <div className="legal-hero-inner">
        <div className="legal-topbar">
          <Link to="/" className="legal-back">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Beranda
          </Link>

          <nav className="legal-crumb" aria-label="Breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Legal</span>
            <span aria-hidden="true">/</span>
            <strong>{crumb}</strong>
          </nav>
        </div>

        <div className="legal-hero-copy">
          <span className="legal-badge">
            <i aria-hidden="true" />
            {badge}
          </span>
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
          <div className="legal-meta">{meta}</div>
        </div>
      </div>

      <svg className="legal-wave" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" fill="#fff" />
      </svg>
    </header>
  );
}
