export default function SyaratPage() {
  return (
    <>
<div className="landing-page">


  <header className="legal-hero-v2">
    <div className="lp-container" style={{position:'relative'}}>
      <a className="legal-back" href="/">← Kembali ke Beranda</a>
      <div className="legal-crumb"><a href="/">Beranda</a><span>›</span><span>Legal</span><span>›</span><strong style={{color:'#fff'}}>Syarat & Ketentuan</strong></div>
      <div className="lp-hero-badge"><span className="lp-badge-dot"></span>LEGAL · BERLAKU SEJAK 2025</div>
      <h1>Syarat &amp; Ketentuan</h1>
      <p className="sub">Aturan main pemakaian platform edukasi halal KHB. Ringkas, jelas, tanpa basa-basi.</p>
      <div className="legal-meta"><span>📄 5 Pasal</span><span>🤖 Termasuk Disclaimer AI</span><span>🆓 Gratis untuk UMKM</span></div>
    </div>
    <svg className="legal-wave" viewBox="0 0 1440 64" preserveAspectRatio="none"><path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" fill="#fff"/></svg>
  </header>

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
          <li>Data pendaftaran wajib benar dan milik sendiri.</li>
          <li>Jaga kerahasiaan kata sandi; aktivitas akun menjadi tanggung jawab pemilik.</li>
          <li>Satu akun untuk satu pelaku usaha; penyalahgunaan berujung penangguhan.</li>
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
        <div className="row"><a className="btn-w" href="/admin/register">Daftar Gratis</a><a className="btn-o" href="/admin/privasi">Baca Kebijakan Privasi</a></div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
