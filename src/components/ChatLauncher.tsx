import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Launcher chatbot KHB untuk landing page.
 *
 * Tombol mengambang di kanan bawah; saat diklik panel berisi iframe
 * `/admin/embed/khb-bandung`. iframe dipakai supaya gaya panel admin tidak
 * bercampur dengan Tailwind landing dan riwayat/identitas tetap berjalan di
 * halaman embed (localStorage per origin tetap sama).
 */
export default function ChatLauncher({ slug = 'khb-bandung' }: { slug?: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unread, setUnread] = useState(true);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  // iframe baru dimuat saat pertama kali dibuka (hemat muatan awal landing).
  useEffect(() => {
    if (open) {
      setMounted(true);
      setUnread(false);
    }
  }, [open]);

  // Tombol lain di landing bisa membuka chat lewat: window.dispatchEvent(new Event('khb:open-chat')).
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('khb:open-chat', openChat);
    return () => window.removeEventListener('khb:open-chat', openChat);
  }, []);

  // Tutup dengan Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open ? (
        <div
          className={`fixed z-[9998] flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl
            ${expanded
              ? 'inset-x-2 bottom-2 top-16 rounded-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[760px] sm:max-h-[calc(100vh-7rem)] sm:w-[560px] sm:max-w-[calc(100vw-3rem)] sm:rounded-2xl'
              : 'inset-x-0 bottom-0 top-16 rounded-t-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[620px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px] sm:rounded-2xl'}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle size={15} />
              </span>
              <div className="leading-tight">
                <p className="text-[12.5px] font-semibold text-dark">Asisten Halal KHB</p>
                <p className="flex items-center gap-1 text-[10.5px] text-slate-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-label={expanded ? 'Perkecil jendela chat' : 'Perbesar jendela chat'}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-dark"
              >
                {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup chat"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-dark"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <iframe
            ref={frameRef}
            title="Asisten Halal KHB"
            src={mounted ? `/admin/embed/${slug}?chrome=0` : undefined}
            className="h-full w-full flex-1 border-0 bg-white"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka Asisten Halal KHB"
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark hover:shadow-xl"
      >
        <MessageCircle size={18} />
        Tanya Halal
        {unread ? (
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        ) : null}
      </button>
    </>
  );
}
