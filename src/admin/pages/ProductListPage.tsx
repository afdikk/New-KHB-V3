import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, HALAL_LABEL, type ProductRow } from '../services/api';
import { useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import {
  IconAlert,
  IconBox,
  IconCheckCircle,
  IconClock,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '../components/ui/Icons';

const FILTERS = [
  { label: 'Semua', value: '', countKey: 'all' },
  { label: 'Tersertifikasi', value: 'certified', countKey: 'certified' },
  { label: 'Proses', value: 'process', countKey: 'process' },
  { label: 'Belum', value: 'none', countKey: 'none' },
] as const;

const HALAL_PILL: Record<ProductRow['halal'], string> = {
  certified: 'green',
  process: 'amber',
  none: 'slate',
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
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Katalog UMKM</span>
          <h1>Produk</h1>
          <p className="m-sub">
            Data produk tersimpan di database dan dipakai sebagai konteks jawaban asisten.
          </p>
        </div>
        <div className="m-head-actions">
          <button className="m-btn m-btn-ghost" type="button" onClick={() => void reload()} disabled={loading}>
            <IconRefresh />
            Muat ulang
          </button>
          <Link className="m-btn m-btn-primary" to="/admin/products/new">
            <IconPlus />
            Tambah Produk
          </Link>
        </div>
      </div>

      <div className="m-stats">
        <article className="m-stat green">
          <div className="m-stat-top">
            <span className="m-stat-label">Total produk</span>
            <span className="m-stat-icon"><IconBox /></span>
          </div>
          <div className="m-stat-value">{total}</div>
          <div className="m-stat-foot">terdaftar di katalog</div>
        </article>

        <article className="m-stat blue">
          <div className="m-stat-top">
            <span className="m-stat-label">Tersertifikasi</span>
            <span className="m-stat-icon"><IconCheckCircle /></span>
          </div>
          <div className="m-stat-value">{counts.certified}</div>
          <div className="m-stat-foot">sudah punya sertifikat halal</div>
        </article>

        <article className="m-stat amber">
          <div className="m-stat-top">
            <span className="m-stat-label">Dalam proses</span>
            <span className="m-stat-icon"><IconClock /></span>
          </div>
          <div className="m-stat-value">{counts.process}</div>
          <div className="m-stat-foot">menunggu BPJPH</div>
        </article>

        <article className="m-stat violet">
          <div className="m-stat-top">
            <span className="m-stat-label">Belum diajukan</span>
            <span className="m-stat-icon"><IconAlert /></span>
          </div>
          <div className="m-stat-value">{counts.none}</div>
          <div className="m-stat-foot">perlu pendampingan</div>
        </article>
      </div>

      <div className="m-card">
        <div className="m-card-head">
          <div>
            <h2>Daftar produk</h2>
            <p>{rows.length} produk ditampilkan dari {total} terdaftar</p>
          </div>
        </div>

        <div className="m-toolbar">
          <div className="m-segmented" role="tablist" aria-label="Filter status halal">
            {FILTERS.map((item) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={halal === item.value}
                className={halal === item.value ? 'is-active' : ''}
                onClick={() => setHalal(item.value)}
              >
                {item.label}
                <span className="m-count">
                  {item.countKey === 'all'
                    ? counts.certified + counts.process + counts.none
                    : counts[item.countKey as 'certified' | 'process' | 'none']}
                </span>
              </button>
            ))}
          </div>

          <label className="m-search">
            <IconSearch />
            <input
              type="search"
              placeholder="Cari produk atau SKU…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="m-table-wrap">
          <table className="m-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Status halal</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="m-prod-cell">
                      <span className="m-prod-thumb">
                        {row.name.trim().charAt(0).toUpperCase() || '?'}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong>{row.name}</strong>
                        <small>{row.sku ?? '—'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.category}</td>
                  <td><span className="m-price">{row.price ?? '—'}</span></td>
                  <td>
                    <span className={`m-pill ${HALAL_PILL[row.halal]}`}>{HALAL_LABEL[row.halal]}</span>
                  </td>
                  <td>
                    <span className={`m-pill ${row.isActive ? 'blue' : 'slate'}`}>
                      {row.isActive ? 'Aktif' : 'Draf'}
                    </span>
                  </td>
                  <td>
                    <div className="m-row-actions">
                      <button
                        className="m-icon-btn"
                        aria-label={`Edit ${row.name}`}
                        title="Edit"
                        onClick={() => navigate(`/admin/products/${row.id}/edit`)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="m-icon-btn danger"
                        aria-label={`Hapus ${row.name}`}
                        title="Hapus"
                        onClick={() => void remove(row)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error ? (
          <div className="m-alert">
            <IconAlert />
            <span>{error}</span>
            <button className="m-btn m-btn-ghost m-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => void reload()}>
              Coba lagi
            </button>
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="m-empty">
            <span className="m-empty-icon"><IconBox /></span>
            <strong>{query || halal ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}</strong>
            <p>
              {query || halal
                ? 'Coba ubah kata kunci atau filter status halal.'
                : 'Tambahkan produk UMKM agar asisten bisa menjawab dengan konteks yang tepat.'}
            </p>
            {!query && !halal ? (
              <Link className="m-btn m-btn-primary m-btn-sm" to="/admin/products/new">
                <IconPlus />
                Tambah Produk
              </Link>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="m-empty">
            <span className="m-empty-icon"><IconRefresh /></span>
            <strong>Memuat produk…</strong>
          </div>
        ) : null}

        <div className="m-table-foot">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{total}</strong> produk</span>
          <span>{counts.certified} tersertifikasi · {counts.process} proses · {counts.none} belum</span>
        </div>
      </div>
    </section>
  );
}
