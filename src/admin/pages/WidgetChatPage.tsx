import { useParams } from 'react-router-dom';
import { PublicChat } from '../components/PublicChat';

/**
 * Halaman widget ringkas (`/admin/chat/:slug`) — dipakai saat chatbot dibuka
 * sebagai halaman tersendiri. Identitas wajib; riwayat tersimpan per pengunjung.
 */
export default function WidgetChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  return (
    <div className="widget-page">
      <div className="widget-card">
        <PublicChat slug={store} compact />
      </div>
    </div>
  );
}
