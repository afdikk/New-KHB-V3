import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Input suara untuk chat (Web Speech API).
 *
 * Memakai `SpeechRecognition` bawaan browser (Chrome/Edge) dengan bahasa
 * Indonesia — tanpa layanan pihak ketiga. Bila browser tidak mendukung,
 * `supported` bernilai false sehingga tombol mikrofon tidak ditampilkan.
 *
 * Catatan: API ini hanya aktif pada HTTPS atau `localhost`.
 */

interface SpeechResultAlternative {
  transcript: string;
}

interface SpeechResultItem {
  isFinal: boolean;
  0: SpeechResultAlternative;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechResultItem;
  };
}

interface SpeechRecognitionErrorLike {
  error?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function errorMessage(code?: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Izin mikrofon ditolak. Aktifkan mikrofon untuk situs ini lalu coba lagi.';
    case 'no-speech':
      return 'Tidak ada suara terdeteksi. Coba bicara lebih dekat ke mikrofon.';
    case 'audio-capture':
      return 'Mikrofon tidak ditemukan. Periksa perangkat Anda.';
    case 'network':
      return 'Koneksi terputus saat memproses suara. Coba lagi.';
    case 'aborted':
      return '';
    default:
      return 'Suara belum bisa diproses. Coba lagi.';
  }
}

export interface SpeechInputOptions {
  /** Bahasa pengenalan suara; default Indonesia. */
  lang?: string;
  /** Dipanggil saat satu ucapan selesai dikenali. */
  onTranscript: (text: string) => void;
  /** Dipanggil untuk interim (teks sementara) — opsional. */
  onInterim?: (text: string) => void;
  /** Dipanggil saat terjadi kesalahan yang perlu diberitahukan. */
  onError?: (message: string) => void;
}

export function useSpeechInput({ lang = 'id-ID', onTranscript, onInterim, onError }: SpeechInputOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef('');

  // Simpan callback di ref agar tidak memicu re-init recognition.
  const handlers = useRef({ onTranscript, onInterim, onError });
  handlers.current = { onTranscript, onInterim, onError };

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      handlers.current.onError?.('Browser ini belum mendukung input suara. Gunakan Chrome atau Edge.');
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    transcriptRef.current = '';

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const item = event.results[index];
        if (!item) continue;
        const text = item[0]?.transcript ?? '';
        if (item.isFinal) finalText += text;
        else interim += text;
      }
      if (interim.length > 0) handlers.current.onInterim?.(interim);
      if (finalText.trim().length > 0) {
        transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
      }
    };

    recognition.onerror = (event) => {
      const message = errorMessage(event.error);
      if (message.length > 0) handlers.current.onError?.(message);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const text = transcriptRef.current.trim();
      transcriptRef.current = '';
      if (text.length > 0) handlers.current.onTranscript(text);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setListening(false);
      handlers.current.onError?.('Mikrofon sedang dipakai proses lain. Coba lagi.');
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, start, stop, toggle };
}
