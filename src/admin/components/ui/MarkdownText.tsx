import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Render jawaban asisten sebagai markdown.
 *
 * Panel RAG (rag.aiones.app) menampilkan jawaban dengan heading, penebalan, dan
 * daftar; komponen ini menyamakan tampilan tersebut di chat KHB. Sitasi sudah
 * dibuang di server, jadi yang dirender hanya formatnya.
 *
 * Tabel dibungkus pembungkus yang bisa digeser mendatar. Tanpa ini tabel lebar
 * memaksa balon chat melebar sampai keluar panel — terutama di layar sempit.
 */
export function MarkdownText({ text }: { text: string }) {
  return (
    <div className="md-answer">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="md-table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
