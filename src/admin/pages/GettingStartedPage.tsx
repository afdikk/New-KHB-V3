import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useResource } from '../hooks/useApi';

const STEPS = [
  { title: 'Lengkapi profil komunitas', desc: 'Nama organisasi, kontak, dan jam layanan.', done: true },
  { title: 'Hubungkan kanal percakapan', desc: 'WhatsApp, Instagram, atau widget website.', done: true },
  { title: 'Unggah dokumen rujukan', desc: 'Regulasi BPJPH dan panduan internal KHB.', done: true },
  { title: 'Atur nada jawaban asisten', desc: 'Bahasa, gaya jawaban, dan aturan eskalasi.', done: false },
  { title: 'Uji coba di halaman chat', desc: 'Kirim pertanyaan contoh dan periksa sumber jawaban.', done: false },
];

const QUICK_LINKS = [
  { to: '/admin/channels', title: 'Hubungkan kanal', desc: 'WhatsApp, Instagram, atau widget website.', tone: '' },
  { to: '/admin/knowledge-base', title: 'Tambah dokumen', desc: 'Regulasi BPJPH dan panduan internal KHB.', tone: 'blue' },
  { to: '/admin/chatbot', title: 'Atur jawaban umum', desc: 'Izinkan asisten menjawab di luar dokumen.', tone: 'amber' },
  { to: '/admin/history', title: 'Lihat riwayat percakapan', desc: 'Telusuri pertanyaan UMKM dan sumber jawabannya.', tone: 'violet' },
];

export default function GettingStartedPage() {
  const { data } = useResource(() => api.dashboard.summary(), []);
  const stats = data?.stats;

  return (
    <section className="view active" id="view-getting-started">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PANDUAN AWAL</div>
          <h1>Mulai dari sini</h1>
          <p className="subheading">Siapkan asisten halal KHB dalam lima langkah singkat.</p>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Checklist persiapan</h2>
              <p>3 dari 5 langkah selesai</p>
            </div>
          </div>
          <div className="progress-track" style={{ marginTop: 2, marginBottom: 16 }}>
            <span style={{ width: '60%' }}></span>
          </div>
          <div className="steps">
            {STEPS.map((step, index) => (
              <div className={`step-item${step.done ? ' done' : ''}`} key={step.title}>
                <span className="step-num">{step.done ? '✓' : index + 1}</span>
                <div style={{ flex: 1 }}>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
                <span className="step-badge">
                  <span className={`badge-pill ${step.done ? 'badge-green' : 'badge-amber'}`}>
                    <i></i>{step.done ? 'Selesai' : 'Belum'}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="settings-actions" style={{ justifyContent: 'flex-start' }}>
            <Link className="btn btn-primary" to="/admin/chatbot">Lanjut atur asisten</Link>
          </div>
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Status singkat</h2>
              <p>Ringkasan kesiapan asisten (dari database)</p>
            </div>
          </div>
          <div className="kv">
            <div className="kv-row"><span>Kanal aktif</span><strong>{stats?.channelsActive ?? '—'} dari {stats?.channelsTotal ?? '—'}</strong></div>
            <div className="kv-row"><span>Dokumen terindeks</span><strong>{stats?.documentsIndexed ?? '—'} dokumen</strong></div>
            <div className="kv-row"><span>Percakapan 30 hari</span><strong>{(stats?.conversations30d ?? 0).toLocaleString('id-ID')}</strong></div>
            <div className="kv-row"><span>Dijawab dari dokumen</span><strong>{stats?.accuracy ?? 0}%</strong></div>
            <div className="kv-row"><span>UMKM terlayani</span><strong>{stats?.customers ?? 0}</strong></div>
            <div className="kv-row"><span>Versi asisten</span><strong>{data?.assistant.version ?? '—'}</strong></div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 22 }}>
        <div className="panel-heading">
          <div>
            <h2>Aksi cepat</h2>
            <p>Pintasan konfigurasi yang sering dipakai</p>
          </div>
        </div>
        <div className="flat-rows-2" style={{ marginTop: 14 }}>
          {QUICK_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="flat-row" style={{ textDecoration: 'none' }}>
              <span className={`row-icon ${item.tone}`}>{item.title.charAt(0)}</span>
              <span className="row-copy"><strong>{item.title}</strong><span>{item.desc}</span></span>
              <span className="row-meta">Buka →</span>
            </Link>
          ))}
        </div>
      </div>

      <footer className="page-footer">
        <span>© 2025 Komunitas Halal Bandung</span>
        <span>Panduan awal <i>●</i> Prototipe PKM</span>
      </footer>
    </section>
  );
}
