export default function PrivasiPage() {
  return (
    <>
<div className="landing-page">


  <header className="legal-hero-v2">
    <div className="lp-container" style={{position:'relative'}}>
      <a className="legal-back" href="/">← Kembali ke Beranda</a>
      <div className="legal-crumb"><a href="/">Beranda</a><span>›</span><span>Legal</span><span>›</span><strong style={{color:'#fff'}}>Kebijakan Privasi</strong></div>
      <div className="lp-hero-badge"><span className="lp-badge-dot"></span>LEGAL · DATA ANDA AMAN</div>
      <h1>Kebijakan Privasi</h1>
      <p className="sub">Data apa yang kami kumpulkan, kenapa, dan bagaimana Anda mengendalikannya.</p>
      <div className="legal-meta"><span>🔒 Enkripsi</span><span>🚫 Tanpa jual data</span><span>🗑️ Hapus kapan saja</span></div>
    </div>
    <svg className="legal-wave" viewBox="0 0 1440 64" preserveAspectRatio="none"><path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" fill="#fff"/></svg>
  </header>

  <div className="legal-layout">
    <aside className="legal-toc-v2">
      <strong>DAFTAR ISI</strong>
      <nav>
        <a href="#kumpul"><i>1</i>Data Dikumpulkan</a>
        <a href="#guna"><i>2</i>Penggunaan</a>
        <a href="#simpan"><i>3</i>Penyimpanan</a>
        <a href="#hak"><i>4</i>Hak Anda</a>
      </nav>
    </aside>
    <div className="legal-doc">
      <section className="legal-pasal" id="kumpul">
        <div className="legal-pasal-head"><span className="legal-pasal-num">1</span><h2>Data yang Dikumpulkan</h2></div>
        <ol>
          <li><strong>Akun:</strong> nama, email, nomor WhatsApp (opsional), organisasi.</li>
          <li><strong>Interaksi:</strong> riwayat pertanyaan chatbot untuk peningkatan jawaban.</li>
          <li><strong>Teknis:</strong> tipe perangkat &amp; log error anonim untuk stabilitas.</li>
        </ol>
      </section>
      <section className="legal-pasal" id="guna">
        <div className="legal-pasal-head"><span className="legal-pasal-num">2</span><h2>Penggunaan Data</h2></div>
        <ul>
          <li>Menyediakan &amp; memperbaiki jawaban edukasi halal.</li>
          <li>Notifikasi penting (pembaruan dokumen, keamanan akun).</li>
          <li>Analitik agregat performa chatbot — tanpa identitas personal.</li>
        </ul>
      </section>
      <section className="legal-pasal" id="simpan">
        <div className="legal-pasal-head"><span className="legal-pasal-num">3</span><h2>Penyimpanan &amp; Keamanan</h2></div>
        <p>Akses data dibatasi untuk admin KHB. Kredensial disimpan terenkripsi. Riwayat chat demo pada prototipe ini dapat dihapus berkala tanpa pemberitahuan.</p>
      </section>
      <section className="legal-pasal" id="hak">
        <div className="legal-pasal-head"><span className="legal-pasal-num">4</span><h2>Hak Anda</h2></div>
        <p>Minta salinan, koreksi, atau penghapusan data via kanal resmi KHB di <a href="https://halalbandung.com" target="_blank" rel="noreferrer" className="auth-link">halalbandung.com</a>. Permintaan wajar diproses maksimal 14 hari kerja.</p>
        <div className="legal-hi warn">ⓘ Prototipe demo: hindari memasukkan data sensitif (NIK, password lain, rahasia dagang) ke kolom chat.</div>
      </section>
      <div className="legal-cta">
        <h3>Data Anda aman bersama KHB</h3>
        <p>Baca juga ketentuan penggunaan platform.</p>
        <div className="row"><a className="btn-w" href="/admin/syarat">Syarat &amp; Ketentuan</a><a className="btn-o" href="/admin/register">Daftar Gratis</a></div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
