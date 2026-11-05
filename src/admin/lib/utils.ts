export const cn = (...xs: Array<string | false | null | undefined>): string => xs.filter(Boolean).join(' ');

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
