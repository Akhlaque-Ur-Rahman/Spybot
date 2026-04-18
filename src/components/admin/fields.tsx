'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MediaClipMeta } from '@/lib/site-media';
import { MEDIA_CLIPS } from '@/lib/site-media';
import type { CmsIconName } from '@/lib/cms/icon-map';
import { cmsIconNames, renderCmsIcon } from '@/lib/cms/icon-map';
import styles from './fields.module.css';

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.label}>
      <span>{label}</span>
      <input className={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className={styles.label}>
      <span>{label}</span>
      <textarea className={styles.textarea} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className={styles.label}>
      <span>{label}</span>
      <select className={styles.select} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className={styles.label}>
      <span>{label}</span>
      <input
        className={styles.number}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export type LinkValue = { label: string; href: string };

export function LinkFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LinkValue;
  onChange: (next: LinkValue) => void;
}) {
  return (
    <fieldset className={styles.label} style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ marginBottom: 8 }}>{label}</legend>
      <div className={styles.fieldGrid2}>
        <label className={styles.label}>
          <span>Label</span>
          <input
            className={styles.input}
            value={value.label}
            onChange={(event) => onChange({ ...value, label: event.target.value })}
          />
        </label>
        <label className={styles.label}>
          <span>URL / path</span>
          <input
            className={styles.input}
            value={value.href}
            onChange={(event) => onChange({ ...value, href: event.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function CardLinkFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LinkValue & { variant?: 'primary' | 'ghost' };
  onChange: (next: LinkValue & { variant?: 'primary' | 'ghost' }) => void;
}) {
  const variant = value.variant ?? 'primary';
  return (
    <fieldset className={styles.label} style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ marginBottom: 8 }}>{label}</legend>
      <div className={styles.fieldGrid2}>
        <TextField label="Label" value={value.label} onChange={(label) => onChange({ ...value, label })} />
        <TextField label="URL / path" value={value.href} onChange={(href) => onChange({ ...value, href })} />
        <SelectField
          label="Variant"
          value={variant}
          onChange={(v) => onChange({ ...value, variant: v })}
          options={[
            { value: 'primary', label: 'Primary' },
            { value: 'ghost', label: 'Ghost' },
          ]}
        />
      </div>
    </fieldset>
  );
}

const mediaClipKeys = Object.keys(MEDIA_CLIPS) as Array<keyof typeof MEDIA_CLIPS>;

export function MediaClipFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MediaClipMeta;
  onChange: (next: MediaClipMeta) => void;
}) {
  const matchedKey = mediaClipKeys.find(
    (k) =>
      MEDIA_CLIPS[k].src === value.src &&
      MEDIA_CLIPS[k].poster === value.poster &&
      MEDIA_CLIPS[k].title === value.title &&
      MEDIA_CLIPS[k].description === value.description,
  );
  const preset = matchedKey ?? '';

  return (
    <fieldset className={styles.label} style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ marginBottom: 8 }}>{label}</legend>
      <label className={styles.label}>
        <span>Preset clip</span>
        <select
          className={styles.select}
          value={preset}
          onChange={(event) => {
            const key = event.target.value as keyof typeof MEDIA_CLIPS | '';
            if (!key) return;
            onChange({ ...MEDIA_CLIPS[key] });
          }}
        >
          <option value="">— Custom fields below —</option>
          {mediaClipKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.fieldGrid2} style={{ marginTop: 12 }}>
        <TextField label="Video src" value={value.src} onChange={(src) => onChange({ ...value, src })} />
        <TextField label="Poster" value={value.poster} onChange={(poster) => onChange({ ...value, poster })} />
        <TextField label="Title" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextField label="Description" value={value.description} onChange={(description) => onChange({ ...value, description })} />
      </div>
    </fieldset>
  );
}

export function IconSelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CmsIconName;
  onChange: (value: CmsIconName) => void;
}) {
  const safe = cmsIconNames.includes(value as CmsIconName) ? value : cmsIconNames[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={styles.iconSelectRoot}>
      <span className={styles.iconSelectLabel}>{label}</span>
      <button
        type="button"
        className={styles.iconSelectTrigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.iconSelectGlyph} aria-hidden>
          {renderCmsIcon(safe, 'small')}
        </span>
        <span className={styles.iconSelectName}>{safe}</span>
        <ChevronDown className={styles.iconSelectChevron} size={18} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div className={styles.iconSelectPanel} role="listbox">
          {cmsIconNames.map((name) => (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={name === safe}
              className={name === safe ? styles.iconSelectOptionActive : styles.iconSelectOption}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
            >
              <span className={styles.iconSelectGlyph} aria-hidden>
                {renderCmsIcon(name, 'small')}
              </span>
              <span className={styles.iconSelectOptionName}>{name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RepeatItemShell({
  title,
  index,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className={styles.repeatItem}>
      <div className={styles.repeatToolbar}>
        <strong>
          {title} #{index + 1}
        </strong>
        <button type="button" className={`${styles.btnSmall} ${styles.btnSmallDanger}`} onClick={onRemove}>
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
