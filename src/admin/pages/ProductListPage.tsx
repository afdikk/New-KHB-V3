import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, HALAL_LABEL, type ProductRow } from '../services/api';
import { useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

const FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Tersertifikasi', value: 'certified' },
  { label: 'Proses', value: 'process' },
  { label: 'Belum', value: 'none' },
] as const;

const HALAL_TONE: Record<ProductRow['halal'], string> = {
  certified: 'badge-green',
  process: 'badge-amber',
  none: 'badge-slate',
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [query, setQuery] = useState('');
  const [halal, setHalal] = useState('');

  const { data, loading, error, reload } = useResource(
    () => api.products.list({ q: query || undefined, halal: halal || undefined, perPage: 50 }),
    [query, halal],
  );

  const rows = data?.rows ?? [];
  const counts = data?.counts ?? { certified: 0, process: 0, none: 0 };
  const total = data?.total ?? 0;

  const remove = async (row: ProductRow) => {
    if (!window.confirm(`Hapus produk "${row.name}"?`)) return;
    try {
      await api.products.remove(row.id);
      notify('Produk dihapus');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menghapus produk');
    }
  };

  return (
    <section className="view active" id="view-products">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KATALOG UMKM</div>
          <h1>Produk</h1>
          <p className="subheading">Data produk tersimpan di database dan dipakai sebagai konteks jawaban asisten.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/products/new">+ Tambah Produk</Link>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span>Total produk</span><span className="stat-icon green">🗂</span></div>
          <div className="stat-value">{total}</div>
          <div className="stat-foot"><span className="stat-muted">terdaftar di katalog</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Tersertifikasi</span><span className="stat-icon blue">✓</span></div>
          <div className="stat-value">{counts.certified}</div>
          <div className="stat-foot"><span className="stat-muted">sudah punya sertifikat halal</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Dalam proses</span><span className="stat-icon orange">⏳</span></div>
          <div className="stat-value">{counts.process}</div>
          <div className="stat-foot"><span className="stat-muted">menunggu BPJPH</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>Belum diajukan</span><span className="stat-icon purple">!</span></div>
          <div className="stat-value">{counts.none}</div>
          <div className="stat-foot"><span className="stat-muted">perlu pendampingan</span></div>
        </article>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="history-toolbar">
          <div>
            <h2>Daftar produk</h2>
            <p>{rows.length} produk ditampilkan</p>
          </div>
          <div className="history-filters">
            <div className="filter-tabs" style={{ height: 36 }}>
              {FILTERS.map((item) => (
                <button
                  key={item.label}
                  className={`filter-tab${halal === item.value ? ' selected' : ''}`}
                  onClick={() => setHalal(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="search-box">
              <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input type="search" placeholder="Cari produk atau SKU..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>PRODUK</th><th>KATEGORI</th><th>HARGA</th><th>STATUS HALAL</th><th>STATUS</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="doc-name">
                      <span className="avatar avatar-soft-green" style={{ width: 30, height: 30, borderRadius: 8 }}>🏪</span>
                      <div>
                        <strong>{row.name}</strong>
                        <small>{row.sku ?? '—'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.price ?? '—'}</td>
                  <td><span className={`badge-pill ${HALAL_TONE[row.halal]}`}><i></i>{HALAL_LABEL[row.halal]}</span></td>
                  <td>{row.isActive ? 'Aktif' : 'Draf'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-action" aria-label="Edit" onClick={() => navigate(`/admin/products/${row.id}/edit`)}>✎</button>
                      <button className="icon-action danger" aria-label="Hapus" onClick={() => void remove(row)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? <p className="knowledge-note" style={{ padding: '0 18px' }}>Memuat produk…</p> : null}
          {error ? (
            <div style={{ padding: '0 18px', color: '#b91c1c' }} className="knowledge-note">
              {error}{' '}
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>
                Coba lagi
              </button>
            </div>
          ) : null}
          {!loading && !error && rows.length === 0 ? <div className="empty-state">Belum ada produk.</div> : null}
        </div>

        <div className="table-footer">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{total}</strong> produk</span>
          <button className="btn btn-secondary btn-sm" onClick={() => void reload()}>Muat ulang</button>
        </div>
      </div>
    </section>
  );
}
