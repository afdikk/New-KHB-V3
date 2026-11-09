import { Link } from 'react-router-dom';
import LegalHero from '../components/LegalHero';

export default function PrivasiPage() {
  return (
    <div className="landing-page">
      <LegalHero
        crumb="Kebijakan Privasi"
        badge="Legal · Data Anda aman"
        title="Kebijakan Privasi"
        subtitle="Data apa yang kami kumpulkan, kenapa, dan bagaimana Anda mengendalikannya."
        meta={
          <>
            <span>🔒 Enkripsi</span>
            <span>🚫 Tanpa jual data</span>
            <span>🗑️ Hapus kapan saja</span>
          </>
        }
      />

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
              <li><strong>Akun pengelola:</strong> nama, email, dan kata sandi terenkripsi.</li>
              <li><strong>Interaksi pengunjung:</strong> nama, kontak WhatsApp/email, dan riwayat pertanyaan chatbot.</li>
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
            <div className="row">
              <Link className="btn-w" to="/admin/syarat">Syarat &amp; Ketentuan</Link>
              <Link className="btn-o" to="/admin/login">Masuk ke Akun</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
