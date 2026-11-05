import { useParams, useSearchParams } from 'react-router-dom';
import { PublicChat } from '../components/PublicChat';

/**
 * Halaman embed chatbot (`/admin/embed/:slug`) untuk dipasang lewat iframe.
 *
 * `?chrome=0` dipakai launcher di landing: header milik launcher yang tampil,
 * jadi header di dalam iframe disembunyikan agar tidak dobel.
 * Identitas wajib diisi; riwayat percakapan tersimpan per pengunjung.
 */
export default function EmbedChatPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const store = slug || 'khb-bandung';
  const chrome = params.get('chrome') !== '0';

  return (
    <div className={`embed-page${chrome ? ' with-chrome' : ''}`}>
      <div className="embed-frame">
        {chrome ? (
          <header className="embed-head">
            <span className="embed-avatar">✦</span>
            <div>
              <strong>Asisten Halal KHB</strong>
              <span>RAG · pengetahuan umum</span>
            </div>
          </header>
        ) : null}
        <PublicChat slug={store} compact showHeader={false} />
      </div>
    </div>
  );
}
