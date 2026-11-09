import { useMemo, useState } from 'react';
import { useToast } from '../components/Toast';
import {
  IconCheck,
  IconCheckCircle,
  IconCopy,
  IconExternal,
  IconPlug,
  IconSparkles,
} from '../components/ui/Icons';

/**
 * Integrasi widget web: satu cuplikan kode untuk memasang tombol + popup chat
 * di situs KHB. Semua state murni frontend — tidak ada panggilan backend baru.
 */
export default function IntegrasiPage() {
  const notify = useToast();
  const [color, setColor] = useState('#16A34A');
  const [pos, setPos] = useState('bottom-right');
  const [label, setLabel] = useState('Tanya Halal KHB');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bisa diblokir; tetap beri umpan balik
    }
    notify('Kode embed disalin — tempel sebelum </body>');
  };

  const STEPS = [
    { num: 1, title: 'Salin kode embed', desc: 'Atur warna, posisi, dan label lalu salin cuplikannya.', done: true },
    { num: 2, title: 'Pratinjau tampilan', desc: 'Pastikan tombol dan popup tampil sesuai keinginan.', done: true },
    { num: 3, title: 'Rilis ke produksi', desc: 'Tempel di halalbandung.com lalu uji di perangkat nyata.', done: false },
  ];

  return (
    <section className="view active" id="view-integrasi">
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Integrasi Web</span>
          <h1>Pasang Widget Chat</h1>
          <p className="m-sub">Satu cuplikan kode untuk memunculkan tombol dan popup chatbot di web KHB.</p>
        </div>
        <div className="m-head-actions">
          <span className="m-pill green">Widget aktif</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="m-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0 }}>
          {STEPS.map((step, index) => (
            <div
              key={step.num}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '18px 20px',
                borderLeft: index === 0 ? 'none' : '1px solid var(--m-border)',
                background: step.done ? 'linear-gradient(180deg, #fbfefc 0%, #fff 100%)' : '#fff',
              }}
            >
              <span
                className="m-step-num"
                style={step.done ? { background: 'linear-gradient(135deg,#16a34a,#0f8a3f)', color: '#fff', borderColor: 'transparent' } : undefined}
              >
                {step.done ? <IconCheck /> : step.num}
              </span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--m-text)', marginBottom: 2 }}>
                  {step.title}
                </strong>
                <span style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--m-text-3)' }}>{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Langkah 1 — konfigurasi + kode */}
      <div className="m-card" style={{ marginBottom: 16 }}>
        <div className="m-card-head">
          <div>
            <h2>Langkah 1 — salin kode ini</h2>
            <p>
              Tempel tepat sebelum <code>&lt;/body&gt;</code> di source code halalbandung.com.
            </p>
          </div>
          <button className={`m-btn ${copied ? 'm-btn-soft' : 'm-btn-primary'} m-btn-sm`} type="button" onClick={() => void copy()}>
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? 'Tersalin' : 'Salin Kode'}
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--m-text-2)' }}>Warna tombol</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 40, height: 36, padding: 2, borderRadius: 9,
                    border: '1px solid var(--m-border)', background: '#fff', cursor: 'pointer',
                  }}
                  aria-label="Warna tombol"
                />
                <code style={{ fontSize: 12, color: 'var(--m-text-2)', letterSpacing: 0.3 }}>{color.toUpperCase()}</code>
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--m-text-2)' }}>Posisi</span>
              <select
                className="settings-select"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                style={{ height: 36, fontSize: 12.5 }}
              >
                <option value="bottom-right">Kanan bawah</option>
                <option value="bottom-left">Kiri bawah</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--m-text-2)' }}>Label tombol</span>
              <input
                type="text"
                value={label}
                maxLength={30}
                onChange={(e) => setLabel(e.target.value)}
                className="settings-input"
                style={{ height: 36, fontSize: 12.5 }}
                placeholder="Tanya Halal KHB"
              />
            </label>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: 12,
              background: '#0f172a',
              border: '1px solid #1e293b',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 14px',
                borderBottom: '1px solid #1e293b',
                background: '#111c33',
              }}
            >
              <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
              <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
              <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                embed.html
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                fontSize: 11.5,
                lineHeight: 1.75,
                color: '#e2e8f0',
                fontFamily: 'ui-monospace, Consolas, monospace',
                overflowX: 'auto',
                maxHeight: 280,
              }}
            >
              <code>{snippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Langkah 2 — pratinjau */}
      <div className="m-card" style={{ marginBottom: 16 }}>
        <div className="m-card-head">
          <div>
            <h2>Langkah 2 — pratinjau langsung</h2>
            <p>Simulasi halaman KHB + tombol + popup. Klik tombol hijau untuk membuka chat.</p>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid var(--m-border)',
              background: 'linear-gradient(160deg, #f0fdf4 0%, #f6fef9 45%, #fffbeb 100%)',
              minHeight: 400,
              boxShadow: 'var(--m-shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: '#fff',
                borderBottom: '1px solid var(--m-border)',
                padding: '10px 14px',
              }}
            >
              <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb' }} />
              <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb' }} />
              <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb' }} />
              <span
                style={{
                  marginLeft: 10,
                  flex: 1,
                  fontSize: 11.5,
                  color: 'var(--m-text-3)',
                  background: '#f7f9fb',
                  border: '1px solid var(--m-border)',
                  borderRadius: 7,
                  padding: '4px 10px',
                  fontFamily: 'ui-monospace, Consolas, monospace',
                }}
              >
                halalbandung.com
              </span>
            </div>

            <div style={{ padding: '44px 34px', maxWidth: 540 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: 'var(--green-dark)',
                  background: '#e7f6ec',
                  border: '1px solid #c7e9d4',
                  borderRadius: 999,
                  padding: '5px 11px',
                  marginBottom: 14,
                }}
              >
                <IconSparkles /> Komunitas Halal Bandung
              </span>
              <strong
                style={{
                  display: 'block',
                  fontFamily: 'var(--display)',
                  fontSize: 27,
                  fontWeight: 800,
                  letterSpacing: '-0.7px',
                  lineHeight: 1.2,
                  color: '#0f172a',
                  marginBottom: 10,
                }}
              >
                KHB On Clinic: Business Growth
              </strong>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--m-text-2)', margin: '0 0 18px' }}>
                Akselerasi UMKM Anda melalui konsultasi bisnis dan percepatan Sertifikasi Halal.
              </p>
              <span
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg,#16a34a,#0f8a3f)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 9,
                  padding: '11px 20px',
                  boxShadow: '0 4px 14px rgba(22,163,74,.28)',
                }}
              >
                Konsultasi Sekarang
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              style={{
                position: 'absolute',
                bottom: 20,
                right: pos === 'bottom-left' ? 'auto' : 20,
                left: pos === 'bottom-left' ? 20 : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: color,
                color: '#fff',
                border: 0,
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              }}
            >
              <IconChatBubble /> {label || 'Tanya Halal KHB'}
            </button>

            {previewOpen ? (
              <div
                role="dialog"
                aria-label="Chatbot KHB"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: pos === 'bottom-left' ? 'auto' : 16,
                  left: pos === 'bottom-left' ? 16 : 'auto',
                  bottom: 16,
                  width: 'min(360px, calc(100% - 32px))',
                  background: '#fff',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--m-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '11px 14px',
                    borderBottom: '1px solid var(--m-border)',
                    background: '#fff',
                    flex: 'none',
                  }}
                >
                  <strong style={{ fontSize: 13, color: 'var(--m-text)' }}>Asisten Halal KHB</strong>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--m-text-3)' }}>
                    <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} /> Online
                  </span>
                  <button
                    type="button"
                    aria-label="Tutup pratinjau"
                    onClick={() => setPreviewOpen(false)}
                    style={{
                      marginLeft: 'auto',
                      width: 26,
                      height: 26,
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid var(--m-border)',
                      borderRadius: 7,
                      background: '#fff',
                      color: 'var(--m-text-3)',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <iframe
                  title="Chatbot KHB"
                  src="/admin/widget"
                  style={{ flex: 1, width: '100%', border: 0, minHeight: 360, background: '#fff' }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Langkah 3 — checklist rilis */}
      <div className="m-card">
        <div className="m-card-head">
          <div>
            <h2>Langkah 3 — ceklis rilis</h2>
            <p>Pastikan semua poin di bawah sebelum widget dipakai publik.</p>
          </div>
        </div>
        <div style={{ padding: '6px 20px 18px' }}>
          {[
            { text: 'File widget sudah di-hosting (HTTPS) di domain yang sama atau terpercaya.', done: true },
            { text: 'Snippet ditempel sebelum </body> di semua halaman KHB.', done: true },
            { text: 'Tombol diklik → popup chat terbuka kurang dari 2 detik.', done: false },
            { text: 'Jawaban widget bersifat edukatif; rilis resmi tetap merujuk BPJPH/SIHALAL.', done: false },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: '11px 0',
                borderBottom: '1px solid #f2f5f9',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  flex: 'none',
                  display: 'grid',
                  placeItems: 'center',
                  marginTop: 1,
                  background: item.done ? 'linear-gradient(135deg,#16a34a,#0f8a3f)' : '#fff',
                  border: item.done ? '1px solid transparent' : '1.5px solid var(--m-border)',
                  color: item.done ? '#fff' : 'var(--m-text-3)',
                }}
              >
                {item.done ? <IconCheck /> : <IconCheckCircle />}
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: item.done ? 'var(--m-text-3)' : 'var(--m-text-2)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  textDecorationColor: '#cbd5e1',
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <footer className="page-footer">
        <span>© 2025 Komunitas Halal Bandung</span>
        <span>Chatbot edukasi halal <i>●</i> 1 role: Admin</span>
      </footer>
    </section>
  );
}

/** Ikon balon chat kecil khusus tombol pratinjau. */
function IconChatBubble() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M20.5 11.5a7.7 7.7 0 0 1-8.3 7.7 8.6 8.6 0 0 1-3.1-.8L4 20l1.6-4.7a7.7 7.7 0 0 1-.9-3.6 7.7 7.7 0 0 1 7.7-7.7 7.7 7.7 0 0 1 8.1 7.5Z" />
    </svg>
  );
}
