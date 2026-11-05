import { useParams } from 'react-router-dom';
import { PublicChat } from '../components/PublicChat';

/**
 * Halaman embed chatbot (`/admin/embed/:slug`) untuk dipasang di landing page
 * lewat iframe. Identitas wajib diisi pengunjung; riwayat percakapan tersimpan.
 */
export default function EmbedChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  return (
    <div className="embed-page">
      <div className="embed-frame">
        <header className="embed-head">
          <span className="embed-avatar">✦</span>
          <div>
            <strong>Asisten Halal KHB</strong>
            <span>RAG + pengetahuan umum</span>
          </div>
        </header>
        <PublicChat slug={store} compact />
      </div>
    </div>
  );
}
