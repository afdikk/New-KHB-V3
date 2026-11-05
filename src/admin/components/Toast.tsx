import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Notify = (text: string, duration?: number) => void;

const ToastCtx = createContext<Notify>(() => {});

export const useToast = (): Notify => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback<Notify>((text, duration = 2600) => {
    setMsg(text);
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), duration);
  }, []);

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div className={`toast${show ? ' show' : ''}`} id="toast" role="status" aria-live="polite">
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
