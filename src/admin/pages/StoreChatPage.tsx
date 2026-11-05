import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type ChatBoot, type ProductRow } from '../services/api';
import { PublicChat } from '../components/PublicChat';

/**
 * Halaman chat publik per organisasi, mis. `/admin/s/khb-bandung`.
 *
 * Pengunjung wajib mengisi nama + WhatsApp/email sebelum bertanya, dan
 * percakapannya tersimpan sebagai riwayat yang bisa dibuka kembali.
 */

const HALAL_TONE: Record<ProductRow['halal'], string> = {
  certified: 'badge-green',
  process: 'badge-amber',
  none: 'badge-slate',
};

export default function StoreChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  const [boot, setBoot] = useState<ChatBoot | null>(null);
  const [stats, setStats] = useState({ conversations: 0, customers: 0, documents: 0 });
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [bootData, summary, productList] = await Promise.all([
          api.chat.boot(store),
          api.dashboard.summary(),
          api.products.list({ perPage: 4 }),
        ]);
        setBoot(bootData);
        setStats({
          conversations: summary.stats.conversations30d,
          customers: summary.stats.customers,
          documents: summary.stats.documents,
        });
        setProducts(productList.rows);
      } catch {
        // halaman publik tetap tampil walau backend belum siap
      }
    })();
  }, [store]);

  return (
    <div className="store-page">
      <header className="store-nav">
        <div className="store-brand">
          <span className="store-logo">H</span>
          <div>
            <strong>komunitas<span>halal</span></strong>
            <small>BANDUNG · {store}</small>
          </div>
        </div>
        <div className="store-nav-actions">
          <Link className="btn btn-secondary btn-sm" to="/">Tentang KHB</Link>
          <Link className="btn btn-primary btn-sm" to="/admin/login">Masuk Pengelola</Link>
        </div>
      </header>

      <main className="store-main">
        <section className="store-hero">
          <span className="badge-pill badge-green"><i></i>Asisten halal aktif 24 jam</span>
          <h1>Tanya halal, jawabannya bersumber dokumen resmi.</h1>
          <p>
            Asisten edukasi halal Komunitas Halal Bandung membantu pelaku UMKM memahami sertifikasi halal,
            self declare, dan kelengkapan dokumen. Isi data diri dulu supaya percakapan Anda tersimpan dan
            bisa dilanjutkan kapan saja.
          </p>
          <div className="store-stats">
            <div><strong>{stats.conversations.toLocaleString('id-ID')}</strong><span>percakapan</span></div>
            <div><strong>{stats.customers.toLocaleString('id-ID')}</strong><span>UMKM terbantu</span></div>
            <div><strong>{stats.documents}</strong><span>dokumen rujukan</span></div>
          </div>
        </section>

        <section className="store-chat-card">
          <PublicChat slug={store} />
        </section>
      </main>

      <section className="store-products">
        <div className="store-products-head">
          <h2>Produk UMKM binaan</h2>
          <span>{products.length} produk terdaftar</span>
        </div>
        <div className="panel" style={{ padding: '4px 18px' }}>
          <div className="flat-list">
            {products.map((product) => (
              <div className="flat-row" key={product.id}>
                <span className="row-icon">▣</span>
                <span className="row-copy">
                  <strong>{product.name}</strong>
                  <span>{product.category} · {product.price ?? '—'} · {product.sku ?? '—'}</span>
                </span>
                <span className="row-meta">
                  <span className={`badge-pill ${HALAL_TONE[product.halal]}`}>
                    <i></i>
                    {product.halal === 'certified' ? 'Tersertifikasi' : product.halal === 'process' ? 'Proses' : 'Belum'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="store-footer">
        <span>© 2025 Komunitas Halal Bandung · Halaman publik /{store}</span>
        <span>Jawaban bersifat edukatif, bukan keputusan resmi BPJPH.</span>
      </footer>
    </div>
  );
}
