/**
 * Kumpulan ikon SVG inline untuk panel admin.
 *
 * Semua ikon memakai `currentColor` dan viewBox 24 agar bisa diwarnai lewat
 * CSS (`.m-stat-icon`, `.m-notif-icon`, dst.) tanpa dependensi tambahan.
 * Ukuran diatur oleh CSS induknya.
 */

type IconProps = { className?: string };

const base = (children: React.ReactNode, props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={props.className}
  >
    {children}
  </svg>
);

export const IconBox = (p: IconProps) =>
  base(<><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>, p);

export const IconCheckCircle = (p: IconProps) =>
  base(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>, p);

export const IconClock = (p: IconProps) =>
  base(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 1.8" /></>, p);

export const IconAlert = (p: IconProps) =>
  base(<><path d="M12 3.5 21 19.5H3L12 3.5Z" /><path d="M12 9.5v4" /><path d="M12 16.6h.01" /></>, p);

export const IconSearch = (p: IconProps) =>
  base(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>, p);

export const IconEdit = (p: IconProps) =>
  base(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>, p);

export const IconTrash = (p: IconProps) =>
  base(<><path d="M3.5 6.5h17" /><path d="M8.5 6.5V4.8A1.3 1.3 0 0 1 9.8 3.5h4.4a1.3 1.3 0 0 1 1.3 1.3v1.7" /><path d="M6 6.5 7 19a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4l1-12.5" /><path d="M10.5 10.5v6M13.5 10.5v6" /></>, p);

export const IconPlus = (p: IconProps) =>
  base(<><path d="M12 5v14M5 12h14" /></>, p);

export const IconArrowRight = (p: IconProps) =>
  base(<><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>, p);

export const IconRefresh = (p: IconProps) =>
  base(<><path d="M20 11a8 8 0 0 0-13.6-4.6L3 9.5" /><path d="M3 4.5v5h5" /><path d="M4 13a8 8 0 0 0 13.6 4.6L21 14.5" /><path d="M21 19.5v-5h-5" /></>, p);

export const IconChat = (p: IconProps) =>
  base(<><path d="M20.5 11.5a7.7 7.7 0 0 1-8.3 7.7 8.6 8.6 0 0 1-3.1-.8L4 20l1.6-4.7a7.7 7.7 0 0 1-.9-3.6 7.7 7.7 0 0 1 7.7-7.7 7.7 7.7 0 0 1 8.1 7.5Z" /></>, p);

export const IconDocument = (p: IconProps) =>
  base(<><path d="M14 3.5H7a1.8 1.8 0 0 0-1.8 1.8v13.4A1.8 1.8 0 0 0 7 20.5h10a1.8 1.8 0 0 0 1.8-1.8V8.3L14 3.5Z" /><path d="M14 3.5v4.8h4.8" /><path d="M8.8 13h6.4M8.8 16.4h4.4" /></>, p);

export const IconSettings = (p: IconProps) =>
  base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></>, p);

export const IconLink = (p: IconProps) =>
  base(<><path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 6.3" /><path d="M14 10.5a4 4 0 0 0-5.7 0L5.5 13.3a4 4 0 0 0 5.7 5.7l1.3-1.3" /></>, p);

export const IconPlug = (p: IconProps) =>
  base(<><path d="M9 3v5M15 3v5" /><path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8Z" /><path d="M12 17v4" /></>, p);

export const IconSparkles = (p: IconProps) =>
  base(<><path d="M12 3.5 13.8 9l5.5 1.8L13.8 12.6 12 18.1 10.2 12.6 4.7 10.8 10.2 9 12 3.5Z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></>, p);

export const IconRocket = (p: IconProps) =>
  base(<><path d="M13.5 3.5c3.5 1 6.5 4 7.5 7.5-2.5 2.5-5 4-8 4.5l-3.5-3.5c.5-3 2-5.5 4-8.5Z" /><path d="M9.5 12 5 11l1.5-3 3.5.5" /><path d="M12 14.5l1 4.5 3-1.5-.5-3.5" /><circle cx="15.5" cy="8.5" r="1.4" /></>, p);

export const IconBell = (p: IconProps) =>
  base(<><path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></>, p);

export const IconCheck = (p: IconProps) =>
  base(<path d="m5 12.5 4.5 4.5L19 7.5" />, p);

export const IconCopy = (p: IconProps) =>
  base(<><rect x="8.5" y="8.5" width="12" height="12" rx="2" /><path d="M15.5 5.5v-1a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1" /></>, p);

export const IconSend = (p: IconProps) =>
  base(<><path d="M21 3 10.5 13.5" /><path d="M21 3l-6.5 18-4-8.5L2 8.5 21 3Z" /></>, p);

export const IconShield = (p: IconProps) =>
  base(<><path d="M12 3.5 20 6v6c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V6l8-2.5Z" /><path d="m8.8 12 2.3 2.3 4.1-4.6" /></>, p);

export const IconExternal = (p: IconProps) =>
  base(<><path d="M14 4.5h5.5V10" /><path d="M19 5 11 13" /><path d="M18.5 14.5v4a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h4" /></>, p);
