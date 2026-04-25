'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MediaClipMeta } from '@/lib/site-media';
import { MEDIA_CLIPS } from '@/lib/site-media';
import type { CmsIconName } from '@/lib/cms/icon-map';
import { cmsIconNames, renderCmsIcon } from '@/lib/cms/icon-map';
import styles from './fields.module.css';

function RequiredAsterisk() {
  return (
    <abbr className={styles.requiredAsterisk} title="Required">
      *
    </abbr>
  );
}

export function TextField({
  label,
  value,
  onChange,
  required,
  emphasizeRequired = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Publish validation treats this field as required. */
  required?: boolean;
  /** When false with `required`, shows only the asterisk (no tinted shell). */
  emphasizeRequired?: boolean;
}) {
  const shell = Boolean(required && emphasizeRequired);
  return (
    <label className={`${styles.label} ${shell ? styles.labelRequiredShell : ''}`}>
      {required ? (
        <span className={styles.labelHeading}>
          <span>{label}</span>
          <RequiredAsterisk />
        </span>
      ) : (
        <span>{label}</span>
      )}
      <input className={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 6,
  required,
  emphasizeRequired = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  emphasizeRequired?: boolean;
}) {
  const shell = Boolean(required && emphasizeRequired);
  return (
    <label className={`${styles.label} ${shell ? styles.labelRequiredShell : ''}`}>
      {required ? (
        <span className={styles.labelHeading}>
          <span>{label}</span>
          <RequiredAsterisk />
        </span>
      ) : (
        <span>{label}</span>
      )}
      <textarea className={styles.textarea} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  emphasizeRequired = true,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  required?: boolean;
  emphasizeRequired?: boolean;
}) {
  const shell = Boolean(required && emphasizeRequired);
  return (
    <label className={`${styles.label} ${shell ? styles.labelRequiredShell : ''}`}>
      {required ? (
        <span className={styles.labelHeading}>
          <span>{label}</span>
          <RequiredAsterisk />
        </span>
      ) : (
        <span>{label}</span>
      )}
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
  required,
  emphasizeRequired = true,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  emphasizeRequired?: boolean;
}) {
  const shell = Boolean(required && emphasizeRequired);
  return (
    <label className={`${styles.label} ${shell ? styles.labelRequiredShell : ''}`}>
      {required ? (
        <span className={styles.labelHeading}>
          <span>{label}</span>
          <RequiredAsterisk />
        </span>
      ) : (
        <span>{label}</span>
      )}
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
  required,
}: {
  label: string;
  value: LinkValue;
  onChange: (next: LinkValue) => void;
  /** Label and URL are both required for publish when true. */
  required?: boolean;
}) {
  return (
    <fieldset
      className={`${styles.label} ${required ? styles.labelRequiredShell : ''}`}
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      <legend style={{ marginBottom: 8 }}>
        <span className={styles.fieldsetLegendRow}>
          <span>{label}</span>
          {required ? <RequiredAsterisk /> : null}
        </span>
      </legend>
      <div className={styles.fieldGrid2}>
        <TextField
          label="Label"
          required={required}
          emphasizeRequired={false}
          value={value.label}
          onChange={(lbl) => onChange({ ...value, label: lbl })}
        />
        <TextField
          label="URL / path"
          required={required}
          emphasizeRequired={false}
          value={value.href}
          onChange={(href) => onChange({ ...value, href })}
        />
      </div>
    </fieldset>
  );
}

export function CardLinkFields({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: LinkValue & { variant?: 'primary' | 'ghost' };
  onChange: (next: LinkValue & { variant?: 'primary' | 'ghost' }) => void;
  /** When true, button label is required for publish (URL may still be optional per block). */
  required?: boolean;
}) {
  const variant = value.variant ?? 'primary';
  return (
    <fieldset
      className={`${styles.label} ${required ? styles.labelRequiredShell : ''}`}
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      <legend style={{ marginBottom: 8 }}>
        <span className={styles.fieldsetLegendRow}>
          <span>{label}</span>
          {required ? <RequiredAsterisk /> : null}
        </span>
      </legend>
      <div className={styles.fieldGrid2}>
        <TextField
          label="Label"
          required={required}
          emphasizeRequired={false}
          value={value.label}
          onChange={(lbl) => onChange({ ...value, label: lbl })}
        />
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
type MediaAssetOption = { id: string; url: string; mimeType: string | null };

function mediaKind(mimeType: string | null, url: string): 'video' | 'image' | 'other' {
  const mime = mimeType?.toLowerCase() ?? '';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  if (/\.(mp4|webm|mov)$/i.test(url)) return 'video';
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(url)) return 'image';
  return 'other';
}

const emptyMediaClip: MediaClipMeta = { src: '', title: '', description: '' };

export function MediaClipFields({
  label,
  value,
  onChange,
  optional = false,
  required = false,
}: {
  label: string;
  value: MediaClipMeta;
  onChange: (next: MediaClipMeta) => void;
  /** When true, first preset option clears media (no clip). */
  optional?: boolean;
  /** When true, main clip URL is required for publish; field group is highlighted. */
  required?: boolean;
}) {
  const matchedKey = mediaClipKeys.find(
    (k) =>
      MEDIA_CLIPS[k].src === value.src &&
      MEDIA_CLIPS[k].poster === value.poster &&
      MEDIA_CLIPS[k].title === value.title &&
      MEDIA_CLIPS[k].description === value.description,
  );
  const preset = matchedKey ?? '';
  const [assetOptions, setAssetOptions] = useState<MediaAssetOption[]>([]);
  const [assetError, setAssetError] = useState<string | null>(null);
  const srcKind = mediaKind(null, value.src);
  const sourceOptions = assetOptions.filter((row) => {
    const kind = mediaKind(row.mimeType, row.url);
    return kind === 'video' || kind === 'image';
  });
  const imageOptions = assetOptions.filter((row) => mediaKind(row.mimeType, row.url) === 'image');

  useEffect(() => {
    let mounted = true;
    async function loadAssets() {
      try {
        const res = await fetch('/api/admin/media?per=100');
        if (!res.ok) throw new Error('Failed to fetch media assets');
        const data = (await res.json()) as { assets?: MediaAssetOption[] };
        if (!mounted) return;
        setAssetOptions(Array.isArray(data.assets) ? data.assets : []);
        setAssetError(null);
      } catch {
        if (!mounted) return;
        setAssetError('Media library unavailable');
      }
    }
    void loadAssets();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <fieldset
      className={`${styles.label} ${required ? styles.labelRequiredShell : ''}`}
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      <legend style={{ marginBottom: 8 }}>
        <span className={styles.fieldsetLegendRow}>
          <span>{label}</span>
          {required ? <RequiredAsterisk /> : null}
        </span>
      </legend>
      <label className={styles.label}>
        <span>Preset clip</span>
        <select
          className={styles.select}
          value={preset}
          onChange={(event) => {
            const key = event.target.value as keyof typeof MEDIA_CLIPS | '';
            if (!key) {
              if (optional) onChange({ ...emptyMediaClip });
              return;
            }
            onChange({ ...MEDIA_CLIPS[key] });
          }}
        >
          <option value="">{optional ? '— No media —' : '— Custom fields below —'}</option>
          {mediaClipKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.fieldGrid2} style={{ marginTop: 12 }}>
        <TextField
          label="Media src"
          required={required}
          emphasizeRequired={!required}
          value={value.src}
          onChange={(src) => onChange({ ...value, src })}
        />
        <label className={styles.label}>
          <span>From library (media)</span>
          <select
            className={styles.select}
            value=""
            onChange={(event) => {
              const url = event.target.value;
              if (!url) return;
              onChange({ ...value, src: url });
              event.target.value = '';
            }}
          >
            <option value="">{sourceOptions.length ? 'Select an image or video asset' : 'No media assets yet'}</option>
            {sourceOptions.map((asset) => (
              <option key={asset.id} value={asset.url}>
                {asset.url}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="Poster"
          value={value.poster ?? ''}
          onChange={(poster) =>
            onChange({ ...value, ...(poster.trim() === '' ? { poster: undefined } : { poster }) })
          }
        />
        <label className={styles.label}>
          <span>From library (poster)</span>
          <select
            className={styles.select}
            value=""
            onChange={(event) => {
              const url = event.target.value;
              if (!url) return;
              onChange({ ...value, poster: url });
              event.target.value = '';
            }}
          >
            <option value="">{imageOptions.length ? 'Select an image asset' : 'No image assets yet'}</option>
            {imageOptions.map((asset) => (
              <option key={asset.id} value={asset.url}>
                {asset.url}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Title" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextField label="Description" value={value.description} onChange={(description) => onChange({ ...value, description })} />
      </div>
      <p className={styles.label}>Detected source type: {srcKind}</p>
      {assetError ? <p className={styles.label}>{assetError}</p> : null}
    </fieldset>
  );
}

export function IconSelectField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: CmsIconName;
  onChange: (value: CmsIconName) => void;
  required?: boolean;
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
    <div ref={rootRef} className={`${styles.iconSelectRoot} ${required ? styles.iconSelectRootRequired : ''}`}>
      <span className={required ? styles.iconSelectLabelRow : styles.iconSelectLabel}>
        <span>{label}</span>
        {required ? <RequiredAsterisk /> : null}
      </span>
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
