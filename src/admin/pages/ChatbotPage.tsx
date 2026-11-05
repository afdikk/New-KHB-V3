import { useEffect, useState } from 'react';
import { api, type ChatbotSettings } from '../services/api';
import { useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

const TONES = ['Ramah & ringkas', 'Formal & rinci', 'Sangat ringkas (poin)'];
const LANGUAGES = ['Bahasa Indonesia', 'Bahasa Indonesia + istilah Arab', 'Bahasa Sunda (percakapan)'];
const FALLBACKS = ['Eskalasi ke Pendamping PPH', 'Kirim tautan SIHALAL', 'Tawarkan hubungi WhatsApp'];

export default function ChatbotPage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource<ChatbotSettings>(() => api.chatbot.get(), []);
  const [form, setForm] = useState<ChatbotSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const saved = await api.chatbot.update({
        assistantName: form.assistantName,
        greeting: form.greeting,
        language: form.language,
        tone: form.tone,
        fallbackMode: form.fallbackMode,
        showSources: form.showSources,
        autoEscalate: form.autoEscalate,
        requestContact: form.requestContact,
        allowGeneralKnowledge: form.allowGeneralKnowledge,
        generalDisclaimer: form.generalDisclaimer,
        temperature: form.temperature,
      });
      setForm(saved);
      notify('Pengaturan asisten disimpan ke database');
      await reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !form) {
    return (
      <section className="view active" id="view-chatbot">
        <div className="panel" style={{ padding: 32 }}><p className="knowledge-note">Memuat pengaturan asisten…</p></div>
      </section>
    );
  }

  if ((error && !form) || !form) {
    return (
      <section className="view active" id="view-chatbot">
        <div className="panel" style={{ padding: 32 }}>
          <p className="knowledge-note">{error ?? 'Pengaturan tidak tersedia.'}</p>
          <button className="btn btn-primary" onClick={() => void reload()}>Coba lagi</button>
        </div>
      </section>
    );
  }

  const set = <K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <section className="view active" id="view-chatbot">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PENGATURAN ASISTEN</div>
          <h1>Chatbot AI</h1>
          <p className="subheading">Atur identitas, gaya jawaban, dan kebijakan jawaban asisten halal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => void save()} disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid-2-1">
        <div className="panel" style={{ padding: 22 }}>
          <div className="panel-heading">
            <div>
              <h2>Identitas &amp; gaya jawaban</h2>
              <p>Dipakai pada semua kanal percakapan</p>
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="assistant-name">Nama asisten</label>
            <input id="assistant-name" className="settings-input" value={form.assistantName} onChange={(e) => set('assistantName', e.target.value)} />
          </div>

          <div className="settings-field">
            <label htmlFor="assistant-greeting">Sapaan pembuka</label>
            <textarea id="assistant-greeting" className="settings-textarea" rows={3} value={form.greeting} onChange={(e) => set('greeting', e.target.value)} />
            <small className="knowledge-note">Tampil sebagai pesan pertama saat percakapan dimulai.</small>
          </div>

          <div className="form-row-two">
            <div className="settings-field">
              <label htmlFor="assistant-language">Bahasa</label>
              <select id="assistant-language" className="settings-select" value={form.language} onChange={(e) => set('language', e.target.value)}>
                {LANGUAGES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="assistant-tone">Gaya jawaban</label>
              <select id="assistant-tone" className="settings-select" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                {TONES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="assistant-fallback">Jika jawaban tidak ditemukan</label>
            <select id="assistant-fallback" className="settings-select" value={form.fallbackMode} onChange={(e) => set('fallbackMode', e.target.value)}>
              {FALLBACKS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="settings-toggle-item">
            <div>
              <strong>Selalu tampilkan sumber dokumen</strong>
              <small>Setiap jawaban menyertakan nama dokumen rujukan.</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.showSources} onChange={(e) => set('showSources', e.target.checked)} />
              <span className="toggle-track"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div>
              <strong>Eskalasi otomatis</strong>
              <small>Percakapan yang tidak terjawab ditandai butuh pendamping.</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.autoEscalate} onChange={(e) => set('autoEscalate', e.target.checked)} />
              <span className="toggle-track"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div>
              <strong>Minta kontak sebelum jawaban panjang</strong>
              <small>Berguna untuk menindaklanjuti kasus yang butuh pendampingan.</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.requestContact} onChange={(e) => set('requestContact', e.target.checked)} />
              <span className="toggle-track"></span>
            </label>
          </div>

          <div className="panel-heading" style={{ marginTop: 22 }}>
            <div>
              <h2>Kebijakan jawaban AI</h2>
              <p>Menentukan apakah asisten boleh menjawab di luar dokumen KHB</p>
            </div>
          </div>

          <div className="settings-toggle-item">
            <div>
              <strong>Jawab pertanyaan umum (di luar RAG)</strong>
              <small>
                Jika dokumen KHB tidak memuat jawabannya, asisten menjawab dari pengetahuan umum model.
                Jawaban diberi tanda “pengetahuan umum”.
              </small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.allowGeneralKnowledge} onChange={(e) => set('allowGeneralKnowledge', e.target.checked)} />
              <span className="toggle-track"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div>
              <strong>Tampilkan catatan “bukan dokumen KHB”</strong>
              <small>Menambahkan penutup pada jawaban umum agar tidak disalahartikan sebagai dokumen resmi.</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.generalDisclaimer} onChange={(e) => set('generalDisclaimer', e.target.checked)} />
              <span className="toggle-track"></span>
            </label>
          </div>

          <div className="settings-field" style={{ marginTop: 14 }}>
            <label htmlFor="assistant-temperature">Kreativitas jawaban umum ({form.temperature.toFixed(1)})</label>
            <input
              id="assistant-temperature"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={form.temperature}
              onChange={(e) => set('temperature', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <small className="knowledge-note">0 = faktual dan ketat, 1 = lebih bebas. Jawaban dokumen selalu memakai 0,4.</small>
          </div>

          <div className="settings-actions">
            <button className="btn btn-secondary" type="button" onClick={() => setForm(data ?? form)}>Batal</button>
            <button className="btn btn-primary" type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>

        <div className="stack">
          <div className="panel" style={{ padding: 22 }}>
            <div className="panel-heading">
              <div>
                <h2>Pratinjau pesan</h2>
                <p>{form.assistantName}</p>
              </div>
            </div>
            <div className="public-msg bot" style={{ maxWidth: '100%' }}>{form.greeting}</div>
            <div className="kv" style={{ marginTop: 16 }}>
              <div className="kv-row"><span>Bahasa</span><strong>{form.language}</strong></div>
              <div className="kv-row"><span>Gaya jawaban</span><strong>{form.tone}</strong></div>
              <div className="kv-row"><span>Jika tidak ditemukan</span><strong>{form.fallbackMode}</strong></div>
              <div className="kv-row"><span>Tampilkan sumber</span><strong>{form.showSources ? 'Ya' : 'Tidak'}</strong></div>
              <div className="kv-row"><span>Jawaban umum</span><strong>{form.allowGeneralKnowledge ? 'Aktif' : 'Mati'}</strong></div>
            </div>
          </div>

          <div className="panel" style={{ padding: 22 }}>
            <div className="panel-heading">
              <div>
                <h2>Status sistem</h2>
                <p>Dari konfigurasi server</p>
              </div>
            </div>
            <div className="kv">
              <div className="kv-row">
                <span>LLM (pengetahuan umum)</span>
                <strong>{form.capabilities.llmConfigured ? form.model ?? 'aktif' : 'belum diatur'}</strong>
              </div>
              <div className="kv-row">
                <span>Layanan RAG</span>
                <strong>{form.capabilities.ragChatConfigured ? 'rag.aiones.app' : 'retrieval lokal'}</strong>
              </div>
              <div className="kv-row">
                <span>Knowledge base</span>
                <strong>{form.capabilities.knowledgeBaseId ?? '—'}</strong>
              </div>
              <div className="kv-row">
                <span>Unggah dokumen</span>
                <strong>{form.capabilities.ragBackend === 'kms' ? 'KMS' : form.capabilities.ragBackend === 'rag-chat' ? 'Layanan RAG' : '—'}</strong>
              </div>
              <div className="kv-row">
                <span>Bisa jawab umum</span>
                <strong>{form.capabilities.canAnswerGeneral ? 'Ya' : 'Tidak'}</strong>
              </div>
            </div>
            <p className="knowledge-note">
              Pengaturan disimpan di tabel <code>chatbot_settings</code>. Perubahan langsung dipakai pada permintaan
              berikutnya di endpoint <code>/api/v1/chat</code>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
