import type { ComponentChildren } from 'preact';

export function Seg<T extends string>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div class="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button type="button" key={v} aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Chips<T extends string>({ options, selected, onToggle, label }: { options: [T, string][]; selected: T[]; onToggle: (v: T) => void; label: string }) {
  return (
    <div class="chips" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button type="button" key={v} class="chip" aria-pressed={selected.includes(v)} onClick={() => onToggle(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function NumberField({ label, value, unit, min, max, onChange }: { label: string; value: number; unit?: string; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label class="num">
      <span>{label}</span>
      <div>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ''}
          onInput={(e) => onChange(parseInt((e.target as HTMLInputElement).value, 10))}
        />
        {unit && <small>{unit}</small>}
      </div>
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" class="toggle-row row" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      {label}
      <span class="switch" />
    </button>
  );
}

export function Sheet({ title, text, children, onClose }: { title: string; text?: string; children: ComponentChildren; onClose: () => void }) {
  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {children}
      </div>
    </div>
  );
}
