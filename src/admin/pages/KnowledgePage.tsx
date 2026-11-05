import { useMemo, useState } from 'react';
import { api, type DocumentRow } from '../services/api';
import { formatDateTime, useResource } from '../hooks/useApi';
import { useToast } from '../components/Toast';

const EMPTY_FORM = { title: '', category: 'Panduan', content: '' };

export default function KnowledgePage() {
  const notify = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useResource(
    async () => {
      const [list, stats] = await Promise.all([
        api.knowledge.list({ q: query || undefined, category: category === 'Semua' ? undefined : category, perPage: 50 }),
        api.knowledge.stats(),
      ]);
      return { ...list, stats };
    },
    [query, category],
  );

  const ragState = useResource(() => api.knowledge.rag(), []);

  const rows: DocumentRow[] = data?.rows ?? [];
  const stats = data?.stats;
  const rag = ragState.data;
  const categories = useMemo(() => ['Semua', ...(stats?.categories.map((item) => item.label) ?? [])], [stats]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.content.trim().length < 20) {
      notify('Isi dokumen minimal 20 karakter');
      return;
    }
    setSaving(true);
    try {
      await api.knowledge.create({
        title: form.title.trim(),
        category: form.category.trim() || 'Umum',
        content: form.content.trim(),
        kind: 'text',
      });
      notify('Dokumen tersimpan dan terindeks');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await reload();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal menyimpan dokumen');
    } finally {
      setSaving(false);
    }
  };

  const reindex = async (row: DocumentRow) => {
    try {
      await api.knowledge.reindex(row.id);
      notify('Dokumen diunggah ulang ke knowledge base');
      await Promise.all([reload(), ragState.reload()]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal mengunggah ulang');
    }
  };

  const remove = async (row: DocumentRow) => {
    if (!window.confirm(`Hapus dokumen "${row.title}"?`)) return;
    try {
      await api.knowledge.remove(row.id);
      notify('Dokumen dihapus');
      await reload();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Gagal menghapus dokumen');
    }
  };

  return (
    <section className="view active" id="view-knowledge">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> PENGELOLAAN DATA AI</div>
          <h1>Knowledge Base</h1>
          <p className="subheading">Dokumen di halaman ini yang dipakai asisten untuk menjawab (jalur RAG).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          {showForm ? 'Tutup Form' : 'Tambah Dokumen'}
        </button>
      </div>

      {showForm ? (
        <form className="panel" style={{ padding: 22, marginBottom: 18 }} onSubmit={submit}>
          <div className="panel-heading" style={{ marginBottom: 12 }}>
            <div>
              <h2>Tambah dokumen rujukan</h2>
              <p>Tempel teks dokumen (hasil ekstraksi PDF/halaman web).</p>
            </div>
          </div>
          <div className="form-row-two">
            <div className="settings-field">
              <label htmlFor="doc-title">Judul dokumen</label>
              <input
                id="doc-title"
                className="settings-input"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Panduan Self Declare untuk UMK"
                required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="doc-category">Kategori</label>
              <input
                id="doc-category"
                className="settings-input"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Regulasi / Panduan / FAQ"
              />
            </div>
          </div>
          <div className="settings-field">
            <label htmlFor="doc-content">Isi dokumen</label>
            <textarea
              id="doc-content"
              className="settings-textarea"
              rows={8}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="Tempel isi dokumen di sini…"
              required
            />
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Dokumen'}</button>
          </div>
        </form>
      ) : null}

      <div className="knowledge-summary">
        <div className="knowledge-stat">
          <span className="knowledge-stat-icon green">
            <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </span>
          <div><small>Total dokumen</small><strong>{stats?.total ?? '—'}</strong></div>
        </div>
        <div className="knowledge-stat">
          <span className="knowledge-stat-icon blue">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div><small>Terindeks</small><strong>{stats?.indexed ?? '—'}</strong></div>
        </div>
        <div className="knowledge-stat">
          <span className="knowledge-stat-icon orange">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          <div><small>Potongan teks (chunk)</small><strong>{stats?.chunks ?? '—'}</strong></div>
        </div>
        <div className="knowledge-stat">
          <span className="knowledge-stat-icon purple">
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 5h12M4 10h8M4 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          <div><small>Kategori</small><strong>{stats?.categories.length ?? '—'}</strong></div>
        </div>
      </div>

      <div className="panel" style={{ padding: 22, marginBottom: 18 }}>
        <div className="panel-heading">
          <div>
            <h2>Status knowledge base RAG</h2>
            <p>Sumber jawaban asisten: {rag?.integration.ragChatUrl ?? '—'}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => void ragState.reload()}>Muat ulang</button>
        </div>
        <div className="kv">
          <div className="kv-row"><span>Knowledge base</span><strong>{rag?.knowledgeBaseId ?? '—'}</strong></div>
          <div className="kv-row"><span>Project KMS</span><strong>{rag?.organizationId ?? '—'}</strong></div>
          <div className="kv-row">
            <span>Jalur unggahan</span>
            <strong>{rag?.backend === 'kms' ? 'KMS (ragkms.aiones.app)' : rag?.backend === 'rag-chat' ? 'Layanan RAG' : '—'}</strong>
          </div>
          <div className="kv-row"><span>Dokumen terindeks di RAG</span><strong>{rag?.documents.filter((doc) => doc.status === 'completed').length ?? 0}</strong></div>
        </div>
        {ragState.error ? <p className="knowledge-note" style={{ color: '#b91c1c' }}>{ragState.error}</p> : null}
        <div className="flat-list" style={{ marginTop: 10 }}>
          {(rag?.documents ?? []).slice(0, 8).map((doc) => (
            <div className="flat-row" key={doc.id}>
              <span className="row-icon">{doc.status === 'completed' ? '✓' : doc.status === 'failed' ? '!' : '…'}</span>
              <span className="row-copy">
                <strong>{doc.title}</strong>
                <span>{doc.status}{doc.chunks ? ` · ${doc.chunks} chunk` : ''}</span>
              </span>
              <span className="row-meta">{doc.id.slice(0, 14)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel document-panel">
        <div className="document-toolbar">
          <div className="filter-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-tab${category === item ? ' selected' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search-box">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input
              type="search"
              placeholder="Cari dokumen..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>NAMA DOKUMEN</th><th>KATEGORI</th><th>SUMBER</th><th>STATUS</th><th>TERINDEKS</th><th></th></tr></thead>
            <tbody>
              {rows.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-name">
                      <span className={`file-icon ${doc.kind === 'pdf' ? 'pdf' : 'web'}`}>{doc.kind === 'pdf' ? 'PDF' : 'TXT'}</span>
                      <div>
                        <strong>{doc.title}</strong>
                        <small>{doc.fileName ?? `${doc.sizeKb} KB · ${doc.chunkCount} chunk`}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-label">{doc.category}</span></td>
                  <td>{doc.pages ? `${doc.pages} hlm` : 'Teks'}</td>
                  <td>
                    <span className={`badge-pill ${doc.status === 'indexed' ? 'badge-green' : 'badge-amber'}`}>
                      <i></i>{doc.status === 'indexed' ? 'Aktif' : doc.status === 'processing' ? 'Diproses' : 'Gagal'}
                    </span>
                  </td>
                  <td>{formatDateTime(doc.indexedAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-action" aria-label="Unggah ulang ke RAG" onClick={() => void reindex(doc)}>↻</button>
                      <button className="icon-action danger" aria-label="Hapus dokumen" onClick={() => void remove(doc)}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? <p className="knowledge-note" style={{ padding: '0 18px' }}>Memuat dokumen…</p> : null}
          {error ? <p className="knowledge-note" style={{ padding: '0 18px', color: '#b91c1c' }}>{error}</p> : null}
          {!loading && !error && rows.length === 0 ? <div className="empty-state">Dokumen tidak ditemukan.</div> : null}
        </div>

        <div className="table-footer">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{data?.total ?? 0}</strong> dokumen</span>
          <button className="btn btn-secondary btn-sm" onClick={() => void reload()}>Muat ulang</button>
        </div>
      </div>

      <p className="knowledge-note">
        Dokumen di sini adalah sumber jawaban mode RAG. Pertanyaan yang tidak tercakup dijawab dari pengetahuan umum
        dan diberi penanda di halaman percakapan.
      </p>
    </section>
  );
}
