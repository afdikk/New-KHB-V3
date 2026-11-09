import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useResource } from '../hooks/useApi';
import {
  IconArrowRight,
  IconChat,
  IconCheck,
  IconDocument,
  IconLink,
  IconRocket,
  IconSettings,
  IconSparkles,
} from '../components/ui/Icons';

const STEPS = [
  { title: 'Lengkapi profil komunitas', desc: 'Nama organisasi, kontak, dan jam layanan.', done: true },
  { title: 'Hubungkan kanal percakapan', desc: 'WhatsApp, Instagram, atau widget website.', done: true },
  { title: 'Unggah dokumen rujukan', desc: 'Regulasi BPJPH dan panduan internal KHB.', done: true },
  { title: 'Atur nada jawaban asisten', desc: 'Bahasa, gaya jawaban, dan aturan eskalasi.', done: false },
  { title: 'Uji coba di halaman chat', desc: 'Kirim pertanyaan contoh dan periksa sumber jawaban.', done: false },
];

const QUICK_LINKS = [
  { to: '/admin/channels', title: 'Hubungkan kanal', desc: 'WhatsApp, Instagram, atau widget website.', icon: IconLink, tone: '' },
  { to: '/admin/knowledge-base', title: 'Tambah dokumen', desc: 'Regulasi BPJPH dan panduan internal KHB.', icon: IconDocument, tone: 'blue' },
  { to: '/admin/chatbot', title: 'Atur jawaban umum', desc: 'Izinkan asisten menjawab di luar dokumen.', icon: IconSettings, tone: 'amber' },
  { to: '/admin/history', title: 'Lihat riwayat percakapan', desc: 'Telusuri pertanyaan UMKM dan sumber jawabannya.', icon: IconChat, tone: 'violet' },
];

export default function GettingStartedPage() {
  const { data } = useResource(() => api.dashboard.summary(), []);
  const stats = data?.stats;

  const done = STEPS.filter((step) => step.done).length;
  const percent = Math.round((done / STEPS.length) * 100);

  return (
    <section className="view active" id="view-getting-started">
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Panduan Awal</span>
          <h1>Mulai dari sini</h1>
          <p className="m-sub">Siapkan asisten halal KHB dalam lima langkah singkat.</p>
        </div>
        <div className="m-head-actions">
          <Link className="m-btn m-btn-primary" to="/admin/chatbot">
            <IconRocket />
            Lanjut atur asisten
          </Link>
        </div>
      </div>

      <div className="m-stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <article className="m-stat green">
          <div className="m-stat-top">
            <span className="m-stat-label">Progres persiapan</span>
            <span className="m-stat-icon"><IconSparkles /></span>
          </div>
          <div className="m-stat-value">{percent}%</div>
          <div className="m-stat-foot">{done} dari {STEPS.length} langkah selesai</div>
        </article>
        <article className="m-stat blue">
          <div className="m-stat-top">
            <span className="m-stat-label">Dokumen terindeks</span>
            <span className="m-stat-icon"><IconDocument /></span>
          </div>
          <div className="m-stat-value">{stats?.documentsIndexed ?? '—'}</div>
          <div className="m-stat-foot">siap dipakai menjawab</div>
        </article>
        <article className="m-stat violet">
          <div className="m-stat-top">
            <span className="m-stat-label">Kanal aktif</span>
            <span className="m-stat-icon"><IconLink /></span>
          </div>
          <div className="m-stat-value">{stats?.channelsActive ?? '—'}</div>
          <div className="m-stat-foot">dari {stats?.channelsTotal ?? '—'} kanal terdaftar</div>
        </article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        <div className="m-card">
          <div className="m-card-head">
            <div>
              <h2>Checklist persiapan</h2>
              <p>Ikuti berurutan agar asisten siap dipakai UMKM.</p>
            </div>
            <span className="m-pill green">{done} / {STEPS.length} selesai</span>
          </div>

          <div style={{ padding: '16px 22px 6px' }}>
            <div className="m-progress">
              <div className="m-progress-track">
                <div className="m-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="m-progress-label">{percent}%</span>
            </div>
          </div>

          <div className="m-steps" style={{ padding: '4px 22px 10px' }}>
            {STEPS.map((step, index) => (
              <div className={`m-step${step.done ? ' done' : ''}`} key={step.title}>
                <span className="m-step-num">{step.done ? <IconCheck /> : index + 1}</span>
                <div className="m-step-body">
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
                <span className={`m-pill ${step.done ? 'green' : 'amber'}`}>
                  {step.done ? 'Selesai' : 'Belum'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="m-card">
          <div className="m-card-head">
            <div>
              <h2>Status singkat</h2>
              <p>Ringkasan kesiapan asisten</p>
            </div>
          </div>
          <div className="m-card-pad">
            <div className="m-kv">
              <div className="m-kv-row">
                <span><IconLink /> Kanal aktif</span>
                <strong>{stats?.channelsActive ?? '—'} dari {stats?.channelsTotal ?? '—'}</strong>
              </div>
              <div className="m-kv-row">
                <span><IconDocument /> Dokumen terindeks</span>
                <strong>{stats?.documentsIndexed ?? '—'} dokumen</strong>
              </div>
              <div className="m-kv-row">
                <span><IconChat /> Percakapan 30 hari</span>
                <strong>{(stats?.conversations30d ?? 0).toLocaleString('id-ID')}</strong>
              </div>
              <div className="m-kv-row">
                <span><IconSparkles /> Dijawab dari dokumen</span>
                <strong>{stats?.accuracy ?? 0}%</strong>
              </div>
              <div className="m-kv-row">
                <span><IconRocket /> UMKM terlayani</span>
                <strong>{stats?.customers ?? 0}</strong>
              </div>
              <div className="m-kv-row">
                <span><IconSettings /> Versi asisten</span>
                <strong>{data?.assistant.version ?? '—'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-card" style={{ marginTop: 16 }}>
        <div className="m-card-head">
          <div>
            <h2>Aksi cepat</h2>
            <p>Pintasan konfigurasi yang sering dipakai</p>
          </div>
        </div>
        <div className="m-card-pad">
          <div className="m-actions-grid">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="m-action">
                  <span className={`m-action-icon ${item.tone}`}><Icon /></span>
                  <span className="m-action-copy">
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </span>
                  <span className="m-action-arrow"><IconArrowRight /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <span>© 2025 Komunitas Halal Bandung</span>
        <span>Panduan awal <i>●</i> Prototipe PKM</span>
      </footer>
    </section>
  );
}
