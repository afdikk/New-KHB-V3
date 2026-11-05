import { useState } from 'react';
import { api, SOURCE_LABEL, type ConversationDetail, type ConversationRow } from '../services/api';
import { formatDateTime, initials, useResource } from '../hooks/useApi';
import { MarkdownText } from '../components/ui/MarkdownText';

const STATUS_LABEL: Record<string, string> = {
  bot: 'Chatbot',
  pending_human: 'Perlu pendamping',
  resolved: 'Selesai',
};

const SOURCE_BADGE: Record<string, string> = {
  rag: 'badge-green',
  general: 'badge-blue',
  handoff: 'badge-amber',
  none: 'badge-slate',
};

export default function HistoryPage() {
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data, loading, error, reload } = useResource(
    async () => {
      const [list, summary] = await Promise.all([
        api.conversations.list({ q: query || undefined, status: status || undefined, source: source || undefined, perPage: 50 }),
        api.dashboard.summary(),
      ]);
      return { ...list, stats: summary.stats };
    },
    [status, source, query],
  );

  const rows: ConversationRow[] = data?.rows ?? [];
  const stats = data?.stats;

  const openDetail = async (row: ConversationRow) => {
    setDetailLoading(true);
    try {
      setDetail(await api.conversations.detail(row.id));
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const exportCsv = () => {
    const header = 'id,pengguna,kanal,status,sumber_terakhir,pesan,terakhir\n';
    const body = rows
      .map((row) =>
        [row.id, row.customerName ?? '', row.channel ?? '', row.status, row.lastSource ?? '', row.messageCount, row.lastMessageAt ?? ''].join(','),
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'percakapan-khb.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="view active" id="view-history">
      <div className="page-title-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"></span> MONITORING PENGGUNA</div>
          <h1>Riwayat Percakapan</h1>
          <p className="subheading">Pertanyaan pengguna beserta sumber jawaban asisten.</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCsv}>Ekspor CSV</button>
      </div>

      <div className="history-stats">
        <div className="history-stat panel">
          <span className="history-stat-icon">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </span>
          <div><small>Percakapan 30 hari</small><strong>{(stats?.conversations30d ?? 0).toLocaleString('id-ID')}</strong><span className="history-neutral">tersimpan di database</span></div>
        </div>
        <div className="history-stat panel">
          <span className="history-stat-icon blue">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          <div><small>UMKM terlayani</small><strong>{stats?.customers ?? 0}</strong><span className="history-neutral">pengunjung widget</span></div>
        </div>
        <div className="history-stat panel">
          <span className="history-stat-icon orange">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div><small>Dijawab dari dokumen</small><strong>{stats?.accuracy ?? 0}<span className="smaller-percent">%</span></strong><span className="history-neutral">sisanya jawaban umum</span></div>
        </div>
        <div className="history-stat panel">
          <span className="history-stat-icon purple">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h6M7 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </span>
          <div><small>Pesan tersimpan</small><strong>{(stats?.messages30d ?? 0).toLocaleString('id-ID')}</strong><span className="history-neutral">30 hari terakhir</span></div>
        </div>
      </div>

      <div className="panel history-panel">
        <div className="history-toolbar">
          <div>
            <h2>Semua percakapan</h2>
            <p>{data?.total ?? 0} percakapan ditemukan</p>
          </div>
          <div className="history-filters">
            <label className="search-box">
              <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input type="search" placeholder="Cari pengguna..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className="settings-select" style={{ height: 36, fontSize: 12 }} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Semua status</option>
              <option value="bot">Chatbot</option>
              <option value="pending_human">Perlu pendamping</option>
              <option value="resolved">Selesai</option>
            </select>
            <select className="settings-select" style={{ height: 36, fontSize: 12 }} value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="">Semua sumber</option>
              <option value="rag">Dokumen KHB</option>
              <option value="general">Pengetahuan umum</option>
              <option value="handoff">Diteruskan</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table history-table">
            <thead><tr><th>PENGGUNA</th><th>KANAL</th><th>PESAN</th><th>SUMBER TERAKHIR</th><th>WAKTU</th><th>STATUS</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar avatar-soft-green">{initials(row.customerName)}</div>
                      <div>
                        <strong>{row.customerName ?? 'Pengunjung web'}</strong>
                        <small>{row.id.slice(0, 8)}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.channel ?? 'Widget'}</td>
                  <td>{row.messageCount}</td>
                  <td>
                    <span className={`badge-pill ${SOURCE_BADGE[row.lastSource ?? 'none']}`}>
                      <i></i>{SOURCE_LABEL[row.lastSource ?? 'none']}
                    </span>
                  </td>
                  <td>{formatDateTime(row.lastMessageAt)}</td>
                  <td>
                    <span className={`badge-pill ${row.status === 'pending_human' ? 'badge-amber' : 'badge-green'}`}>
                      <i></i>{STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                  <td>
                    <button className="dots-btn" aria-label="Lihat detail" onClick={() => void openDetail(row)}>⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? <p className="knowledge-note" style={{ padding: '0 18px' }}>Memuat percakapan…</p> : null}
          {error ? (
            <div style={{ padding: '0 18px', color: '#b91c1c' }} className="knowledge-note">
              {error}{' '}
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => void reload()}>
                Coba lagi
              </button>
            </div>
          ) : null}
          {!loading && !error && rows.length === 0 ? <div className="empty-state">Belum ada percakapan yang cocok.</div> : null}
        </div>

        <div className="table-footer">
          <span>Menampilkan <strong>{rows.length}</strong> dari <strong>{data?.total ?? 0}</strong> percakapan</span>
          <button className="btn btn-secondary btn-sm" onClick={() => void reload()}>Muat ulang</button>
        </div>
      </div>

      {detail || detailLoading ? (
        <div className="modal" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 20 }}>
          <div className="panel" style={{ width: 'min(640px, 100%)', maxHeight: '80vh', overflowY: 'auto', padding: 22 }}>
            <div className="panel-heading">
              <div>
                <h2>{detail?.customerName ?? 'Detail percakapan'}</h2>
                <p>{detail ? `${detail.channel ?? 'Widget'} · ${STATUS_LABEL[detail.status] ?? detail.status}` : 'Memuat…'}</p>
              </div>
              <button className="dots-btn" aria-label="Tutup" onClick={() => setDetail(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {(detail?.messages ?? []).map((message) => (
                <div
                  key={message.id}
                  className={`public-msg ${message.senderType === 'customer' ? 'user' : 'bot'}`}
                  style={{ maxWidth: '86%', marginLeft: message.senderType === 'customer' ? 'auto' : 0 }}
                >
                  <MarkdownText text={message.text} />
                  {message.senderType === 'bot' && message.source !== 'none' ? (
                    <span style={{ display: 'block', marginTop: 6, fontSize: 11, opacity: 0.75 }}>
                      {SOURCE_LABEL[message.source]}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
