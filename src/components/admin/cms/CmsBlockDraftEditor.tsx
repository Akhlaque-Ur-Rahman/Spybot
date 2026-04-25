'use client';

import type { ReactNode } from 'react';
import RichTextField from '@/components/admin/RichTextField';
import {
  CardLinkFields,
  IconSelectField,
  LinkFields,
  MediaClipFields,
  RepeatItemShell,
  SelectField,
  TextAreaField,
  TextField,
  type LinkValue,
} from '@/components/admin/fields';
import type { CmsIconName } from '@/lib/cms/icon-map';
import { cmsIconNames } from '@/lib/cms/icon-map';
import type { MediaClipMeta } from '@/lib/site-media';
import { MEDIA_CLIPS } from '@/lib/site-media';
import { SHOWCASE_ICON_KEYS, type ShowcaseIconKey } from '@/lib/solution-showcase-data';
import styles from '@/components/admin/fields.module.css';
import { CMS_BLOCK_CONTRACTS } from '@/lib/cms/block-contracts';

type Props = {
  blockType: string;
  value: unknown;
  onChange: (next: unknown) => void;
};

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function link(v: unknown): LinkValue {
  const o = v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  return { label: str(o.label), href: str(o.href) };
}

function cardLink(v: unknown): LinkValue & { variant?: 'primary' | 'ghost' } {
  const o = v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const variant = o.variant === 'ghost' || o.variant === 'primary' ? o.variant : undefined;
  return { label: str(o.label), href: str(o.href), variant };
}

function mediaMeta(v: unknown): MediaClipMeta {
  const o = v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const out: MediaClipMeta = {
    src: str(o.src, MEDIA_CLIPS.homeHero.src),
    title: str(o.title, MEDIA_CLIPS.homeHero.title),
    description: str(o.description, MEDIA_CLIPS.homeHero.description),
  };
  if (typeof o.poster === 'string') out.poster = o.poster;
  return out;
}

function iconName(v: unknown): CmsIconName {
  const s = str(v, 'globe');
  return (cmsIconNames as readonly string[]).includes(s) ? (s as CmsIconName) : 'globe';
}

const challengeTones = ['danger', 'warning', 'info', 'accent', 'success'] as const;
const benefitHighlights = ['primary', 'teal'] as const;
const mediaObjectFitOptions = ['cover', 'contain'] as const;

function EditorHero({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });

  const stats = Array.isArray(o.stats) ? o.stats : [];
  const trustItems = Array.isArray(o.trustItems) ? o.trustItems.map((x) => str(x)) : [];
  const mediaObjectFit =
    mediaObjectFitOptions.includes(o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      ? (o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      : 'cover';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Badge" value={str(o.badge)} onChange={(badge) => patch({ badge })} />
      <TextField label="Headline" value={str(o.headline)} onChange={(headline) => patch({ headline })} />
      <TextField label="Headline gradient" value={str(o.headlineGradient)} onChange={(headlineGradient) => patch({ headlineGradient })} />
      <RichTextField label="Subheadline" value={o.subheadline} onChange={(subheadline) => patch({ subheadline })} />
      <LinkFields label="Primary CTA" value={link(o.primaryCta)} onChange={(primaryCta) => patch({ primaryCta })} />
      <LinkFields label="Secondary CTA" value={link(o.secondaryCta)} onChange={(secondaryCta) => patch({ secondaryCta })} />
      <MediaClipFields
        label="Background media (hero backdrop)"
        value={mediaMeta(o.backgroundMedia ?? MEDIA_CLIPS.heroBackdrop)}
        onChange={(backgroundMedia) => patch({ backgroundMedia })}
      />
      <MediaClipFields label="Right media" value={mediaMeta(o.media)} onChange={(media) => patch({ media })} />
      <TextField
        label="Right media aspect ratio (e.g. 16 / 10, 4 / 3)"
        value={str(o.mediaAspectRatio, '16 / 10')}
        onChange={(mediaAspectRatio) => patch({ mediaAspectRatio })}
      />
      <SelectField
        label="Right media fit"
        value={mediaObjectFit}
        options={mediaObjectFitOptions.map((fit) => ({ value: fit, label: fit }))}
        onChange={(fit) => patch({ mediaObjectFit: fit })}
      />
      <TextAreaField
        label="Trust items (one per line)"
        value={trustItems.join('\n')}
        onChange={(text) => patch({ trustItems: text.split('\n').map((s) => s.trim()).filter(Boolean) })}
        rows={4}
      />
      <div>
        <div className={styles.repeatToolbar}>
          <strong>Stats</strong>
          <button
            type="button"
            className={styles.btnSmall}
            onClick={() => patch({ stats: [...stats, { value: '0', label: 'Label' }] })}
          >
            Add stat
          </button>
        </div>
        {stats.map((t, i) => {
          const row = t && typeof t === 'object' && !Array.isArray(t) ? (t as Record<string, unknown>) : {};
          return (
            <RepeatItemShell key={i} title="Stat" index={i} onRemove={() => patch({ stats: stats.filter((_, j) => j !== i) })}>
              <div className={styles.fieldGrid2}>
                <TextField label="Value" value={str(row.value)} onChange={(value) => {
                  const next = [...stats];
                  next[i] = { ...row, value };
                  patch({ stats: next });
                }} />
                <TextField label="Label" value={str(row.label)} onChange={(label) => {
                  const next = [...stats];
                  next[i] = { ...row, label };
                  patch({ stats: next });
                }} />
              </div>
            </RepeatItemShell>
          );
        })}
      </div>
    </div>
  );
}

function EditorPageHeader({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  const mediaObjectFit =
    mediaObjectFitOptions.includes(o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      ? (o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      : 'cover';
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Eyebrow / label" value={str(o.label)} onChange={(label) => patch({ label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => patch({ title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => patch({ gradientText })} />
      <RichTextField
        label="Description"
        value={o.description}
        onChange={(description) => patch({ description })}
      />
      <LinkFields label="Primary CTA" value={link(o.primaryCta)} onChange={(primaryCta) => patch({ primaryCta })} />
      <LinkFields label="Secondary CTA" value={link(o.secondaryCta)} onChange={(secondaryCta) => patch({ secondaryCta })} />
      <MediaClipFields
        label="Background media (optional)"
        value={mediaMeta(o.backgroundMedia ?? MEDIA_CLIPS.heroBackdrop)}
        onChange={(backgroundMedia) => patch({ backgroundMedia })}
      />
      <MediaClipFields label="Right media (optional)" value={mediaMeta(o.media ?? MEDIA_CLIPS.homeHero)} onChange={(media) => patch({ media })} />
      <TextField
        label="Right media aspect ratio (e.g. 16 / 10, 4 / 3)"
        value={str(o.mediaAspectRatio, '16 / 10')}
        onChange={(mediaAspectRatio) => patch({ mediaAspectRatio })}
      />
      <SelectField
        label="Right media fit"
        value={mediaObjectFit}
        options={mediaObjectFitOptions.map((fit) => ({ value: fit, label: fit }))}
        onChange={(fit) => patch({ mediaObjectFit: fit })}
      />
    </div>
  );
}

function EditorFintechHero({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  const mediaObjectFit =
    mediaObjectFitOptions.includes(o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      ? (o.mediaObjectFit as (typeof mediaObjectFitOptions)[number])
      : 'contain';
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label" value={str(o.label)} onChange={(label) => patch({ label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => patch({ title })} />
      <RichTextField label="Description" value={o.description} onChange={(description) => patch({ description })} />
      <RichTextField
        label="Secondary description (optional)"
        value={o.secondaryDescription}
        onChange={(secondaryDescription) => patch({ secondaryDescription })}
      />
      <LinkFields label="Primary CTA" value={link(o.primaryCta)} onChange={(primaryCta) => patch({ primaryCta })} />
      <LinkFields label="Secondary CTA" value={link(o.secondaryCta)} onChange={(secondaryCta) => patch({ secondaryCta })} />
      <MediaClipFields
        label="Background media (hero backdrop)"
        value={mediaMeta(o.backgroundMedia ?? MEDIA_CLIPS.heroBackdrop)}
        onChange={(backgroundMedia) => patch({ backgroundMedia })}
      />
      <MediaClipFields
        label="Right media"
        value={mediaMeta(o.media ?? MEDIA_CLIPS.homeHero)}
        onChange={(media) => patch({ media })}
      />
      <TextField
        label="Right media aspect ratio (e.g. 16 / 10, 4 / 3)"
        value={str(o.mediaAspectRatio, '16 / 10')}
        onChange={(mediaAspectRatio) => patch({ mediaAspectRatio })}
      />
      <SelectField
        label="Right media fit"
        value={mediaObjectFit}
        options={mediaObjectFitOptions.map((fit) => ({ value: fit, label: fit }))}
        onChange={(fit) => patch({ mediaObjectFit: fit })}
      />
    </div>
  );
}

function EditorCoverageCarousel({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const raw = Array.isArray(o.items) ? o.items : [];
  const items = raw.map((x) =>
    typeof x === 'string'
      ? { title: x.trim(), desc: undefined, href: undefined }
      : x && typeof x === 'object' && !Array.isArray(x)
        ? (x as Record<string, unknown>)
        : { title: '', desc: undefined, href: undefined },
  );
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label (optional)" value={str(o.label)} onChange={(label) => onChange({ ...o, label })} />
      <div className={styles.repeatToolbar}>
        <strong>Items</strong>
        <button
          type="button"
          className={styles.btnSmall}
          onClick={() => patchItems([...items, { title: 'New item', desc: undefined, href: '' }])}
        >
          Add item
        </button>
      </div>
      {items.map((row, i) => {
        const r = row && typeof row === 'object' && !Array.isArray(row) ? (row as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Coverage item" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <TextField
              label="Title"
              value={str(r.title)}
              onChange={(title) => {
                const next = [...items];
                next[i] = { ...r, title };
                patchItems(next);
              }}
            />
            <RichTextField
              label="Description (optional)"
              compact
              value={r.desc}
              onChange={(desc) => {
                const next = [...items];
                next[i] = { ...r, desc };
                patchItems(next);
              }}
            />
            <TextField
              label="Page URL (optional)"
              value={str(r.href)}
              onChange={(href) => {
                const next = [...items];
                next[i] = { ...r, href };
                patchItems(next);
              }}
            />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorDirectoryGrid({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : [];
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Block id (optional)" value={str(o.id)} onChange={(id) => onChange({ ...o, id })} />
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <RichTextField label="Subheading" value={o.subheading} onChange={(subheading) => onChange({ ...o, subheading })} />
      <div className={styles.repeatToolbar}>
        <strong>Items</strong>
        <button
          type="button"
          className={styles.btnSmall}
          onClick={() => patchItems([...items, { title: 'Title', description: '', href: '/', badge: '' }])}
        >
          Add item
        </button>
      </div>
      {items.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Tile" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...items];
              next[i] = { ...row, title };
              patchItems(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.description}
              onChange={(description) => {
                const next = [...items];
                next[i] = { ...row, description };
                patchItems(next);
              }}
            />
            <TextField label="Href" value={str(row.href)} onChange={(href) => {
              const next = [...items];
              next[i] = { ...row, href };
              patchItems(next);
            }} />
            <TextField label="Badge (optional)" value={str(row.badge)} onChange={(badge) => {
              const next = [...items];
              next[i] = { ...row, badge };
              patchItems(next);
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorSliderSection({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : [];
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <TextField label="Aria label" value={str(o.ariaLabel)} onChange={(ariaLabel) => onChange({ ...o, ariaLabel })} />
      <div className={styles.repeatToolbar}>
        <strong>Slides</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchItems([...items, { title: '', desc: '', tag: '' }])}>
          Add slide
        </button>
      </div>
      {items.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Slide" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...items];
              next[i] = { ...row, title };
              patchItems(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...items];
                next[i] = { ...row, desc };
                patchItems(next);
              }}
            />
            <TextField label="Tag (optional)" value={str(row.tag)} onChange={(tag) => {
              const next = [...items];
              next[i] = { ...row, tag };
              patchItems(next);
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorUtilityCtaBand({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Title" value={str(o.title)} onChange={(title) => patch({ title })} />
      <RichTextField label="Description" value={o.description} onChange={(description) => patch({ description })} />
      <CardLinkFields label="Primary button" value={cardLink(o.primary)} onChange={(primary) => patch({ primary })} />
      <CardLinkFields label="Secondary button (optional)" value={cardLink(o.secondary ?? { label: '', href: '', variant: 'ghost' })} onChange={(secondary) => patch({ secondary })} />
    </div>
  );
}

function EditorFaqAccordion({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const groups = Array.isArray(o.groups) ? o.groups : [];
  const patchGroups = (next: unknown[]) => onChange({ ...o, groups: next });

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className={styles.repeatToolbar}>
        <strong>FAQ groups</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchGroups([...groups, { title: 'Group', items: [{ q: '', a: '' }] }])}>
          Add group
        </button>
      </div>
      {groups.map((g, gi) => {
        const group = g && typeof g === 'object' && !Array.isArray(g) ? (g as Record<string, unknown>) : {};
        const items = Array.isArray(group.items) ? group.items : [];
        return (
          <RepeatItemShell key={gi} title="Group" index={gi} onRemove={() => patchGroups(groups.filter((_, j) => j !== gi))}>
            <TextField label="Group title" value={str(group.title)} onChange={(title) => {
              const next = [...groups];
              next[gi] = { ...group, title };
              patchGroups(next);
            }} />
            <div className={styles.repeatToolbar}>
              <span>Questions</span>
              <button
                type="button"
                className={styles.btnSmall}
                onClick={() => {
                  const next = [...groups];
                  next[gi] = { ...group, items: [...items, { q: '', a: '' }] };
                  patchGroups(next);
                }}
              >
                Add Q&amp;A
              </button>
            </div>
            {items.map((qa, qi) => {
              const row = qa && typeof qa === 'object' && !Array.isArray(qa) ? (qa as Record<string, unknown>) : {};
              return (
                <RepeatItemShell
                  key={qi}
                  title="Q&A"
                  index={qi}
                  onRemove={() => {
                    const next = [...groups];
                    next[gi] = { ...group, items: items.filter((_, j) => j !== qi) };
                    patchGroups(next);
                  }}
                >
                  <TextField label="Question" value={str(row.q)} onChange={(q) => {
                    const nextItems = [...items];
                    nextItems[qi] = { ...row, q };
                    const next = [...groups];
                    next[gi] = { ...group, items: nextItems };
                    patchGroups(next);
                  }} />
                  <RichTextField
                    label="Answer"
                    value={row.a}
                    compact
                    onChange={(a) => {
                      const nextItems = [...items];
                      nextItems[qi] = { ...row, a };
                      const next = [...groups];
                      next[gi] = { ...group, items: nextItems };
                      patchGroups(next);
                    }}
                  />
                </RepeatItemShell>
              );
            })}
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorSupportPathways({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const pathways = Array.isArray(o.pathways) ? o.pathways : [];
  const patchPath = (next: unknown[]) => onChange({ ...o, pathways: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <RichTextField label="Subheading" value={o.subheading} onChange={(subheading) => onChange({ ...o, subheading })} />
      <div className={styles.repeatToolbar}>
        <strong>Pathways</strong>
        <button
          type="button"
          className={styles.btnSmall}
          onClick={() =>
            patchPath([
              ...pathways,
              { icon: 'headphones', title: '', desc: '', action: { label: '', href: '' } },
            ])
          }
        >
          Add pathway
        </button>
      </div>
      {pathways.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Pathway" index={i} onRemove={() => patchPath(pathways.filter((_, j) => j !== i))}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...pathways];
              next[i] = { ...row, icon };
              patchPath(next);
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...pathways];
              next[i] = { ...row, title };
              patchPath(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...pathways];
                next[i] = { ...row, desc };
                patchPath(next);
              }}
            />
            <LinkFields label="Action link" value={link(row.action)} onChange={(action) => {
              const next = [...pathways];
              next[i] = { ...row, action };
              patchPath(next);
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorSupportSlaStrip({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const cards = Array.isArray(o.cards) ? o.cards : [];
  const patchCards = (next: unknown[]) => onChange({ ...o, cards: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <div className={styles.repeatToolbar}>
        <strong>Cards</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchCards([...cards, { kicker: '', value: '', note: '' }])}>
          Add card
        </button>
      </div>
      {cards.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Card" index={i} onRemove={() => patchCards(cards.filter((_, j) => j !== i))}>
            <TextField label="Kicker" value={str(row.kicker)} onChange={(kicker) => {
              const next = [...cards];
              next[i] = { ...row, kicker };
              patchCards(next);
            }} />
            <TextField label="Value" value={str(row.value)} onChange={(value) => {
              const next = [...cards];
              next[i] = { ...row, value };
              patchCards(next);
            }} />
            <TextField label="Note" value={str(row.note)} onChange={(note) => {
              const next = [...cards];
              next[i] = { ...row, note };
              patchCards(next);
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorResourceGrid({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const tiles = Array.isArray(o.tiles) ? o.tiles : [];
  const patchTiles = (next: unknown[]) => onChange({ ...o, tiles: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <div className={styles.repeatToolbar}>
        <strong>Tiles</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchTiles([...tiles, { title: '', desc: '', href: '/', tag: '' }])}>
          Add tile
        </button>
      </div>
      {tiles.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Tile" index={i} onRemove={() => patchTiles(tiles.filter((_, j) => j !== i))}>
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...tiles];
              next[i] = { ...row, title };
              patchTiles(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...tiles];
                next[i] = { ...row, desc };
                patchTiles(next);
              }}
            />
            <TextField label="Href" value={str(row.href)} onChange={(href) => {
              const next = [...tiles];
              next[i] = { ...row, href };
              patchTiles(next);
            }} />
            <TextField label="Tag" value={str(row.tag)} onChange={(tag) => {
              const next = [...tiles];
              next[i] = { ...row, tag };
              patchTiles(next);
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorContactHighlights({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : [];
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Heading" value={str(o.heading)} onChange={(heading) => onChange({ ...o, heading })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <div className={styles.repeatToolbar}>
        <strong>Highlights</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchItems([...items, { icon: 'mail', title: '', desc: '' }])}>
          Add highlight
        </button>
      </div>
      {items.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Item" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...items];
              next[i] = { ...row, icon };
              patchItems(next);
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...items];
              next[i] = { ...row, title };
              patchItems(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...items];
                next[i] = { ...row, desc };
                patchItems(next);
              }}
            />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorNamedItemsBenefits({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : [];
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label" value={str(o.label)} onChange={(label) => onChange({ ...o, label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => onChange({ ...o, title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <RichTextField label="Subtitle" value={o.subtitle} onChange={(subtitle) => onChange({ ...o, subtitle })} />
      <div className={styles.repeatToolbar}>
        <strong>Items</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchItems([...items, { icon: 'checkCircle2', title: '', desc: '', highlight: 'primary' }])}>
          Add item
        </button>
      </div>
      {items.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        const hl = benefitHighlights.includes(row.highlight as (typeof benefitHighlights)[number]) ? row.highlight : 'primary';
        return (
          <RepeatItemShell key={i} title="Benefit" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...items];
              next[i] = { ...row, icon };
              patchItems(next);
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...items];
              next[i] = { ...row, title };
              patchItems(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...items];
                next[i] = { ...row, desc };
                patchItems(next);
              }}
            />
            <SelectField
              label="Highlight"
              value={hl as (typeof benefitHighlights)[number]}
              options={benefitHighlights.map((h) => ({ value: h, label: h }))}
              onChange={(highlight) => {
                const next = [...items];
                next[i] = { ...row, highlight };
                patchItems(next);
              }}
            />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorChallenges({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : [];
  const patchItems = (next: unknown[]) => onChange({ ...o, items: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label" value={str(o.label)} onChange={(label) => onChange({ ...o, label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => onChange({ ...o, title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <RichTextField label="Subtitle" value={o.subtitle} onChange={(subtitle) => onChange({ ...o, subtitle })} />
      <div className={styles.repeatToolbar}>
        <strong>Challenges</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchItems([...items, { icon: 'shieldAlert', title: '', desc: '', tone: 'warning' }])}>
          Add item
        </button>
      </div>
      {items.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        const tone = challengeTones.includes(row.tone as (typeof challengeTones)[number]) ? row.tone : 'warning';
        return (
          <RepeatItemShell key={i} title="Challenge" index={i} onRemove={() => patchItems(items.filter((_, j) => j !== i))}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...items];
              next[i] = { ...row, icon };
              patchItems(next);
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...items];
              next[i] = { ...row, title };
              patchItems(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...items];
                next[i] = { ...row, desc };
                patchItems(next);
              }}
            />
            <SelectField
              label="Tone"
              value={tone as (typeof challengeTones)[number]}
              options={challengeTones.map((t) => ({ value: t, label: t }))}
              onChange={(t) => {
                const next = [...items];
                next[i] = { ...row, tone: t };
                patchItems(next);
              }}
            />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorLifecycle({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const steps = Array.isArray(o.steps) ? o.steps : [];
  const patchSteps = (next: unknown[]) => onChange({ ...o, steps: next });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label" value={str(o.label)} onChange={(label) => onChange({ ...o, label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => onChange({ ...o, title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => onChange({ ...o, gradientText })} />
      <RichTextField label="Subtitle" value={o.subtitle} onChange={(subtitle) => onChange({ ...o, subtitle })} />
      <div className={styles.repeatToolbar}>
        <strong>Steps</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patchSteps([...steps, { icon: 'search', title: '', desc: '', num: '01' }])}>
          Add step
        </button>
      </div>
      {steps.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Step" index={i} onRemove={() => patchSteps(steps.filter((_, j) => j !== i))}>
            <TextField label="Number" value={str(row.num)} onChange={(num) => {
              const next = [...steps];
              next[i] = { ...row, num };
              patchSteps(next);
            }} />
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...steps];
              next[i] = { ...row, icon };
              patchSteps(next);
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...steps];
              next[i] = { ...row, title };
              patchSteps(next);
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...steps];
                next[i] = { ...row, desc };
                patchSteps(next);
              }}
            />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorDecisionFlow({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const decisions = Array.isArray(o.decisions) ? o.decisions : [];
  const capabilities = Array.isArray(o.capabilities) ? o.capabilities : [];
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Label" value={str(o.label)} onChange={(label) => patch({ label })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => patch({ title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => patch({ gradientText })} />
      <RichTextField label="Subtitle" value={o.subtitle} onChange={(subtitle) => patch({ subtitle })} />
      <TextField label="Panel title" value={str(o.panelTitle)} onChange={(panelTitle) => patch({ panelTitle })} />
      <TextField label="Panel badge" value={str(o.panelBadge)} onChange={(panelBadge) => patch({ panelBadge })} />
      <div className={styles.repeatToolbar}>
        <strong>Decisions</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patch({ decisions: [...decisions, { question: '', yes: '', no: '' }] })}>
          Add decision
        </button>
      </div>
      {decisions.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Decision" index={i} onRemove={() => patch({ decisions: decisions.filter((_, j) => j !== i) })}>
            <TextField label="Question" value={str(row.question)} onChange={(question) => {
              const next = [...decisions];
              next[i] = { ...row, question };
              patch({ decisions: next });
            }} />
            <TextField label="Yes path" value={str(row.yes)} onChange={(yes) => {
              const next = [...decisions];
              next[i] = { ...row, yes };
              patch({ decisions: next });
            }} />
            <TextField label="No path" value={str(row.no)} onChange={(no) => {
              const next = [...decisions];
              next[i] = { ...row, no };
              patch({ decisions: next });
            }} />
          </RepeatItemShell>
        );
      })}
      <TextField label="Capabilities heading" value={str(o.capabilitiesHeading)} onChange={(capabilitiesHeading) => patch({ capabilitiesHeading })} />
      <div className={styles.repeatToolbar}>
        <strong>Capabilities</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patch({ capabilities: [...capabilities, { icon: 'blocks', title: '', desc: '' }] })}>
          Add capability
        </button>
      </div>
      {capabilities.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Capability" index={i} onRemove={() => patch({ capabilities: capabilities.filter((_, j) => j !== i) })}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...capabilities];
              next[i] = { ...row, icon };
              patch({ capabilities: next });
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...capabilities];
              next[i] = { ...row, title };
              patch({ capabilities: next });
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...capabilities];
                next[i] = { ...row, desc };
                patch({ capabilities: next });
              }}
            />
          </RepeatItemShell>
        );
      })}
      <TextField label="Note title" value={str(o.noteTitle)} onChange={(noteTitle) => patch({ noteTitle })} />
      <RichTextField label="Note text" value={o.noteText} onChange={(noteText) => patch({ noteText })} />
    </div>
  );
}

function showcaseIconValue(v: unknown): ShowcaseIconKey {
  const s = str(v, 'fileText');
  return SHOWCASE_ICON_KEYS.includes(s as ShowcaseIconKey) ? (s as ShowcaseIconKey) : 'fileText';
}

function EditorSolutionShowcase({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const patchRoot = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  const verticals = Array.isArray(o.verticals) ? o.verticals : [];
  const patchVerticals = (next: unknown[]) => patchRoot({ verticals: next });
  const iconOptions = SHOWCASE_ICON_KEYS.map((k) => ({ value: k, label: k }));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Title" value={str(o.title)} onChange={(title) => patchRoot({ title })} />
      <TextField
        label="Title gradient (optional)"
        value={str(o.titleGradient)}
        onChange={(titleGradient) => patchRoot({ titleGradient })}
      />
      <TextAreaField label="Subtitle" value={str(o.subtitle)} onChange={(subtitle) => patchRoot({ subtitle })} rows={3} />
      <LinkFields label="Primary CTA" value={link(o.primaryCta)} onChange={(primaryCta) => patchRoot({ primaryCta })} />
      <LinkFields label="Secondary CTA" value={link(o.secondaryCta)} onChange={(secondaryCta) => patchRoot({ secondaryCta })} />

      <div className={styles.repeatToolbar}>
        <strong>Tabs</strong>
        <button
          type="button"
          className={styles.btnSmall}
          onClick={() =>
            patchVerticals([
              ...verticals,
              {
                id: `tab_${Date.now()}`,
                label: 'New tab',
                panelTitle: '',
                panelDescription: '',
                cards: [{ icon: 'fileText', title: '', description: '' }],
              },
            ])
          }
        >
          Add tab
        </button>
      </div>

      {verticals.map((raw, vi) => {
        const vert = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        const cards = Array.isArray(vert.cards) ? vert.cards : [];
        const patchCards = (nextCards: unknown[]) => {
          const next = [...verticals];
          next[vi] = { ...vert, cards: nextCards };
          patchVerticals(next);
        };

        return (
          <RepeatItemShell
            key={vi}
            title={`Tab: ${str(vert.label) || str(vert.id) || String(vi + 1)}`}
            index={vi}
            onRemove={() => patchVerticals(verticals.filter((_, j) => j !== vi))}
          >
            <div className={styles.fieldGrid2}>
              <TextField
                label="Tab id"
                value={str(vert.id)}
                onChange={(id) => {
                  const next = [...verticals];
                  next[vi] = { ...vert, id };
                  patchVerticals(next);
                }}
              />
              <TextField
                label="Tab label"
                value={str(vert.label)}
                onChange={(label) => {
                  const next = [...verticals];
                  next[vi] = { ...vert, label };
                  patchVerticals(next);
                }}
              />
            </div>
            <TextField
              label="Panel title"
              value={str(vert.panelTitle)}
              onChange={(panelTitle) => {
                const next = [...verticals];
                next[vi] = { ...vert, panelTitle };
                patchVerticals(next);
              }}
            />
            <TextAreaField
              label="Panel description"
              value={str(vert.panelDescription)}
              onChange={(panelDescription) => {
                const next = [...verticals];
                next[vi] = { ...vert, panelDescription };
                patchVerticals(next);
              }}
              rows={2}
            />

            <div className={styles.repeatToolbar}>
              <span>Cards</span>
              <button
                type="button"
                className={styles.btnSmall}
                onClick={() => patchCards([...cards, { icon: 'fileText', title: '', description: '' }])}
              >
                Add card
              </button>
            </div>
            {cards.map((craw, ci) => {
              const card = craw && typeof craw === 'object' && !Array.isArray(craw) ? (craw as Record<string, unknown>) : {};
              return (
                <RepeatItemShell key={ci} title="Card" index={ci} onRemove={() => patchCards(cards.filter((_, j) => j !== ci))}>
                  <SelectField
                    label="Icon"
                    value={showcaseIconValue(card.icon)}
                    options={iconOptions}
                    onChange={(icon) => {
                      const nc = [...cards];
                      nc[ci] = { ...card, icon };
                      patchCards(nc);
                    }}
                  />
                  <TextField
                    label="Title"
                    value={str(card.title)}
                    onChange={(title) => {
                      const nc = [...cards];
                      nc[ci] = { ...card, title };
                      patchCards(nc);
                    }}
                  />
                  <TextAreaField
                    label="Description"
                    value={str(card.description)}
                    onChange={(description) => {
                      const nc = [...cards];
                      nc[ci] = { ...card, description };
                      patchCards(nc);
                    }}
                    rows={2}
                  />
                </RepeatItemShell>
              );
            })}
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

function EditorDemoSection({ value, onChange }: Props) {
  const o = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const valuePoints = Array.isArray(o.valuePoints) ? o.valuePoints : [];
  const formFields = Array.isArray(o.formFields) ? o.formFields : [];
  const patch = (p: Record<string, unknown>) => onChange({ ...o, ...p });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Section label" value={str(o.sectionLabel)} onChange={(sectionLabel) => patch({ sectionLabel })} />
      <TextField label="Title" value={str(o.title)} onChange={(title) => patch({ title })} />
      <TextField label="Gradient text" value={str(o.gradientText)} onChange={(gradientText) => patch({ gradientText })} />
      <RichTextField label="Subtitle" value={o.subtitle} onChange={(subtitle) => patch({ subtitle })} />
      <TextField label="Social proof rating" value={str(o.socialProofRating)} onChange={(socialProofRating) => patch({ socialProofRating })} />
      <RichTextField label="Social proof text" value={o.socialProofText} compact onChange={(socialProofText) => patch({ socialProofText })} />
      <RichTextField label="Social proof subtext" value={o.socialProofSubtext} compact onChange={(socialProofSubtext) => patch({ socialProofSubtext })} />
      <TextField label="Form title" value={str(o.formTitle)} onChange={(formTitle) => patch({ formTitle })} />
      <TextField label="Submit label" value={str(o.submitLabel)} onChange={(submitLabel) => patch({ submitLabel })} />
      <RichTextField label="Form note" value={o.formNote} onChange={(formNote) => patch({ formNote })} />
      <TextField label="Loading title" value={str(o.loadingTitle)} onChange={(loadingTitle) => patch({ loadingTitle })} />
      <TextField label="Success title" value={str(o.successTitle)} onChange={(successTitle) => patch({ successTitle })} />
      <RichTextField label="Success text" value={o.successText} onChange={(successText) => patch({ successText })} />
      <TextAreaField label="Success JSON (raw)" value={str(o.successJson)} onChange={(successJson) => patch({ successJson })} rows={3} />
      <LinkFields label="Success action" value={link(o.successAction)} onChange={(successAction) => patch({ successAction })} />
      <MediaClipFields label="Media" value={mediaMeta(o.media)} onChange={(media) => patch({ media })} />
      <div className={styles.repeatToolbar}>
        <strong>Value points</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patch({ valuePoints: [...valuePoints, { icon: 'zap', title: '', desc: '' }] })}>
          Add value point
        </button>
      </div>
      {valuePoints.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Value point" index={i} onRemove={() => patch({ valuePoints: valuePoints.filter((_, j) => j !== i) })}>
            <IconSelectField label="Icon" value={iconName(row.icon)} onChange={(icon) => {
              const next = [...valuePoints];
              next[i] = { ...row, icon };
              patch({ valuePoints: next });
            }} />
            <TextField label="Title" value={str(row.title)} onChange={(title) => {
              const next = [...valuePoints];
              next[i] = { ...row, title };
              patch({ valuePoints: next });
            }} />
            <RichTextField
              label="Description"
              compact
              value={row.desc}
              onChange={(desc) => {
                const next = [...valuePoints];
                next[i] = { ...row, desc };
                patch({ valuePoints: next });
              }}
            />
          </RepeatItemShell>
        );
      })}
      <div className={styles.repeatToolbar}>
        <strong>Form fields</strong>
        <button type="button" className={styles.btnSmall} onClick={() => patch({ formFields: [...formFields, { id: `f_${Date.now()}`, label: '', type: 'text', placeholder: '' }] })}>
          Add field
        </button>
      </div>
      {formFields.map((raw, i) => {
        const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
        return (
          <RepeatItemShell key={i} title="Field" index={i} onRemove={() => patch({ formFields: formFields.filter((_, j) => j !== i) })}>
            <TextField label="Id" value={str(row.id)} onChange={(id) => {
              const next = [...formFields];
              next[i] = { ...row, id };
              patch({ formFields: next });
            }} />
            <TextField label="Label" value={str(row.label)} onChange={(label) => {
              const next = [...formFields];
              next[i] = { ...row, label };
              patch({ formFields: next });
            }} />
            <TextField label="Type" value={str(row.type)} onChange={(type) => {
              const next = [...formFields];
              next[i] = { ...row, type };
              patch({ formFields: next });
            }} />
            <TextField label="Placeholder" value={str(row.placeholder)} onChange={(placeholder) => {
              const next = [...formFields];
              next[i] = { ...row, placeholder };
              patch({ formFields: next });
            }} />
          </RepeatItemShell>
        );
      })}
    </div>
  );
}

const REGISTRY: Record<string, (p: Props) => ReactNode> = {
  hero: EditorHero,
  pageHeader: EditorPageHeader,
  fintechHero: EditorFintechHero,
  coverageCarousel: EditorCoverageCarousel,
  directoryGrid: EditorDirectoryGrid,
  solutionShowcase: EditorSolutionShowcase,
  sliderSection: EditorSliderSection,
  utilityCtaBand: EditorUtilityCtaBand,
  faqAccordion: EditorFaqAccordion,
  supportPathways: EditorSupportPathways,
  supportSlaStrip: EditorSupportSlaStrip,
  resourceGrid: EditorResourceGrid,
  contactHighlights: EditorContactHighlights,
  benefits: EditorNamedItemsBenefits,
  challenges: EditorChallenges,
  lifecycle: EditorLifecycle,
  decisionFlow: EditorDecisionFlow,
  demoSection: EditorDemoSection,
};

export const CMS_TYPED_BLOCK_TYPES = new Set(
  Object.entries(CMS_BLOCK_CONTRACTS)
    .filter(([, contract]) => contract.visualEditor === 'typed')
    .map(([type]) => type)
    .filter((type) => Object.prototype.hasOwnProperty.call(REGISTRY, type)),
);

export function CmsBlockDraftEditor(props: Props) {
  const Editor = REGISTRY[props.blockType];
  if (!Editor) return null;
  return <>{Editor(props)}</>;
}
