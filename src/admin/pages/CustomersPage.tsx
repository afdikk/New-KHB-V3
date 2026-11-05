import { useState } from 'react';
import { api } from '../services/api';
import { formatDateTime, initials, useResource } from '../hooks/useApi';

export default function CustomersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const { data, loading, error, reload } = useResource(
    async () => {
      const [list, summary] = await Promise.all([
        api.customers.list({ q: query || undefined, status: status || undefined, perPage: 50 }),
        api.dashboard.summary(),
      ]);
      return { ...list, stats: summary.stats };
    },
    [query, status],
  );

  const rows = data?.rows ?? [];
  const stats = data?.stats;

  return (
    <section className="view active" id="view-customers">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> DATA UMKM</div>
          <h1>Pelanggan</h1>
          <p className="subheading">Pelaku usaha yang berinteraksi dengan asisten halal (dari tabel customers).</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void reload()}>Muat ulang</button>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span>Total UMKM</span><span className="stat-icon green">◍</span></div>
          <div className="stat-value">{stats?.customers ?? 0}</div>
          <div className="stat-foot"><span className="stat-muted">tercatat dari percakapan</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Percakapan 30 hari</span><span className="stat-icon blue">▤</span></div>
          <div className="stat-value">{(stats?.conversations30d ?? 0).toLocaleString('id-ID')}</div>
          <div className="stat-foot"><span className="stat-muted">{stats?.messages30d ?? 0} pesan</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Dijawab dari dokumen</span><span className="stat-icon orange">✓</span></div>
          <div className="stat-value">{stats?.accuracy ?? 0}<span className="stat-unit">%</span></div>
          <div className="stat-foot"><span className="stat-muted">sisanya jawaban umum</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Produk terdaftar</span><span className="stat-icon purple">▣</span></div>
          <div className="stat-value">{stats?.products ?? 0}</div>
          <div className="stat-foot"><span className="stat-muted">{stats?.productsCertified ?? 0} tersertifikasi</span></div>
        </article>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="history-toolbar">
          <div>
            <h2>Daftar pelanggan</h2>
            <p>{rows.length} dari {data?.total ?? 0} UMKM</p>
          </div>
          <div className="history-filters">
            <select className="settings-select" style={{ height: 36, fontSize: 12 }} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Semua status</option>
              <option value="Aktif">Aktif</option>
              <option value="Baru">Baru</option>
            </select>
            <label className="search-box">
              <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input type="search" placeholder="Cari nama atau usaha..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>NAMA</th><th>USAHA</th><th>KOTA</th><th>PERCAKAPAN</th><th>TERAKHIR AKTIF</th><th>STATUS</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar avatar-soft-green" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(row.name)}</span>
                      <div>
                        <strong>{row.name}</strong>
                        <small>{row.city ?? '—'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.business ?? '—'}</td>
                  <td>{row.city ?? '—'}</td>
                  <td>{row.chats}</td>
                  <td>{formatDateTime(row.lastSeenAt)}</td>
                  <td>
                    <span className={`badge-pill ${row.status === 'Baru' ? 'badge-blue' : 'badge-green'}`}>
                      <i></i>{row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? <p className="knowledge-note" style={{ padding: '0 18px' }}>Memuat pelanggan…</p> : null}
          {error ? (
            <div style={{ padding: '0 18px', color: '#b91c1c' }} className="knowledge-note">
              {error}{' '}
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>
                Coba lagi
              </button>
            </div>
          ) : null}
          {!loading && !error && rows.length === 0 ? <div className="empty-state">Belum ada data pelanggan.</div> : null}
        </div>

        <div className="table-footer">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{data?.total ?? 0}</strong> UMKM</span>
        </div>
      </div>
    </section>
  );
}
