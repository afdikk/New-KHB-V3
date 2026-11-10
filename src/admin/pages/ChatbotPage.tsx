import { useEffect, useState } from 'react';
import { Lottie } from 'lottie-react';
import { api, type ChatbotSettings, type WidgetTheme } from '../services/api';
import { useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import { SelectField, SettingRow, Slider, Switch, TextField } from '../components/ui/Fields';
import {
  IconAlert,
  IconChat,
  IconCheckCircle,
  IconDocument,
  IconRefresh,
  IconSend,
  IconSettings,
  IconShield,
  IconSparkles,
} from '../components/ui/Icons';

const TONES = ['Ramah & ringkas', 'Formal & rinci', 'Sangat ringkas (poin)'];
const LANGUAGES = ['Bahasa Indonesia', 'Bahasa Indonesia + istilah Arab', 'Bahasa Sunda (percakapan)'];
const FALLBACKS = ['Eskalasi ke Pendamping PPH', 'Kirim tautan SIHALAL', 'Tawarkan hubungi WhatsApp'];

export default function ChatbotPage() {
  const notify = useToast();
  const { data, loading, error, reload } = useResource<ChatbotSettings>(() => api.chatbot.get(), []);
  const { data: themes } = useResource<WidgetTheme[]>(() => api.chat.themes(), []);
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
        widgetTheme: form.widgetTheme,
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
        <div className="m-card">
          <div className="m-empty">
            <span className="m-empty-icon"><IconRefresh /></span>
            <strong>Memuat pengaturan asisten…</strong>
          </div>
        </div>
      </section>
    );
  }

  if ((error && !form) || !form) {
    return (
      <section className="view active" id="view-chatbot">
        <div className="m-card">
          <div className="m-empty">
            <span className="m-empty-icon"><IconAlert /></span>
            <strong>Pengaturan tidak tersedia</strong>
            <p>{error ?? 'Coba muat ulang halaman ini.'}</p>
            <button className="m-btn m-btn-primary m-btn-sm" onClick={() => void reload()}>Coba lagi</button>
          </div>
        </div>
      </section>
    );
  }

  const set = <K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const dirty = data ? JSON.stringify(form) !== JSON.stringify(data) : false;
  const activeTheme = themes?.find((theme) => theme.key === form.widgetTheme) ?? null;

  return (
    <section className="view active" id="view-chatbot">
      <div className="m-head">
        <div className="m-head-copy">
          <span className="m-eyebrow">Pengaturan Asisten</span>
          <h1>Chatbot AI</h1>
          <p className="m-sub">Atur identitas, gaya jawaban, dan kebijakan jawaban asisten halal.</p>
        </div>
        <div className="m-head-actions">
          {dirty ? <span className="m-pill amber">Ada perubahan belum disimpan</span> : null}
          <button className="m-btn m-btn-primary" onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? <span className="a2-spinner" /> : <IconCheckCircle />}
            {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        {/* ── Kolom kiri: formulir ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Identitas &amp; gaya jawaban</h2>
                <p>Dipakai pada semua kanal percakapan</p>
              </div>
            </div>

            <div className="m-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField
                id="assistant-name"
                label="Nama asisten"
                value={form.assistantName}
                onChange={(value) => set('assistantName', value)}
                placeholder="Asisten Halal KHB"
                maxLength={60}
                hint="Muncul sebagai pengirim pesan di semua kanal."
              />

              <TextField
                id="assistant-greeting"
                label="Sapaan pembuka"
                value={form.greeting}
                onChange={(value) => set('greeting', value)}
                multiline
                rows={4}
                maxLength={400}
                hint="Tampil sebagai pesan pertama saat percakapan dimulai."
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                <SelectField
                  id="assistant-language"
                  label="Bahasa"
                  value={form.language}
                  options={LANGUAGES}
                  onChange={(value) => set('language', value)}
                />
                <SelectField
                  id="assistant-tone"
                  label="Gaya jawaban"
                  value={form.tone}
                  options={TONES}
                  onChange={(value) => set('tone', value)}
                />
              </div>

              <SelectField
                id="assistant-fallback"
                label="Jika jawaban tidak ditemukan"
                value={form.fallbackMode}
                options={FALLBACKS}
                onChange={(value) => set('fallbackMode', value)}
                hint="Perilaku asisten saat dokumen KHB tidak memuat jawabannya."
              />
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Perilaku percakapan</h2>
                <p>Bagaimana asisten menangani sumber, eskalasi, dan kontak</p>
              </div>
            </div>

            <div className="m-card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              <SettingRow
                icon={<IconDocument />}
                title="Selalu tampilkan sumber dokumen"
                desc="Setiap jawaban menyertakan nama dokumen rujukan."
              >
                <Switch
                  checked={form.showSources}
                  onChange={(value) => set('showSources', value)}
                  label="Selalu tampilkan sumber dokumen"
                />
              </SettingRow>

              <SettingRow
                icon={<IconSend />}
                title="Eskalasi otomatis"
                desc="Percakapan yang tidak terjawab ditandai butuh pendamping."
              >
                <Switch
                  checked={form.autoEscalate}
                  onChange={(value) => set('autoEscalate', value)}
                  label="Eskalasi otomatis"
                />
              </SettingRow>

              <SettingRow
                icon={<IconChat />}
                title="Minta kontak sebelum jawaban panjang"
                desc="Berguna untuk menindaklanjuti kasus yang butuh pendampingan."
              >
                <Switch
                  checked={form.requestContact}
                  onChange={(value) => set('requestContact', value)}
                  label="Minta kontak sebelum jawaban panjang"
                />
              </SettingRow>
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Kebijakan jawaban AI</h2>
                <p>Menentukan apakah asisten boleh menjawab di luar dokumen KHB</p>
              </div>
            </div>

            <div className="m-card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              <SettingRow
                icon={<IconSparkles />}
                title="Jawab pertanyaan umum (di luar RAG)"
                desc="Jika dokumen KHB tidak memuat jawabannya, asisten menjawab dari pengetahuan umum model. Jawaban diberi tanda “pengetahuan umum”."
              >
                <Switch
                  checked={form.allowGeneralKnowledge}
                  onChange={(value) => set('allowGeneralKnowledge', value)}
                  label="Jawab pertanyaan umum di luar RAG"
                />
              </SettingRow>

              <SettingRow
                icon={<IconShield />}
                title="Tampilkan catatan “bukan dokumen KHB”"
                desc="Menambahkan penutup pada jawaban umum agar tidak disalahartikan sebagai dokumen resmi."
              >
                <Switch
                  checked={form.generalDisclaimer}
                  onChange={(value) => set('generalDisclaimer', value)}
                  label="Tampilkan catatan bukan dokumen KHB"
                />
              </SettingRow>
            </div>

            <div className="m-card-pad" style={{ paddingTop: 0 }}>
              <Slider
                id="assistant-temperature"
                value={form.temperature}
                onChange={(value) => set('temperature', value)}
                hint="0 = faktual dan ketat, 1 = lebih bebas. Jawaban dari dokumen selalu memakai 0,4."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
            <button className="m-btn m-btn-ghost" type="button" onClick={() => setForm(data ?? form)} disabled={!dirty || saving}>
              Batalkan perubahan
            </button>
            <button className="m-btn m-btn-primary" type="button" onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>

        {/* ── Kolom kanan: pratinjau & status ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Tema widget</h2>
                <p>Warna &amp; animasi panel “Tanya Halal” di landing</p>
              </div>
            </div>
            <div className="m-card-pad">
              <div className="m-theme-grid">
                {(themes ?? []).map((theme) => {
                  const active = form.widgetTheme === theme.key;
                  return (
                    <button
                      key={theme.key}
                      type="button"
                      className={`m-theme-card${active ? ' is-active' : ''}`}
                      onClick={() => set('widgetTheme', theme.key)}
                      style={active ? { borderColor: theme.accent, boxShadow: `0 0 0 3px ${theme.accent}1a` } : undefined}
                      aria-pressed={active}
                    >
                      <span className="m-theme-art" style={{ background: theme.accentLight }}>
                        {theme.lottie ? (
                          <Lottie src={theme.lottie} autoplay loop style={{ width: 38, height: 38 }} />
                        ) : (
                          <span className="m-theme-dot" style={{ background: theme.accent }} />
                        )}
                      </span>
                      <span className="m-theme-name">{theme.label}</span>
                      <span className="m-theme-desc">{theme.description}</span>
                    </button>
                  );
                })}
              </div>
              <p className="m-field-hint" style={{ marginTop: 10 }}>
                Tema dipakai widget di landing dan halaman chat publik. Simpan untuk menerapkan.
              </p>
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Pratinjau pesan</h2>
                <p>Tampilan sapaan di kanal percakapan</p>
              </div>
            </div>
            <div className="m-card-pad">
              <div className="m-preview-chat">
                <div className="m-preview-row">
                  <span
                    className="m-preview-ava"
                    style={
                      activeTheme
                        ? { backgroundImage: `linear-gradient(135deg, ${activeTheme.accent}, ${activeTheme.accentDark})` }
                        : undefined
                    }
                  >
                    {(form.assistantName.trim().charAt(0) || 'K').toUpperCase()}
                  </span>
                  <div className="m-preview-bubble">{form.greeting}</div>
                </div>
                <span className="m-preview-meta">{form.assistantName}</span>
              </div>

              <div className="m-kv" style={{ marginTop: 16 }}>
                <div className="m-kv-row"><span>Bahasa</span><strong>{form.language}</strong></div>
                <div className="m-kv-row"><span>Gaya jawaban</span><strong>{form.tone}</strong></div>
                <div className="m-kv-row"><span>Jika tidak ditemukan</span><strong>{form.fallbackMode}</strong></div>
                <div className="m-kv-row"><span>Tampilkan sumber</span><strong>{form.showSources ? 'Ya' : 'Tidak'}</strong></div>
                <div className="m-kv-row"><span>Jawaban umum</span><strong>{form.allowGeneralKnowledge ? 'Aktif' : 'Mati'}</strong></div>
              </div>
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <div>
                <h2>Status sistem</h2>
                <p>Dari konfigurasi server</p>
              </div>
            </div>
            <div className="m-card-pad" style={{ paddingTop: 4 }}>
              <div className="m-kv">
                <div className="m-kv-row">
                  <span><IconSparkles /> LLM (pengetahuan umum)</span>
                  <strong>{form.capabilities.llmConfigured ? form.model ?? 'aktif' : 'belum diatur'}</strong>
                </div>
                <div className="m-kv-row">
                  <span><IconDocument /> Layanan RAG</span>
                  <strong>{form.capabilities.ragChatConfigured ? 'rag.aiones.app' : 'retrieval lokal'}</strong>
                </div>
                <div className="m-kv-row">
                  <span><IconSettings /> Knowledge base</span>
                  <strong style={{ fontSize: 11.5 }}>{form.capabilities.knowledgeBaseId ?? '—'}</strong>
                </div>
                <div className="m-kv-row">
                  <span><IconSettings /> Unggah dokumen</span>
                  <strong>
                    {form.capabilities.ragBackend === 'kms'
                      ? 'KMS'
                      : form.capabilities.ragBackend === 'rag-chat'
                        ? 'Layanan RAG'
                        : '—'}
                  </strong>
                </div>
                <div className="m-kv-row">
                  <span><IconCheckCircle /> Bisa jawab umum</span>
                  <strong>
                    <span className={`m-pill ${form.capabilities.canAnswerGeneral ? 'green' : 'slate'}`}>
                      {form.capabilities.canAnswerGeneral ? 'Ya' : 'Tidak'}
                    </span>
                  </strong>
                </div>
              </div>
              <p className="m-field-hint" style={{ marginTop: 12 }}>
                Pengaturan disimpan di tabel <code>chatbot_settings</code> dan langsung dipakai pada permintaan
                berikutnya di endpoint <code>/api/v1/chat</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
