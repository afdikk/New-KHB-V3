import { useEffect, useState } from 'react';
import { useSpeechInput } from '../hooks/useSpeechInput';

interface MicButtonProps {
  /** Teks hasil pengenalan suara — dipakai untuk mengisi kolom input. */
  onText: (text: string) => void;
  /** Bila diisi, kesalahan diteruskan ke pemanggil (mis. toast). */
  onError?: (message: string) => void;
  /** Gaya tambahan bila tata letak halaman butuh. */
  className?: string;
}

/**
 * Tombol mikrofon untuk kolom chat.
 *
 * Klik untuk mulai bicara, klik lagi untuk berhenti. Hasilnya dikirim ke
 * `onText` agar bisa diedit sebelum dikirim. Tombol tidak muncul bila browser
 * tidak mendukung Web Speech API (mis. Firefox).
 */
export function MicButton({ onText, onError, className }: MicButtonProps) {
  const [error, setError] = useState('');
  const { supported, listening, toggle } = useSpeechInput({
    onTranscript: onText,
    onError: (message) => {
      setError(message);
      onError?.(message);
    },
  });

  useEffect(() => {
    if (error.length === 0) return;
    const timer = window.setTimeout(() => setError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  if (!supported) return null;

  return (
    <span className={`mic-wrap${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`mic-button${listening ? ' is-listening' : ''}`}
        onClick={toggle}
        aria-label={listening ? 'Berhenti merekam suara' : 'Bicara ke asisten'}
        aria-pressed={listening}
        title={listening ? 'Berhenti merekam' : 'Bicara ke asisten'}
      >
        {listening ? (
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="6.5" y="6.5" width="7" height="7" rx="1.6" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="7.2" y="2.6" width="5.6" height="9.4" rx="2.8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4.6 9.6a5.4 5.4 0 0 0 10.8 0M10 15v2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {listening ? <span className="mic-hint">Mendengarkan…</span> : null}
      {error.length > 0 ? <span className="mic-error">{error}</span> : null}
    </span>
  );
}
