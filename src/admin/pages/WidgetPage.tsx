import { useEffect, useRef, useState } from 'react';

const responseFor = (text: string) => {
  const q = text.toLowerCase();
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
  'Bagaimana cara mengajukan sertifikasi halal untuk UMKM?',
  'Apa itu sertifikat halal self declare?',
  'Berapa biaya sertifikasi halal?',
  'Dokumen apa saja yang perlu disiapkan?',
];

const BotAvatar = () => (
  <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
);

const nowTime = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

export default function WidgetPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', html: "Assalamu'alaikum! 👋<br /><br />Saya asisten edukasi halal Komunitas Halal Bandung. Tanya seputar <strong>sertifikasi halal, self declare, dokumen,</strong> dan proses BPJPH.<br /><br />Ada yang bisa saya bantu?", time: nowTime() },
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
    setMessages((m) => [...m, { from: 'user', html: value.replace(/&/g, '&amp;').replace(/</g, '&lt;'), time: nowTime() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'bot', html: responseFor(value), time: nowTime() }]);
    }, 900 + Math.random() * 500);
  };

  return (
    <>
<div className="wchat wchat-light">
    <div className="whead">
      <span className="wava"><BotAvatar /></span>
      <div className="whead-info"><strong>Asisten Halal KHB</strong><small><i></i>Online · balas &lt; 2 dtk</small></div>
      <span className="whead-badge">AI</span>
    </div>
    <div className="messages" id="messages" ref={boxRef}>
      <div className="day-divider"><span>Hari ini</span></div>
      {messages.map((msg, i) => (
        <div key={i} className={`message-row ${msg.from === 'bot' ? 'bot-row' : 'user-row'}`}>
          {msg.from === 'bot' ? <div className="message-avatar"><BotAvatar /></div> : null}
          <div className="message-content">
            <span className="sender-name">{msg.from === 'bot' ? 'Asisten Halal KHB' : 'Anda'}</span>
            <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.html + `<span class="message-time">${msg.time}</span>` }}></div>
          </div>
        </div>
      ))}
      {typing ? <div className="wtyping"><span></span><span></span><span></span></div> : null}
    </div>
    <div className="suggested-prompts widget-prompts">
      {PROMPTS.map((p) => (
        <button key={p} className="qr-chip" onClick={() => send(p)}>{p.length > 22 ? p.slice(0, 22) + '…' : p}</button>
      ))}
    </div>
    <form className="chat-input-row" id="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
      <textarea id="chat-input" rows={1} placeholder="Tulis pertanyaan seputar halal..." aria-label="Tulis pesan" value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}></textarea>
      <button className="send-button" type="submit" aria-label="Kirim pesan"><svg viewBox="0 0 20 20" fill="none"><path d="M4 10l12-6-6 12V10H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></button>
    </form>
    <div className="input-footnote">AI dapat membuat kesalahan. Rujuk BPJPH untuk info resmi.</div>
  </div>
    </>
  );
}
