import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, SOURCE_LABEL, type ChatBoot, type ProductRow } from '../services/api';
import { MarkdownText } from '../components/ui/MarkdownText';
import { MicButton } from '../components/MicButton';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  source?: 'rag' | 'general' | 'handoff' | 'none';
  citations?: string[];
}

const SESSION_KEY = 'khb-session-store';

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
  const [profile, setProfile] = useState({ name: '', contact: '' });
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionKey = useRef(localStorage.getItem(SESSION_KEY) ?? '');
  const bottom = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.contact.trim()) return;
    setStarted(true);
    setMessages([
      {
        id: 'greeting',
        role: 'bot',
        text:
          boot?.assistant.greeting ??
          `Halo ${profile.name.split(' ')[0]}! Saya asisten halal KHB. Silakan tanya seputar sertifikasi halal.`,
      },
    ]);
  };

  const send = async (event?: React.FormEvent, preset?: string) => {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const answer = await api.chat.send({
        message: text,
        slug: store,
        sessionKey: sessionKey.current || undefined,
        customerName: profile.name.trim() || undefined,
      });
      sessionKey.current = answer.sessionKey;
      localStorage.setItem(SESSION_KEY, answer.sessionKey);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: answer.answer,
          source: answer.source,
          citations: answer.citations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'bot',
          text: 'Maaf, asisten sedang tidak dapat dihubungi. Silakan coba lagi sebentar lagi.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

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
            self declare, dan kelengkapan dokumen. Bila dokumen belum memuat jawabannya, asisten menjawab
            dari pengetahuan umum dan menandainya secara jelas.
          </p>
          <div className="store-stats">
            <div><strong>{stats.conversations.toLocaleString('id-ID')}</strong><span>percakapan</span></div>
            <div><strong>{stats.customers.toLocaleString('id-ID')}</strong><span>UMKM terbantu</span></div>
            <div><strong>{stats.documents}</strong><span>dokumen rujukan</span></div>
          </div>
        </section>

        <section className="store-chat-card">
          <div className="store-chat-head">
            <span className="store-chat-avatar">✦</span>
            <div>
              <strong>{boot?.assistant.name ?? 'Asisten Halal KHB'}</strong>
              <span><i></i>{sending ? 'Menyusun jawaban…' : 'Siap membantu'}</span>
            </div>
          </div>

          {!started ? (
            <form className="store-pretch" onSubmit={start}>
              <h2>Mulai percakapan</h2>
              <p>Isi nama dan nomor WhatsApp agar pendamping bisa menindaklanjuti.</p>
              <label className="field">
                <span>Nama</span>
                <input
                  required
                  value={profile.name}
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  placeholder="Nama Anda"
                />
              </label>
              <label className="field">
                <span>WhatsApp / Email</span>
                <input
                  required
                  value={profile.contact}
                  onChange={(event) => setProfile({ ...profile, contact: event.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </label>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                Mulai Chat
              </button>
              <small>Data hanya dipakai untuk pendampingan. Tanpa akun, tanpa biaya.</small>
            </form>
          ) : (
            <>
              <div className="store-chat-body">
                {messages.map((message) => (
                  <div key={message.id} className={`public-msg ${message.role === 'user' ? 'user' : 'bot'}`}>
                    <MarkdownText text={message.text} />
                    {message.source && message.source !== 'none' ? (
                      <span style={{ display: 'block', marginTop: 4, fontSize: 10.5, opacity: 0.7 }}>
                        {SOURCE_LABEL[message.source]}
                      </span>
                    ) : null}
                  </div>
                ))}
                {sending ? <div className="public-msg bot" style={{ width: 60 }}>•••</div> : null}
                <div ref={bottom}></div>
              </div>
              <form className="store-chat-input" onSubmit={(event) => void send(event)}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Tulis pertanyaan seputar halal..."
                  aria-label="Tulis pertanyaan"
                />
                <MicButton
                  onText={(text) => setInput((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text))}
                />
                <button className="btn btn-primary btn-sm" type="submit" disabled={sending}>Kirim</button>
              </form>
            </>
          )}
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
