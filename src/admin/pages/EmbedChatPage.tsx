import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, SOURCE_LABEL } from '../services/api';
import { MarkdownText } from '../components/ui/MarkdownText';
import { MicButton } from '../components/MicButton';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  source?: 'rag' | 'general' | 'handoff' | 'none';
  citations?: string[];
}

interface HistoryItem {
  sessionKey: string;
  title: string;
  time: string;
  snippet: string;
}

const SESSION_KEY = 'khb-session-embed';

export default function EmbedChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const raw = localStorage.getItem('khb-embed-history');
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'bot', text: "Assalamu'alaikum! Saya Asisten Halal KHB. Ada yang bisa dibantu soal sertifikasi halal?" },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionKey = useRef(localStorage.getItem(SESSION_KEY) ?? '');
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const boot = await api.chat.boot(store);
        setMessages([{ id: 'greeting', role: 'bot', text: boot.assistant.greeting }]);
      } catch {
        // biarkan sapaan default
      }
    })();
  }, [store]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const persistHistory = (item: HistoryItem) => {
    const next = [item, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem('khb-embed-history', JSON.stringify(next));
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
      });
      sessionKey.current = answer.sessionKey;
      localStorage.setItem(SESSION_KEY, answer.sessionKey);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: answer.answer, source: answer.source, citations: answer.citations },
      ]);
      persistHistory({
        sessionKey: answer.sessionKey,
        title: text.slice(0, 40),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        snippet: answer.answer.slice(0, 70),
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'bot', text: 'Maaf, asisten sedang tidak dapat dihubungi.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const newChat = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionKey.current = '';
    setMessages([{ id: 'greeting', role: 'bot', text: "Assalamu'alaikum! Ada yang bisa dibantu soal sertifikasi halal?" }]);
    setHistoryOpen(false);
  };

  return (
    <div className="embed-page">
      <aside className={`embed-history${historyOpen ? ' open' : ''}`}>
        <div className="embed-history-head">
          <div>
            <strong>Riwayat</strong>
            <span>{store}</span>
          </div>
          <button type="button" className="icon-action" aria-label="Tutup riwayat" onClick={() => setHistoryOpen(false)}>×</button>
        </div>
        <div className="embed-history-list">
          {history.length === 0 ? <p className="knowledge-note" style={{ padding: 12 }}>Belum ada riwayat di perangkat ini.</p> : null}
          {history.map((item) => (
            <button
              key={`${item.sessionKey}-${item.time}`}
              type="button"
              className="embed-history-item"
              onClick={() => { setHistoryOpen(false); void send(undefined, item.title); }}
            >
              <strong>{item.title}</strong>
              <span>{item.snippet}</span>
              <time>{item.time}</time>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" style={{ margin: 12 }} onClick={newChat}>
          Percakapan baru
        </button>
      </aside>

      {historyOpen ? <div className="embed-backdrop" onClick={() => setHistoryOpen(false)} aria-hidden="true"></div> : null}

      <div className="embed-chat">
        <header className="embed-head">
          <button type="button" className="icon-action" aria-label="Buka riwayat" onClick={() => setHistoryOpen(true)}>☰</button>
          <span className="store-chat-avatar">✦</span>
          <div>
            <strong>Asisten Halal KHB</strong>
            <span><i></i>{sending ? 'Menyusun jawaban…' : `Online · ${store}`}</span>
          </div>
        </header>

        <div className="embed-body">
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
          {sending ? <div className="public-msg bot" style={{ width: 54 }}>•••</div> : null}
          <div ref={bottom}></div>
        </div>

        <form className="embed-input" onSubmit={(event) => void send(event)}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tulis pertanyaan..."
            aria-label="Tulis pertanyaan"
          />
          <MicButton
            onText={(text) => setInput((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text))}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={sending}>Kirim</button>
        </form>

        <p className="embed-note">Jawaban bersifat edukatif · bukan keputusan resmi BPJPH</p>
      </div>
    </div>
  );
}
