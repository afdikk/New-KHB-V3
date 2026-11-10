/**
 * Katalog tema widget chat.
 *
 * Satu sumber kebenaran untuk panel admin, launcher di landing, dan halaman
 * embed: warna disimpan di sini supaya widget tidak perlu tahu apa pun selain
 * key tema yang tersimpan di `chatbot_settings.widget_theme`.
 *
 * `lottie` memakai animasi publik LottieFiles (json) — jangan menyalin berkasnya,
 * cukup URL-nya agar tetap ringan.
 */

export interface WidgetTheme {
  key: string;
  label: string;
  description: string;
  /** Warna aksen utama (tombol kirim, bubble pengguna, status). */
  accent: string;
  /** Aksen lebih gelap untuk hover/gradien. */
  accentDark: string;
  /** Latar lembut untuk chip/avatar. */
  accentLight: string;
  /** Latar sangat lembut untuk hover. */
  accentSubtle: string;
  /** Warna emas/pendukung untuk ornamen tema. */
  gold: string;
  /** Gradien header panel launcher. */
  headerGradient: string;
  /** Animasi Lottie untuk ikon header/tombol (null untuk tema bawaan). */
  lottie: string | null;
  /**
   * Animasi layar sambutan (area percakapan masih kosong).
   * `null` = pakai `lottie`; tema klasik memakai animasi netral sendiri.
   */
  welcomeLottie?: string | null;
}

export const WIDGET_THEMES: WidgetTheme[] = [
  {
    key: 'classic',
    label: 'Klasik KHB',
    description: 'Hijau khas Komunitas Halal Bandung, tanpa animasi.',
    accent: '#16a34a',
    accentDark: '#15803d',
    accentLight: '#dcfce7',
    accentSubtle: '#f0fdf4',
    gold: '#16a34a',
    headerGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 70%)',
    lottie: null,
    welcomeLottie: 'https://assets-v2.lottiefiles.com/a/4c2ff152-1185-11ee-ad2f-a72c8442e662/l5V09au4Sw.json',
  },
  {
    key: 'ramadan',
    label: 'Ramadan',
    description: 'Hijau tua dan emas dengan bulan sabit serta lentera.',
    accent: '#0f766e',
    accentDark: '#115e59',
    accentLight: '#ccfbf1',
    accentSubtle: '#f0fdfa',
    gold: '#d4a017',
    headerGradient: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
    lottie: 'https://assets-v2.lottiefiles.com/a/638d47d4-f1ed-11ee-aba0-5fdbb6f8dc9b/rXTouz7LEC.json',
  },
  {
    key: 'idul_fitri',
    label: 'Idul Fitri',
    description: 'Hijau zamrud dan emas dengan ketupat.',
    accent: '#047857',
    accentDark: '#065f46',
    accentLight: '#d1fae5',
    accentSubtle: '#ecfdf5',
    gold: '#d4a017',
    headerGradient: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
    lottie: 'https://assets-v2.lottiefiles.com/a/cdf1d1a6-116c-11ee-95f6-3b72b4ea4f82/MEFMMk9aSJ.json',
  },
  {
    key: 'maulid',
    label: 'Maulid Nabi',
    description: 'Teal dan amber dengan siluet masjid.',
    accent: '#0d7a6f',
    accentDark: '#0b5f56',
    accentLight: '#d6f5f1',
    accentSubtle: '#f0fcfa',
    gold: '#c2872b',
    headerGradient: 'linear-gradient(135deg, #0d7a6f 0%, #0b4f47 100%)',
    lottie: 'https://assets-v2.lottiefiles.com/a/d788a264-1188-11ee-870a-d761e719f38a/A0bDVde1V3.json',
  },
  {
    key: 'kemerdekaan',
    label: '17 Agustus',
    description: 'Merah putih dengan bendera dan angka 17.',
    accent: '#b91c1c',
    accentDark: '#991b1b',
    accentLight: '#fee2e2',
    accentSubtle: '#fef2f2',
    gold: '#dc2626',
    headerGradient: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
    lottie: 'https://assets-v2.lottiefiles.com/a/a604cb50-117e-11ee-bb28-73da60609ab4/DoVXIqpkaA.json',
  },
  {
    key: 'tahun_baru',
    label: 'Tahun Baru',
    description: 'Indigo dan emas dengan konfeti perayaan.',
    accent: '#4338ca',
    accentDark: '#3730a3',
    accentLight: '#e0e7ff',
    accentSubtle: '#eef2ff',
    gold: '#d4a017',
    headerGradient: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    lottie: 'https://assets-v2.lottiefiles.com/a/093e526a-9424-4371-a35e-b3558ac57424/OAHxNuU4Si.json',
  },
];

export const DEFAULT_WIDGET_THEME = 'classic';

export function resolveWidgetTheme(key?: string | null): WidgetTheme {
  return (
    WIDGET_THEMES.find((theme) => theme.key === key) ??
    WIDGET_THEMES.find((theme) => theme.key === DEFAULT_WIDGET_THEME)!
  );
}

export function isWidgetThemeKey(key: string): boolean {
  return WIDGET_THEMES.some((theme) => theme.key === key);
}
