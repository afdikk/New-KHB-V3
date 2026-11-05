import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, HALAL_LABEL } from '../services/api';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Makanan Ringan', 'Minuman', 'Bumbu', 'Madu', 'Katering', 'Kosmetik', 'Lainnya'];

export default function ProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Makanan Ringan',
    price: '',
    halal: 'none' as 'certified' | 'process' | 'none',
    description: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) return;
    void (async () => {
      try {
        const { rows } = await api.products.list({ perPage: 100 });
        const found = rows.find((row) => row.id === productId);
        if (found) {
          setForm({
            name: found.name,
            sku: found.sku ?? '',
            category: found.category,
            price: found.price ?? '',
            halal: found.halal,
            description: found.description ?? '',
          });
        }
      } catch {
        notify('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, notify]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        category: form.category,
        price: form.price.trim() || undefined,
        halal: form.halal,
        description: form.description.trim() || undefined,
      };
      if (productId) {
        await api.products.update(productId, payload);
        notify('Produk diperbarui');
      } else {
        await api.products.create(payload);
        notify('Produk ditambahkan');
      }
      navigate('/admin/products');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view active" id="view-product-form">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> KATALOG UMKM</div>
          <h1>{isEdit ? 'Edit produk' : 'Tambah produk'}</h1>
          <p className="subheading">Data produk dipakai sebagai konteks jawaban asisten.</p>
        </div>
        <Link className="btn btn-secondary" to="/admin/products">Kembali</Link>
      </div>

      <div className="grid-2-1">
        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Informasi produk</h2>
              <p>Lengkapi data agar asisten bisa menjawab pertanyaan produk</p>
            </div>
          </div>

          {loading ? (
            <p className="knowledge-note">Memuat produk…</p>
          ) : (
            <form onSubmit={submit}>
              <div className="settings-field">
                <label htmlFor="product-name">Nama produk</label>
                <input
                  id="product-name"
                  className="settings-input"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Contoh: Kopi Arabika Preanger 200g"
                />
              </div>

              <div className="form-row-two">
                <div className="settings-field">
                  <label htmlFor="product-sku">SKU</label>
                  <input
                    id="product-sku"
                    className="settings-input"
                    value={form.sku}
                    onChange={(event) => setForm({ ...form, sku: event.target.value })}
                    placeholder="KHB-KOP-01"
                  />
                </div>
                <div className="settings-field">
                  <label htmlFor="product-category">Kategori</label>
                  <select
                    id="product-category"
                    className="settings-select"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  >
                    {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row-two">
                <div className="settings-field">
                  <label htmlFor="product-price">Harga</label>
                  <input
                    id="product-price"
                    className="settings-input"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="Rp45.000"
                  />
                </div>
                <div className="settings-field">
                  <label htmlFor="product-halal">Status halal</label>
                  <select
                    id="product-halal"
                    className="settings-select"
                    value={form.halal}
                    onChange={(event) => setForm({ ...form, halal: event.target.value as typeof form.halal })}
                  >
                    <option value="certified">Tersertifikasi</option>
                    <option value="process">Proses</option>
                    <option value="none">Belum</option>
                  </select>
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="product-desc">Deskripsi</label>
                <textarea
                  id="product-desc"
                  className="settings-textarea"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Bahan utama dan proses produksi…"
                />
              </div>

              <div className="settings-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Ringkasan</h2>
              <p>Pratinjau data produk</p>
            </div>
          </div>
          <div className="kv">
            <div className="kv-row"><span>Nama</span><strong>{form.name || '—'}</strong></div>
            <div className="kv-row"><span>SKU</span><strong>{form.sku || '—'}</strong></div>
            <div className="kv-row"><span>Kategori</span><strong>{form.category}</strong></div>
            <div className="kv-row"><span>Harga</span><strong>{form.price || '—'}</strong></div>
            <div className="kv-row"><span>Status halal</span><strong>{HALAL_LABEL[form.halal]}</strong></div>
          </div>
          <p className="knowledge-note">Perubahan tersimpan langsung ke tabel <code>products</code>.</p>
        </div>
      </div>
    </section>
  );
}
