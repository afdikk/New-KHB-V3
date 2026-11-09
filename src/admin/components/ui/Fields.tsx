/**
 * Kontrol formulir untuk halaman pengaturan.
 *
 * `Switch` menggantikan checkbox persegi bawaan browser — status aktif
 * ditandai posisi knop + warna trek, sehingga lebih mudah dibaca sekilas.
 * Semua kontrol memakai `currentColor`/token CSS dari `modern.css`.
 */

/**
 * Sakelar on/off berbasis tombol.
 *
 * Sengaja TIDAK memakai `<input type="checkbox">` di dalam `<label>`: saat
 * input menutupi seluruh area label, satu klik memicu toggle dari input DAN
 * dari label sekaligus sehingga nilainya kembali ke semula. Tombol dengan
 * `role="switch"` tidak punya perilaku bawaan itu dan tetap aksesibel
 * (fokus keyboard + Spasi/Enter).
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Label aksesibilitas; wajib karena tombol tidak punya teks. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`m-switch${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="m-switch-track" aria-hidden="true">
        <span className="m-switch-knob" />
      </span>
    </button>
  );
}

/** Baris pengaturan: judul + keterangan di kiri, kontrol di kanan. */
export function SettingRow({
  title,
  desc,
  children,
  icon,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="m-setting-row">
      {icon ? <span className="m-setting-icon">{icon}</span> : null}
      <div className="m-setting-copy">
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
      <div className="m-setting-control">{children}</div>
    </div>
  );
}

/**
 * Slider dengan gelembung nilai.
 *
 * Nilai ditampilkan dua kali: di label (angka besar) dan di ujung trek sebagai
 * posisi relatif, supaya pengguna tahu di mana titiknya tanpa menebak.
 */
export function Slider({
  id,
  value,
  min = 0,
  max = 1,
  step = 0.1,
  onChange,
  hint,
}: {
  id: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  hint?: string;
}) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="m-slider">
      <div className="m-slider-head">
        <label htmlFor={id}>Kreativitas jawaban umum</label>
        <span className="m-slider-value">{value.toFixed(1)}</span>
      </div>
      <div className="m-slider-track-wrap">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{ ['--m-fill' as string]: `${percent}%` }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
      <div className="m-slider-scale" aria-hidden="true">
        <span>Faktual</span>
        <span>Seimbang</span>
        <span>Bebas</span>
      </div>
      {hint ? <p className="m-slider-hint">{hint}</p> : null}
    </div>
  );
}

/** Field teks dengan label dan keterangan. */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
  multiline,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="m-field">
      <div className="m-field-head">
        <label htmlFor={id}>{label}</label>
        {maxLength ? <span className="m-field-count">{value.length}/{maxLength}</span> : null}
      </div>
      {multiline ? (
        <textarea
          id={id}
          className="m-input m-textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className="m-input"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint ? <p className="m-field-hint">{hint}</p> : null}
    </div>
  );
}

/** Select dengan label dan keterangan. */
export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <div className="m-field">
      <label htmlFor={id}>{label}</label>
      <div className="m-select-wrap">
        <select id={id} className="m-select" value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {hint ? <p className="m-field-hint">{hint}</p> : null}
    </div>
  );
}
