import { Link, useNavigate } from 'react-router-dom';
import { api, SOURCE_LABEL } from '../services/api';
import { formatDateTime, initials, timeAgo, useResource } from '../hooks/useApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource(() => api.dashboard.summary(), []);

  if (loading && !data) {
    return (
      <section className="view active" id="view-dashboard">
        <div className="panel" style={{ padding: 32 }}>
          <p className="knowledge-note">Memuat ringkasan dari database…</p>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="view active" id="view-dashboard">
        <div className="panel" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 6 }}>Data belum bisa dimuat</h2>
          <p className="knowledge-note" style={{ marginTop: 0 }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => void reload()}>Coba lagi</button>
        </div>
      </section>
    );
  }

  const { stats, recent, chart, topics } = data;
  const chartMax = Math.max(1, ...chart.map((point) => point.conversations));
  const chartTotal = chart.reduce((sum, point) => sum + point.conversations, 0);

  return (
    <section className="view active" id="view-dashboard">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KOMUNITAS HALAL BANDUNG</div>
          <h1>Halo, <span id="welcome-name">Admin</span> 👋</h1>
          <p className="subheading">Pantau edukasi halal dan aktivitas chatbot Anda hari ini.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/chat')}>
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Mulai Percakapan
        </button>
      </div>

      <div className="notice-banner">
        <div className="notice-icon">
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <strong>{data.assistant.name} aktif</strong>
          <p>
            {stats.documentsIndexed} dokumen rujukan terindeks · jawaban umum {data.assistant.generalEnabled ? 'diaktifkan' : 'dimatikan'} ·
            {' '}{stats.channelsActive} dari {stats.channelsTotal} kanal terhubung.
          </p>
        </div>
        <Link to="/admin/chat" className="text-link">Coba chatbot <span>→</span></Link>
      </div>

      <div className="section-heading">
        <div>
          <h2>Ringkasan aktivitas</h2>
          <p>Data langsung dari database · 30 hari terakhir</p>
        </div>
        <button className="select-btn" onClick={() => void reload()}>Muat ulang</button>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Percakapan 30 hari</span>
            <span className="stat-icon green">
              <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="stat-value">{stats.conversations30d.toLocaleString('id-ID')}</div>
          <div className="stat-foot">
            <span className="stat-muted">{stats.messages30d.toLocaleString('id-ID')} pesan</span>
            <span className="status-active"><i></i> tersimpan</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Dijawab dari dokumen</span>
            <span className="stat-icon blue">
              <svg viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="stat-value">{stats.accuracy.toLocaleString('id-ID')}<span className="stat-unit">%</span></div>
          <div className="stat-foot"><span className="stat-muted">sisanya jawaban umum</span></div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, stats.accuracy)}%` }}></span></div>
          <small className="progress-caption">Proporsi jawaban bersumber dokumen KHB</small>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Sumber pengetahuan</span>
            <span className="stat-icon orange">
              <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </span>
          </div>
          <div className="stat-value">{stats.documents}</div>
          <div className="stat-foot">
            <span className="stat-muted">Dokumen aktif</span>
            <span className="status-active"><i></i> {stats.documentsIndexed} terindeks</span>
          </div>
          <div className="source-chips">
            <span>Produk <b>{stats.products}</b></span>
            <span>Bersertifikat <b>{stats.productsCertified}</b></span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>UMKM terlayani</span>
            <span className="stat-icon purple">
              <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
          </div>
          <div className="stat-value">{stats.customers.toLocaleString('id-ID')}</div>
          <div className="stat-foot"><span className="stat-muted">dari percakapan widget</span></div>
        </article>
      </div>

      <div className="dashboard-lower">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Percakapan 7 hari terakhir</h2>
              <p>Jumlah percakapan baru per hari</p>
            </div>
            <span className="chart-total">{chartTotal} <small>total</small></span>
          </div>
          <div className="chart-legend"><span><i></i>Percakapan</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 200, padding: '10px 4px 0' }}>
            {chart.map((point) => (
              <div key={point.date} style={{ flex: 1, display: 'grid', justifyItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{point.conversations}</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 140 }}>
                  <div
                    title={`${point.conversations} percakapan · ${point.date}`}
                    style={{
                      width: '100%',
                      height: `${Math.max(4, (point.conversations / chartMax) * 100)}%`,
                      background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                      borderRadius: '6px 6px 3px 3px',
                      opacity: 0.9,
                    }}
                  ></div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{point.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Percakapan terbaru</h2>
              <p>Aktivitas pengguna terkini</p>
            </div>
            <Link to="/admin/history" className="text-link">Lihat semua <span>→</span></Link>
          </div>
          <div className="recent-list">
            {recent.length === 0 ? (
              <p className="knowledge-note">Belum ada percakapan. Coba mulai dari halaman Chat Edukasi.</p>
            ) : (
              recent.map((item) => (
                <div className="recent-item" key={item.id}>
                  <div className="avatar avatar-soft-green">{initials(item.customerName)}</div>
                  <div className="recent-copy">
                    <strong>{item.customerName ?? 'Pengunjung web'}</strong>
                    <p>{item.lastQuestion ?? 'Percakapan baru'}</p>
                  </div>
                  <span className="recent-time">{timeAgo(item.lastMessageAt)}</span>
                </div>
              ))
            )}
          </div>
          <Link className="view-all-btn" to="/admin/history">Lihat semua riwayat <span>→</span></Link>
        </article>
      </div>

      <article className="panel" style={{ padding: 22, marginTop: 20 }}>
        <div className="panel-heading">
          <div>
            <h2>Sumber jawaban asisten</h2>
            <p>Transparansi: dari mana jawaban chatbot berasal</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {topics.map((topic) => {
            const lower = topic.label.toLowerCase();
            const tone = lower.includes('dokumen') ? 'green' : lower.includes('umum') ? 'blue' : 'orange';
            const color = tone === 'green' ? 'var(--green)' : tone === 'blue' ? 'var(--navy)' : '#f59e0b';
            return (
              <div key={topic.label} style={{ display: 'grid', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{topic.label}</span>
                  <span style={{ color: 'var(--muted-2)' }}>{topic.value}%</span>
                </div>
                <div className="progress-track" style={{ marginTop: 0 }}>
                  <span style={{ width: `${topic.value}%`, display: 'block', height: '100%', borderRadius: 999, background: color }}></span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="knowledge-note" style={{ marginTop: 14 }}>
          Label sumber: {SOURCE_LABEL.rag} · {SOURCE_LABEL.general} · {SOURCE_LABEL.handoff}
        </p>
      </article>

      <footer className="page-footer"><span>© 2025 Komunitas Halal Bandung</span><span>Data dari database <i>●</i> {formatDateTime(new Date().toISOString())}</span></footer>
    </section>
  );
}
