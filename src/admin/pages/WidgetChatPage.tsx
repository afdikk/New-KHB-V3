import { useParams } from 'react-router-dom';
import { PublicChat } from '../components/PublicChat';

/**
 * Halaman widget ringkas (`/admin/chat/:slug`) — dipakai saat chatbot dibuka
 * sebagai halaman tersendiri. Sama seperti embed: identitas wajib, riwayat tersimpan.
 */
export default function WidgetChatPage() {
  const { slug } = useParams();
  const store = slug || 'khb-bandung';

  return (
    <div className="widget-page">
      <div className="widget-card">
        <header className="widget-head">
          <span className="widget-avatar">✦</span>
          <div>
            <strong>Asisten Halal KHB</strong>
            <span>Online · balas dalam hitungan detik</span>
          </div>
        </header>
        <PublicChat slug={store} compact />
      </div>
    </div>
  );
}
