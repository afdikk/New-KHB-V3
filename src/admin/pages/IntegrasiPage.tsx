import { useMemo, useState } from 'react';
import { useToast } from '../components/Toast';

export default function IntegrasiPage() {
  const notify = useToast();
  const [color, setColor] = useState('#16A34A');
  const [pos, setPos] = useState('bottom-right');
  const [label, setLabel] = useState('Tanya Halal KHB');
  const [previewOpen, setPreviewOpen] = useState(false);

  const widgetUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return base + '/admin/widget';
  }, []);

  const snippet = useMemo(() => {
    const safeLabel = label.replace(/'/g, "\\'");
    return '<!-- KHB Chatbot Widget — tempel sebelum </body> di halalbandung.com -->\n'
      + '<script>\n  window.KHB_CHAT = {\n    url: \'' + widgetUrl + '\',\n'
      + '    color: \'' + color + '\',\n'
      + '    position: \'' + (pos === 'bottom-left' ? 'bottom-left' : 'bottom-right') + '\',\n'
      + '    label: \'' + safeLabel + '\'\n  };\n</' + 'script>\n'
      + '<script src="' + widgetUrl + '/khb-chat.js" defer></' + 'script>';
  }, [widgetUrl, color, pos, label]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {}
    notify('Kode embed disalin — tempel sebelum </body>');
  };

  return (
    <>
<section className="view active" id="view-integrasi">
  <div className="integ-hero">
    <span className="wava"><svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="#fff" strokeWidth="1.5"/><path d="M8 16a2 2 0 004 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
    <div><h2>Integrasi Web</h2><p>Satu cuplikan kode untuk memunculkan tombol + popup chatbot di web KHB.</p></div>
    <span className="pill"><i></i>Widget aktif</span>
  </div>

  <div className="embed-stepper">
    <div className="embed-step done"><span>1</span>Salin kode</div>
    <div className="embed-step-line"></div>
    <div className="embed-step"><span>2</span>Pratinjau</div>
    <div className="embed-step-line"></div>
    <div className="embed-step"><span>3</span>Rilis</div>
  </div>
  <div className="panel card-clean" style={{padding:'26px',marginBottom:'18px'}}>
    <h2 style={{fontSize:'15px',marginBottom:'4px'}}>Langkah 1 — salin kode ini</h2>
    <p className="subheading" style={{marginBottom:'12px'}}>Tempel tepat sebelum <code>&lt;/body&gt;</code> di source code halalbandung.com. Ganti <code>WIDGET_URL</code> dengan alamat file <code>widget/chat.html</code> hasil publish Anda.</p>
    <div className="embed-toolbar">
      <div className="embed-opts">
        <label>Warna tombol <input type="color" id="embed-color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label>Posisi
          <select id="embed-pos" className="settings-select" style={{maxWidth:'170px'}} value={pos} onChange={(e) => setPos(e.target.value)}>
            <option value="bottom-right">Kanan bawah</option>
            <option value="bottom-left">Kiri bawah</option>
          </select>
        </label>
        <label>Label <input type="text" id="embed-label" value={label} maxLength={30} style={{maxWidth:'180px'}} onChange={(e) => setLabel(e.target.value)} /></label>
      </div>
      <button className="btn btn-primary btn-sm btn-pill" id="embed-copy" onClick={copy}>Salin Kode</button>
    </div>
    <pre className="embed-code"><code id="embed-snippet">{snippet}</code></pre>
  </div>

  <div className="panel card-clean" style={{padding:'26px',marginBottom:'18px'}}>
    <h2 style={{fontSize:'15px',marginBottom:'4px'}}>Langkah 2 — pratinjau langsung</h2>
    <p className="subheading" style={{marginBottom:'12px'}}>Simulasi halaman KHB + tombol + popup. Klik tombol hijau untuk membuka chat.</p>
    <div className="embed-preview" id="embed-preview">
      <div className="embed-preview-bar"><i></i><i></i><i></i><span>halalbandung.com — pratinjau</span></div>
      <div className="embed-preview-hero">
        <strong>KHB On Clinic: Business Growth</strong>
        <p>Akselerasi UMKM Anda melalui konsultasi bisnis dan percepatan Sertifikasi Halal.</p>
        <span className="embed-preview-cta">Konsultasi Sekarang</span>
      </div>
      <button className="khb-float" id="preview-float" style={{ background: color }} onClick={() => setPreviewOpen((v) => !v)}>💬 <span id="preview-label">{label || 'Tanya Halal KHB'}</span></button>
      <div className={`khb-modal${previewOpen ? '' : ' hidden'}`} id="preview-modal" role="dialog" aria-label="Chatbot KHB">
        <div className="khb-modal-head"><strong>Asisten Halal KHB</strong><span><i></i> Online</span><button id="preview-close" aria-label="Tutup" onClick={() => setPreviewOpen(false)}>✕</button></div>
        <iframe id="preview-frame" title="Chatbot KHB" src="/admin/widget"></iframe>
      </div>
    </div>
  </div>

  <div className="panel card-clean" style={{padding:'26px'}}>
    <h2 style={{fontSize:'15px',marginBottom:'4px'}}>Langkah 3 — ceklis rilis</h2>
    <ul className="embed-check">
      <li>✅ File <code>widget/chat.html</code> sudah di-hosting (HTTPS) di domain yang sama/terpercaya.</li>
      <li>✅ Snippet ditempel sebelum <code>&lt;/body&gt;</code> di semua halaman KHB.</li>
      <li>✅ Buka halalbandung.com → klik tombol → popup chat terbuka &lt; 2 detik.</li>
      <li>ⓘ Jawaban widget bersifat edukatif (demo). Rilis resmi tetap rujuk BPJPH/SIHALAL.</li>
    </ul>
  </div>
</section>

<footer className="page-footer"><span>© 2025 Komunitas Halal Bandung</span><span>Chatbot edukasi halal <i>●</i> 1 role: Admin</span></footer>
    </>
  );
}
