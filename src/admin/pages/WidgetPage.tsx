import { useEffect, useRef, useState } from 'react';

/**
 * Widget chat KHB — dipakai sebagai halaman pratinjau dan target iframe
 * launcher di landing page (`/admin/widget`).
 *
 * Jawaban masih memakai basis aturan lokal (tanpa panggilan API) supaya widget
 * bisa dipakai sebagai demo mandiri. Tampilan memakai kelas `w2-*` yang
 * didefinisikan di `styles/modern.css` agar tidak bertabrakan dengan gaya panel.
 */

const responseFor = (text: string) => {
  const q = text.toLowerCase();
  /* Aturan kontak dicek lebih dulu: pertanyaan seperti "bagaimana cara
     menghubungi admin" juga mengandung kata "cara", sehingga urutan penting. */
  if (q.includes('hubungi') || q.includes('kontak') || q.includes('admin') || q.includes('whatsapp'))
    return 'Admin KHB dapat dihubungi melalui <strong>WhatsApp +62 821-1676-403</strong> atau email <strong>komunitashalalbandung@gmail.com</strong> pada jam layanan Senin–Jumat, 08.00–17.00 WIB.';
  if (q.includes('self declare') || q.includes('self-declare'))
    return 'Sertifikasi halal jalur <strong>self declare</strong> ditujukan untuk pelaku usaha mikro dan kecil dengan produk berisiko rendah, bahan yang sudah dipastikan kehalalannya, dan proses produksi sederhana. Pengajuan didampingi oleh Pendamping PPH. Persyaratan dapat berubah, jadi pastikan mengecek informasi terbaru di BPJPH.';
  if (q.includes('dokumen') || q.includes('persiap'))
    return 'Secara umum, pelaku usaha perlu menyiapkan data pelaku usaha, Nomor Induk Berusaha (NIB), daftar produk dan bahan, serta alur proses produksi. Dokumen tambahan bisa diperlukan sesuai jenis usaha dan jalur sertifikasi. Silakan cek persyaratan resmi BPJPH untuk informasi terkini.';
  if (q.includes('bahan'))
    return 'Titik kritis halal dapat ditemukan pada bahan hewani, bahan tambahan, bahan penolong, serta proses penyimpanan dan pengolahan. Periksa komposisi dan dokumen pendukung dari pemasok. Untuk keputusan resmi, konsultasikan dengan Pendamping PPH atau BPJPH.';
  if (q.includes('biaya') || q.includes('gratis') || q.includes('murah'))
    return 'Program sertifikasi halal gratis (SEHATI) tersedia untuk pelaku usaha mikro dan kecil yang memenuhi kriteria dan kuota program. Ketersediaan dapat berubah. Periksa pengumuman resmi BPJPH atau tanyakan ke Pendamping PPH.';
  if (q.includes('lama') || q.includes('berapa') || q.includes('durasi') || q.includes('waktu'))
    return 'Proses sertifikasi halal umumnya memakan waktu beberapa minggu hingga beberapa bulan tergantung jalur (self declare vs reguler), kelengkapan dokumen, dan antrian di BPJPH. Jalur self declare cenderung lebih cepat. Informasi terkini silakan cek di website SIHALAL.';
  if (q.includes('daftar') || q.includes('sertifikat') || q.includes('sertifikasi') || q.includes('cara'))
    return 'Untuk memulai, pelaku usaha dapat membuat akun pada <strong>SIHALAL (sihalal.halal.go.id)</strong>, melengkapi data usaha dan produk, lalu mengajukan sertifikasi sesuai skema yang memenuhi kriteria. UMK dengan produk berisiko rendah mungkin dapat mengajukan jalur self declare. Persyaratan dapat berubah; silakan rujuk informasi resmi BPJPH.';
  if (q.includes('status') || q.includes('cek') || q.includes('pantau'))
    return 'Anda dapat memantau status pengajuan sertifikasi halal melalui portal <strong>SIHALAL</strong> menggunakan akun yang telah didaftarkan. Sistem akan menampilkan tahapan proses secara real-time.';
  return 'Terima kasih atas pertanyaannya! Saya bisa membantu edukasi umum tentang sertifikasi halal, self declare, persiapan dokumen, bahan halal, dan proses pengajuan. Mohon jelaskan sedikit konteks usaha atau produk Anda agar saya bisa memberi panduan yang lebih relevan. Untuk informasi resmi terkini, silakan merujuk pada BPJPH.';
};

const PROMPTS = [
  'Bagaimana cara mendaftar sertifikasi halal?',
  'Apakah self declare gratis untuk UMKM?',
  'Dokumen apa yang harus saya siapkan?',
  'Bagaimana cara menghubungi admin KHB?',
];

const BotAvatar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 11.5a7.7 7.7 0 0 1-8.3 7.7 8.6 8.6 0 0 1-3.1-.8L4 20l1.6-4.7a7.7 7.7 0 0 1-.9-3.6 7.7 7.7 0 0 1 7.7-7.7 7.7 7.7 0 0 1 8.1 7.5Z" />
  </svg>
);

const nowTime = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

interface WidgetMessage {
  from: 'bot' | 'user';
  html: string;
  time: string;
}

export default function WidgetPage() {
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      from: 'bot',
      html: "Assalamu'alaikum! 👋<br /><br />Saya asisten edukasi halal Komunitas Halal Bandung. Tanya seputar <strong>sertifikasi halal, self declare, dokumen,</strong> dan proses BPJPH.<br /><br />Ada yang bisa saya bantu?",
      time: nowTime(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    const value = String(text || '').trim();
    if (!value || typing) return;
    setMessages((m) => [
      ...m,
      {from: 'user', html: value.replace(/&/g, '&amp;').replace(/</g, '&lt;'), time: nowTime() },
    ]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'bot', html: responseFor(value), time: nowTime() }]);
    }, 900 + Math.random() * 500);
  };

  const showPrompts = messages.length <= 1;

  return (
    <div className="w2-shell">
      <header className="w2-head">
        <span className="w2-avatar"><BotAvatar /></span>
        <div className="w2-head-copy">
          <strong>Asisten Halal KHB</strong>
          <span className="w2-status"><i /> Online · balas &lt; 2 dtk</span>
        </div>
        <span className="w2-badge">AI</span>
      </header>

      <div className="w2-body" ref={boxRef}>
        <div className="w2-day"><span>Hari ini</span></div>

        {messages.map((msg, i) => (
          <div key={i} className={`w2-msg ${msg.from}`}>
            {msg.from === 'bot' ? <span className="w2-msg-avatar"><BotAvatar /></span> : null}
            <div className="w2-bubble-wrap">
              <span className="w2-sender">{msg.from === 'bot' ? 'Asisten Halal KHB' : 'Anda'}</span>
              <div
                className="w2-bubble"
                dangerouslySetInnerHTML={{ __html: msg.html }}
              />
              <span className="w2-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {typing ? (
          <div className="w2-msg bot">
            <span className="w2-msg-avatar"><BotAvatar /></span>
            <div className="w2-bubble w2-typing"><i /><i /><i /></div>
          </div>
        ) : null}
      </div>

      {showPrompts ? (
        <div className="w2-prompts">
          <span className="w2-prompts-label">Pertanyaan yang sering ditanyakan</span>
          <div className="w2-prompts-grid">
            {PROMPTS.map((p, index) => (
              <button key={p} type="button" onClick={() => send(p)}>
                <span className="w2-prompt-num">{index + 1}</span>
                <span className="w2-prompt-text">{p}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        className="w2-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          placeholder="Tulis pertanyaan seputar halal…"
          aria-label="Tulis pesan"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button className="w2-send" type="submit" aria-label="Kirim pesan" disabled={typing || !input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 3 10.5 13.5" />
            <path d="M21 3l-6.5 18-4-8.5L2 8.5 21 3Z" />
          </svg>
        </button>
      </form>

      <div className="w2-foot">AI dapat membuat kesalahan. Rujuk BPJPH untuk info resmi.</div>
    </div>
  );
}
