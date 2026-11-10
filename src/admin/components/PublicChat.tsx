import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, SOURCE_LABEL, type ChatBoot, type VisitorSession } from '../services/api';
import { Lottie } from 'lottie-react';
import { MarkdownText } from './ui/MarkdownText';
import { MicButton } from './MicButton';

/**
 * Chat publik KHB.
 *
 * Aturan produk (mengikuti omnicare):
 * 1. Data diri (nama + WhatsApp/email) diisi SEKALI, lalu tersimpan di perangkat
 *    (`localStorage`) sehingga tidak ditanya lagi pada kunjungan berikutnya.
 * 2. Riwayat tampil sebagai layar penuh — dibuka lewat tombol riwayat, kembali
 *    dengan tombol back. Tidak memakai sidebar.
 */

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  source?: 'rag' | 'general' | 'handoff' | 'none';
}

interface Identity {
  name: string;
  contact: string;
  token: string;
}

type Screen = 'chat' | 'history';

/** Dipakai bila backend belum siap, agar pengunjung tetap punya titik mulai. */
const STARTERS_FALLBACK = [
  'Bagaimana cara mendaftar sertifikasi halal?',
  'Apakah self declare gratis untuk UMKM?',
  'Dokumen apa yang harus saya siapkan?',
  'Bagaimana cara menghubungi admin KHB?',
];

const isValidContact = (value: string): boolean => {
  const clean = value.replace(/[\s-]/g, '');
  return /^(?:[^@\s]+@[^@\s]+\.[^@\s]{2,}|\+?62[0-9]{7,14}|0[0-9]{7,14})$/.test(clean);
};

function storageKeys(slug: string) {
  return {
    identity: `khb_identity_${slug}`,
    token: `khb_token_${slug}`,
    session: `khb_session_${slug}`,
    conversation: `khb_conversation_${slug}`,
  };
}

function readIdentity(slug: string): Identity | null {
  try {
    const raw = localStorage.getItem(storageKeys(slug).identity);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Identity;
    return parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function PublicChat({
  slug,
  compact = false,
  showHeader = true,
}: {
  slug: string;
  compact?: boolean;
  /** Sembunyikan kepala chat bila induknya sudah punya header sendiri. */
  showHeader?: boolean;
}) {
  const keys = useMemo(() => storageKeys(slug), [slug]);

  const [boot, setBoot] = useState<ChatBoot | null>(null);
  /** Tema widget dari admin (warna aksen); null = pakai hijau bawaan CSS. */
  const [theme, setTheme] = useState<ChatBoot['theme'] | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(() => readIdentity(slug));
  const [draftIdentity, setDraftIdentity] = useState({ name: '', contact: '', consent: false });
  const [identityError, setIdentityError] = useState('');
  const [registering, setRegistering] = useState(false);

  const [screen, setScreen] = useState<Screen>('chat');
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    () => localStorage.getItem(keys.conversation) ?? null,
  );
  const [search, setSearch] = useState('');

  // Percakapan mulai kosong: asisten menyapa pada balasan pertanyaan pertama,
  // bukan lewat bubble pembuka yang panjang.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const sessionKey = useRef(localStorage.getItem(keys.session) ?? '');
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.chat.boot(slug);
        setBoot(data);
        setTheme(data.theme ?? null);
      } catch {
        // biarkan penyusun pertanyaan bawaan yang tampil
      }
    })();
  }, [slug]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const refreshSessions = useCallback(
    async (token: string) => {
      try {
        setSessions(await api.chat.sessions(token, slug));
      } catch {
        setSessions([]);
      }
    },
    [slug],
  );

  useEffect(() => {
    if (!identity) return;
    void refreshSessions(identity.token);
  }, [identity, refreshSessions]);

  const openSession = async (session: VisitorSession) => {
    if (!identity) return;
    setLoadingHistory(true);
    setScreen('chat');
    try {
      const detail = await api.chat.session(session.conversationId, identity.token, slug);
      setMessages(
        detail.messages.map((message) => ({
          id: message.id,
          role: message.senderType === 'customer' ? 'user' : 'bot',
          text: message.text,
          source: message.source as ChatMessage['source'],
        })),
      );
      setActiveConversation(session.conversationId);
      sessionKey.current = detail.sessionKey;
      localStorage.setItem(keys.conversation, session.conversationId);
      localStorage.setItem(keys.session, detail.sessionKey);
    } catch {
      setMessages([{ id: 'error', role: 'bot', text: 'Riwayat itu belum bisa dibuka. Coba lagi ya.' }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    sessionKey.current = '';
    setActiveConversation(null);
    setScreen('chat');
    localStorage.removeItem(keys.session);
    localStorage.removeItem(keys.conversation);
    setMessages([]);
  };

  const submitIdentity = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = draftIdentity.name.trim();
    const contact = draftIdentity.contact.trim();
    if (name.length < 2) return setIdentityError('Nama wajib diisi.');
    if (!isValidContact(contact)) return setIdentityError('Isi nomor WhatsApp (mis. 0812xxxxxxx) atau email yang valid.');
    if (!draftIdentity.consent) return setIdentityError('Centang persetujuan penggunaan data untuk melanjutkan.');

    setIdentityError('');
    setRegistering(true);
    try {
      const result = await api.chat.identity({ name, contact, slug });
      const next: Identity = { name: result.customer.name, contact: result.customer.contact, token: result.token };
      setIdentity(next);
      localStorage.setItem(keys.identity, JSON.stringify(next));
      localStorage.setItem(keys.token, next.token);
      await refreshSessions(next.token);
    } catch (error) {
      setIdentityError(error instanceof Error ? error.message : 'Data diri belum bisa disimpan. Coba lagi.');
    } finally {
      setRegistering(false);
    }
  };

  const changeIdentity = () => {
    localStorage.removeItem(keys.identity);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.session);
    localStorage.removeItem(keys.conversation);
    sessionKey.current = '';
    setIdentity(null);
    setSessions([]);
    setActiveConversation(null);
    setScreen('chat');
    setDraftIdentity({ name: '', contact: '', consent: false });
  };

  const send = async (event?: React.FormEvent, preset?: string) => {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || sending || !identity) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const answer = await api.chat.visitorSend({
        token: identity.token,
        message: text,
        sessionKey: sessionKey.current || undefined,
        slug,
      });
      sessionKey.current = answer.sessionKey;
      localStorage.setItem(keys.session, answer.sessionKey);
      localStorage.setItem(keys.conversation, answer.conversationId);
      setActiveConversation(answer.conversationId);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: answer.answer, source: answer.source },
      ]);
      void refreshSessions(identity.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan.';
      // Token lama bisa tidak berlaku lagi (data pelanggan dihapus admin) —
      // minta isi identitas ulang alih-alih menampilkan error mentah.
      if (/data diri|token/i.test(message)) {
        changeIdentity();
        return;
      }
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'bot', text: message }]);
    } finally {
      setSending(false);
    }
  };

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(query) || session.snippet.toLowerCase().includes(query),
    );
  }, [sessions, search]);

  // Warna tema menimpa variabel hijau global, hanya di dalam cakupan chat ini.
  const themeStyle = theme
    ? ({
        '--green': theme.accent,
        '--green-dark': theme.accentDark,
        '--green-light': theme.accentLight,
        '--green-subtle': theme.accentSubtle,
      } as React.CSSProperties)
    : undefined;

  // ── Gerbang identitas (sekali saja, lalu tersimpan) ──────────
  if (!identity) {
    return (
      <div className={`pc-shell is-gate${compact ? ' is-compact' : ''}`} style={themeStyle}>
        <div className="pc-main">
          {showHeader ? (
            <header className="pc-head">
              <span className="pc-avatar" aria-hidden="true">K</span>
              <div className="pc-head-copy">
                <strong>{boot?.assistant.name ?? 'Asisten Halal KHB'}</strong>
                <span className="pc-status"><i></i> Online</span>
              </div>
            </header>
          ) : null}
          <div className="pc-gate">
            <div className="pc-gate-card">
              <span className="pc-gate-eyebrow">Sebelum mulai</span>
              <h2>Isi data diri dulu ya</h2>
              <p>
                Data ini cukup diisi sekali dan tersimpan di perangkat Anda. Nama serta kontak dipakai
                agar admin KHB bisa menindaklanjuti pertanyaan; percakapan juga tersimpan sebagai riwayat.
              </p>
              <form onSubmit={(event) => void submitIdentity(event)}>
                <label className="settings-field">
                  <span>Nama</span>
                  <input
                    className="settings-input"
                    value={draftIdentity.name}
                    onChange={(event) => setDraftIdentity({ ...draftIdentity, name: event.target.value })}
                    placeholder="Nama Anda"
                    autoComplete="name"
                  />
                </label>
                <label className="settings-field">
                  <span>WhatsApp / Email</span>
                  <input
                    className="settings-input"
                    value={draftIdentity.contact}
                    onChange={(event) => setDraftIdentity({ ...draftIdentity, contact: event.target.value })}
                    placeholder="08xxxxxxxxxx atau nama@email.com"
                    autoComplete="tel"
                  />
                </label>
                <label className="pc-consent">
                  <input
                    type="checkbox"
                    checked={draftIdentity.consent}
                    onChange={(event) => setDraftIdentity({ ...draftIdentity, consent: event.target.checked })}
                  />
                  <span>Saya setuju data ini digunakan untuk keperluan layanan KHB.</span>
                </label>
                {identityError ? <p className="pc-error">{identityError}</p> : null}
                <button className="btn btn-primary" type="submit" disabled={registering}>
                  {registering ? 'Menyimpan…' : 'Mulai Chat'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Layar riwayat (penuh, dengan tombol back) ───────────────
  if (screen === 'history') {
    return (
      <div className={`pc-shell is-history${compact ? ' is-compact' : ''}`} style={themeStyle}>
        <div className="pc-main">
          <header className="pc-head pc-head-history">
            <span className="pc-avatar" aria-hidden="true">H</span>
            <div className="pc-head-copy">
              <strong>Obrolan Anda</strong>
              <span className="pc-status">{identity.name} · {identity.contact}</span>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={startNewChat}>Baru</button>
          </header>

          <div className="pc-history-search">
            <input
              className="pc-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari percakapan…"
              aria-label="Cari percakapan"
            />
          </div>

          <div className="pc-history-list">
            {filteredSessions.length === 0 ? (
              <p className="pc-side-empty">
                Belum ada riwayat. Mulai bertanya, percakapan akan tersimpan di sini.
              </p>
            ) : (
              filteredSessions.map((session) => (
                <button
                  type="button"
                  key={session.conversationId}
                  className={`pc-history-item${activeConversation === session.conversationId ? ' is-active' : ''}`}
                  onClick={() => void openSession(session)}
                >
                  <span className="pc-history-avatar" aria-hidden="true">
                    {session.title.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                  <span className="pc-history-copy">
                    <span className="pc-history-title">{session.title}</span>
                    <span className="pc-history-snippet">{session.snippet || '—'}</span>
                  </span>
                  <span className="pc-history-meta">{relativeTime(session.lastMessageAt)}</span>
                </button>
              ))
            )}
          </div>

          <div className="pc-history-foot">
            <button type="button" className="pc-link" onClick={() => setScreen('chat')}>
              Kembali ke percakapan
            </button>
            <button type="button" onClick={changeIdentity}>Ganti data diri</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Layar percakapan ────────────────────────────────────────
  return (
    <div className={`pc-shell${compact ? ' is-compact' : ''}`} style={themeStyle}>
      <div className="pc-main">
        {showHeader ? (
          <header className="pc-head">
            <button
              type="button"
              className="pc-back"
              onClick={() => setScreen('history')}
              aria-label="Riwayat percakapan"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="pc-avatar" aria-hidden="true">K</span>
            <div className="pc-head-copy">
              <strong>{boot?.assistant.name ?? 'Asisten Halal KHB'}</strong>
              <span className="pc-status"><i></i> Online</span>
            </div>
            <button type="button" className="pc-new" onClick={startNewChat} aria-label="Percakapan baru">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </header>
        ) : (
          <div className="pc-mini">
            <button type="button" className="pc-mini-btn" onClick={() => setScreen('history')}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Riwayat
            </button>
            <span>{identity.name}</span>
          </div>
        )}

        <div className="pc-body">
          {loadingHistory ? <p className="pc-loading">Memuat riwayat…</p> : null}
          {!loadingHistory && messages.length === 0 && theme ? (
            <div className="pc-welcome" aria-hidden="true">
              <Lottie
                src={theme.welcomeLottie ?? theme.lottie ?? undefined}
                autoplay
                loop
                style={{ width: 152, height: 152 }}
              />
            </div>
          ) : null}
          {messages.map((message) => (
            <div key={message.id} className={`pc-msg ${message.role}`}>
              {message.role === 'bot' ? <span className="pc-msg-avatar" aria-hidden="true">K</span> : null}
              <div className="pc-bubble">
                <MarkdownText text={message.text} />
                {message.source && message.source !== 'none' ? (
                  <span className="pc-bubble-meta">{SOURCE_LABEL[message.source]}</span>
                ) : null}
              </div>
            </div>
          ))}
          {sending ? (
            <div className="pc-msg bot">
              <span className="pc-msg-avatar" aria-hidden="true">K</span>
              <div className="pc-bubble pc-typing"><i></i><i></i><i></i></div>
            </div>
          ) : null}
          <div ref={bottom} />
        </div>

        {messages.length <= 2 ? (
          <div className="pc-starters">
            <span className="pc-starters-label">Pertanyaan yang sering ditanyakan</span>
            <div className="pc-starters-grid">
              {(boot?.starters?.length ? boot.starters : STARTERS_FALLBACK).map((starter, index) => (
                <button type="button" key={starter} onClick={() => void send(undefined, starter)}>
                  <span className="pc-starter-num">{index + 1}</span>
                  <span className="pc-starter-text">{starter}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form className="pc-input-bar" onSubmit={(event) => void send(event)}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tulis pertanyaan seputar halal..."
            aria-label="Tulis pertanyaan"
          />
          <MicButton onText={(text) => setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))} />
          <button type="submit" className="pc-send" disabled={sending} aria-label="Kirim pesan">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3.5 10.5l13-6.5-4.5 13-2.2-5.3-6.3-1.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
