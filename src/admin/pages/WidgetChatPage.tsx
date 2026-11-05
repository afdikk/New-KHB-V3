import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, SOURCE_LABEL, type ChatBoot } from '../services/api';
import { MarkdownText } from '../components/ui/MarkdownText';
import { MicButton } from '../components/MicButton';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  source?: 'rag' | 'general' | 'handoff' | 'none';
  citations?: string[];
}

export default function WidgetChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  const [boot, setBoot] = useState<ChatBoot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionKey, setSessionKey] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.chat.boot(store);
        setBoot(data);
        setMessages([{ id: 'greeting', role: 'bot', text: data.assistant.greeting }]);
      } catch {
        setMessages([
          { id: 'greeting', role: 'bot', text: "Assalamu'alaikum! Saya Asisten Halal KHB. Silakan tanya seputar sertifikasi halal." },
        ]);
      }
    })();
  }, [store]);

  const send = async (event?: React.FormEvent | null, preset?: string) => {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const answer = await api.chat.send({ message: text, slug: store, sessionKey: sessionKey || undefined });
      setSessionKey(answer.sessionKey);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: answer.answer, source: answer.source, citations: answer.citations },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'bot', text: 'Maaf, asisten sedang tidak dapat dihubungi.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const starters = boot?.starters ?? [];

  return (
    <div className="public-shell">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600 }}>← Kembali ke situs KHB</Link>
        </div>

        <div className="public-card">
          <div className="public-head">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 3l7 3v6c0 5-3.3 7.8-7 9-3.7-1.2-7-4-7-9V6l7-3z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <strong>{boot?.assistant.name ?? 'Asisten Halal KHB'}</strong>
              <span>{sending ? 'Menyusun jawaban…' : `Online · ${store}`}</span>
            </div>
          </div>

          <div className="public-body">
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
          </div>

          {starters.length > 0 ? (
            <div style={{ padding: '0 14px 10px' }}>
              <div className="chip-row">
                {starters.map((starter) => (
                  <button key={starter} className="chip" onClick={() => void send(null, starter)}>{starter}</button>
                ))}
              </div>
            </div>
          ) : null}

          <form className="public-input" onSubmit={(event) => void send(event)}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tulis pertanyaan..."
              aria-label="Pertanyaan"
            />
            <MicButton
              onText={(text) => setInput((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${text}` : text))}
            />
            <button type="submit" disabled={sending}>Kirim</button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-2)', marginTop: 12 }}>
          Jawaban bersifat edukatif · bukan keputusan resmi BPJPH
        </p>
      </div>
    </div>
  );
}
