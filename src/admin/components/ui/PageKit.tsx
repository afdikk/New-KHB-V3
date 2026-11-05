import type { ReactNode } from 'react';

/* ── Header halaman ── */
interface PageHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHead({ eyebrow, title, subtitle, children }: PageHeadProps) {
  return (
    <div className="page-title-row">
      <div>
        {eyebrow ? (
          <div className="eyebrow">
            <span className="eyebrow-dot"></span> {eyebrow}
          </div>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="subheading">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

/* ── Panel ── */
interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Panel({ title, subtitle, actions, children, className = '', padding = true }: PanelProps) {
  return (
    <section className={`panel ${className}`.trim()} style={padding ? undefined : { overflow: 'hidden' }}>
      {title || actions ? (
        <div className={`panel-heading panel-head${padding ? '' : ' flush'}`}>
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {padding ? <div className="panel-body">{children}</div> : children}
    </section>
  );
}

/* ── Statistik (stat-card asli) ── */
type StatTone = 'green' | 'blue' | 'orange' | 'purple';

interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  tone?: StatTone;
  foot?: ReactNode;
}

export function Stat({ label, value, unit, icon, tone = 'green', foot }: StatProps) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        {icon ? <span className={`stat-icon ${tone}`}>{icon}</span> : null}
      </div>
      <div className="stat-value">
        {value}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
      {foot ? <div className="stat-foot">{foot}</div> : null}
    </article>
  );
}

export function StatsGrid({ children }: { children: ReactNode }) {
  return <div className="stats-grid">{children}</div>;
}

/* ── Field form (settings-field asli) ── */
interface FieldProps {
  label?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="settings-field">
      {label ? <label>{label}</label> : null}
      {children}
      {hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
}

/* ── Badge ── */
type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'violet';

export function Badge({ tone = 'green', dot = false, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`badge-pill badge-${tone}`}>
      {dot ? <i></i> : null}
      {children}
    </span>
  );
}

export function Empty({ text = 'Belum ada data.' }: { text?: string }) {
  return <div className="empty-state">{text}</div>;
}

/* ── Toggle (toggle-switch asli) ── */
interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  desc?: string;
}

export function Toggle({ checked, onChange, label, desc }: ToggleProps) {
  return (
    <div className="settings-toggle-item">
      <div>
        <strong>{label}</strong>
        {desc ? <small>{desc}</small> : null}
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={label} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

/* ── Ikon SVG (mengikuti gaya ikon desain lama) ── */
export const Icon = {
  plus: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  download: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M10 3v10M6 9l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 15h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  edit: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M13 3l4 4-9 9H4v-4L13 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
  trash: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  clock: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  doc: (
    <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
  user: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  chat: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
  bolt: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
  link: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M7 8a4 4 0 015.7-.4l2 2a4 4 0 01-5.6 5.6l-1.1-1.1M9 12a4 4 0 01-5.7.4l-2-2a4 4 0 015.6-5.6l1.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.5 1.5M14 14l1.5 1.5M4.5 15.5L6 14M14 6l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  arrow: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  chart: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M4 16V8M10 16V4M16 16v-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  shield: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M10 2l7 3v6c0 4.8-3.2 7.6-7 9-3.8-1.4-7-4.2-7-9V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 10l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  store: (
    <svg viewBox="0 0 20 20" fill="none"><path d="M3 7l1.5-4h11L17 7M3 7h14v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 17v-4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
};
