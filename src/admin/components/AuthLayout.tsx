import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Kerangka halaman autentikasi (login, lupa sandi, reset sandi).
 *
 * Dua kolom di layar lebar:
 *   kiri  — panel merek bergradien dengan pesan nilai + bukti sosial
 *   kanan — kartu formulir yang ringkas dan fokus
 *
 * Di layar sempit panel merek disembunyikan dan formulir memakai lebar penuh,
 * sehingga alur login tetap satu tangan di ponsel.
 */
export default function AuthLayout({
  badge,
  title,
  description,
  children,
  footer,
  brandTagline,
  brandDesc,
}: {
  /** Label kecil di atas judul formulir, mis. "Masuk". */
  badge: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** Tautan tambahan di bawah formulir. */
  footer?: ReactNode;
  /** Kalimat besar di panel merek (kiri). */
  brandTagline: string;
  brandDesc: string;
}) {
  return (
    <div className="a2-page">
      <aside className="a2-brand">
        <span className="a2-blob a2-blob-1" aria-hidden="true" />
        <span className="a2-blob a2-blob-2" aria-hidden="true" />
        <span className="a2-noise" aria-hidden="true" />

        <div className="a2-brand-inner">
          <Link to="/" className="a2-logo">
            <span className="a2-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 20 6v6c0 4.6-3.4 8-8 9.2C7.4 20 4 16.6 4 12V6l8-3Z" />
                <path d="m8.8 12.2 2.4 2.3 4.2-4.7" />
              </svg>
            </span>
            <span className="a2-logo-copy">
              <strong>komunitas<span>halal</span></strong>
              <small>BANDUNG · AI ASSISTANT</small>
            </span>
          </Link>

          <h2 className="a2-brand-title">{brandTagline}</h2>
          <p className="a2-brand-desc">{brandDesc}</p>

          <div className="a2-chat-preview" aria-hidden="true">
            <div className="a2-chat-row">
              <span className="a2-chat-ava">K</span>
              <div className="a2-chat-bubble">
                Assalamu&apos;alaikum! Mau tanya soal sertifikasi halal atau self declare?
              </div>
            </div>
            <div className="a2-chat-row user">
              <div className="a2-chat-bubble">Dokumen apa saja yang perlu saya siapkan?</div>
            </div>
            <div className="a2-chat-row">
              <span className="a2-chat-ava">K</span>
              <div className="a2-chat-bubble">
                NIB, KTP, daftar produk &amp; bahan, alur produksi, dan foto kemasan.
              </div>
            </div>
          </div>

          <div className="a2-brand-stats">
            <div><strong>1.200+</strong><span>sertifikat didampingi</span></div>
            <span className="a2-stat-div" aria-hidden="true" />
            <div><strong>8</strong><span>dokumen rujukan</span></div>
            <span className="a2-stat-div" aria-hidden="true" />
            <div><strong>&lt;2 dtk</strong><span>waktu jawab</span></div>
          </div>

          <div className="a2-brand-trust">
            <span>✦ Gratis untuk UMKM</span>
            <span>✦ Rujukan BPJPH</span>
            <span>✦ Data terenkripsi</span>
          </div>
        </div>
      </aside>

      <main className="a2-form-side">
        <div className="a2-form-inner">
          <div className="a2-form-head">
            <Link to="/" className="a2-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              Beranda
            </Link>

            <span className="a2-badge"><i />{badge}</span>
            <h1>{title}</h1>
            <p className="a2-form-desc">{description}</p>
          </div>

          {children}

          {footer ? <div className="a2-form-foot">{footer}</div> : null}

          <p className="a2-legal">
            Dengan melanjutkan, Anda menyetujui{' '}
            <Link to="/admin/syarat">Syarat &amp; Ketentuan</Link> dan{' '}
            <Link to="/admin/privasi">Kebijakan Privasi</Link> KHB.
          </p>
        </div>
      </main>
    </div>
  );
}
