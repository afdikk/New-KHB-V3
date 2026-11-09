import { Link } from 'react-router-dom';
import LegalHero from '../components/LegalHero';

export default function SyaratPage() {
  return (
    <div className="landing-page">
      <LegalHero
        crumb="Syarat & Ketentuan"
        badge="Legal · Berlaku sejak 2025"
        title="Syarat & Ketentuan"
        subtitle="Aturan main pemakaian platform edukasi halal KHB. Ringkas, jelas, tanpa basa-basi."
        meta={
          <>
            <span>📄 5 Pasal</span>
            <span>🤖 Termasuk Disclaimer AI</span>
            <span>🆓 Gratis untuk UMKM</span>
          </>
        }
      />

      <div className="legal-layout">
        <aside className="legal-toc-v2">
          <strong>DAFTAR ISI</strong>
          <nav>
            <a href="#layanan"><i>1</i>Layanan</a>
            <a href="#akun"><i>2</i>Akun Pengguna</a>
            <a href="#konten"><i>3</i>Penggunaan Wajar</a>
            <a href="#disclaimer-ai"><i>4</i>Disclaimer AI</a>
            <a href="#kontak"><i>5</i>Kontak</a>
          </nav>
        </aside>

        <div className="legal-doc">
          <section className="legal-pasal" id="layanan">
            <div className="legal-pasal-head"><span className="legal-pasal-num">1</span><h2>Layanan</h2></div>
            <p>KHB menyediakan asisten edukasi halal berbasis AI: tanya jawab sertifikasi halal, panduan self declare, checklist dokumen, dan rujukan regulasi. Layanan gratis untuk UMKM Indonesia dan dapat berubah tanpa pemberitahuan demi peningkatan kualitas.</p>
          </section>

          <section className="legal-pasal" id="akun">
            <div className="legal-pasal-head"><span className="legal-pasal-num">2</span><h2>Akun Pengguna</h2></div>
            <ol>
              <li>Data akun wajib benar dan milik pengelola yang berwenang.</li>
              <li>Jaga kerahasiaan kata sandi; aktivitas akun menjadi tanggung jawab pemilik.</li>
              <li>Akun pengelola dikelola terpusat oleh admin KHB; berbagi akses di luar tim tidak diperkenankan.</li>
            </ol>
          </section>

          <section className="legal-pasal" id="konten">
            <div className="legal-pasal-head"><span className="legal-pasal-num">3</span><h2>Penggunaan Wajar</h2></div>
            <ul>
              <li>Dilarang spam, scraping massal, atau membebani sistem.</li>
              <li>Dilarang mengunggah konten melanggar hukum atau menyesatkan.</li>
              <li>Dilarang mengklaim jawaban AI sebagai fatwa/keputusan resmi.</li>
            </ul>
          </section>

          <section className="legal-pasal" id="disclaimer-ai">
            <div className="legal-pasal-head"><span className="legal-pasal-num">4</span><h2>Disclaimer AI</h2></div>
            <p>Jawaban AI bersifat <strong>edukatif dan informatif</strong>, bukan pengganti keputusan BPJPH, Komite Fatwa, atau Pendamping PPH.</p>
            <div className="legal-hi warn">⚠️ Selalu verifikasi ke <strong>SIHALAL (sihalal.halal.go.id)</strong> atau pendamping resmi sebelum mengajukan sertifikasi.</div>
          </section>

          <section className="legal-pasal" id="kontak">
            <div className="legal-pasal-head"><span className="legal-pasal-num">5</span><h2>Kontak</h2></div>
            <p>Ada pertanyaan soal ketentuan ini? Kunjungi <a href="https://halalbandung.com" target="_blank" rel="noreferrer" className="auth-link">halalbandung.com</a> atau hubungi tim KHB via kanal resmi komunitas.</p>
            <div className="legal-hi">ⓘ Terakhir diperbarui: 2025. Penggunaan platform setelah pembaruan dianggap sebagai persetujuan atas ketentuan terbaru.</div>
          </section>

          <div className="legal-cta">
            <h3>Siap mulai perjalanan halal Anda?</h3>
            <p>Gratis, tanpa kartu kredit, langsung bisa tanya AI.</p>
            <div className="row">
              <Link className="btn-w" to="/admin/login">Masuk &amp; Mulai Tanya</Link>
              <Link className="btn-o" to="/admin/privasi">Baca Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
