import { createElement, Fragment, type ReactNode } from 'react';

/** Stored TipTap-compatible JSON (subset enforced by validate + render). */
export type CmsRichTextDoc = {
  type: 'doc';
  content?: Record<string, unknown>[];
};

export type CmsRichTextValue = string | CmsRichTextDoc;

const MAX_NODES = 600;
const MAX_DEPTH = 32;
const MAX_PLAIN_CHARS = 50_000;

const ALLOWED_BLOCK = new Set(['paragraph', 'heading']);
const ALLOWED_MARK = new Set(['bold', 'italic', 'link']);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Safe href for public and admin: `/path`, `https:`, `http:`, `mailto:` only. */
export function sanitizeCmsHref(raw: string | undefined | null): string | null {
  if (raw === undefined || raw === null) return null;
  const href = String(raw).trim();
  if (!href) return null;
  const lower = href.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) return null;
  if (href.startsWith('//')) return null;
  if (href.startsWith('/')) {
    if (href.startsWith('//')) return null;
    return href;
  }
  if (lower.startsWith('https://') || lower.startsWith('http://')) return href;
  if (lower.startsWith('mailto:')) {
    const rest = href.slice('mailto:'.length);
    if (!rest || rest.length > 320) return null;
    return href;
  }
  return null;
}

export function isCmsRichTextDoc(value: unknown): value is CmsRichTextDoc {
  return isRecord(value) && value.type === 'doc';
}

export function legacyPlainTextToDoc(text: string): CmsRichTextDoc {
  const t = text.replace(/\r\n/g, '\n');
  if (!t) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  const lines = t.split('\n');
  return {
    type: 'doc',
    content: lines.map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    })),
  };
}

export function normalizeCmsRichTextInput(value: unknown): CmsRichTextDoc {
  if (typeof value === 'string') {
    if (value.length > MAX_PLAIN_CHARS) {
      return legacyPlainTextToDoc(value.slice(0, MAX_PLAIN_CHARS));
    }
    return legacyPlainTextToDoc(value);
  }
  if (isCmsRichTextDoc(value)) {
    const err = validateCmsRichTextDoc(value);
    if (!err) return value;
  }
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

export function validateCmsRichTextField(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    if (value.length > MAX_PLAIN_CHARS) return 'Rich text field: plain string too long';
    return null;
  }
  if (!isCmsRichTextDoc(value)) return 'Rich text field: must be a string or a rich-text document object';
  return validateCmsRichTextDoc(value);
}

export function validateCmsRichTextDoc(doc: unknown): string | null {
  if (!isRecord(doc) || doc.type !== 'doc') return 'Rich text: root must be { type: "doc" }';
  let nodes = 0;
  const walk = (node: unknown, depth: number): string | null => {
    if (depth > MAX_DEPTH) return 'Rich text: nesting too deep';
    if (nodes++ > MAX_NODES) return 'Rich text: too many nodes';
    if (!isRecord(node)) return 'Rich text: invalid node';
    const type = node.type;
    if (type === 'doc') {
      const content = node.content;
      if (content !== undefined && !Array.isArray(content)) return 'Rich text: doc.content must be an array';
      for (const c of content ?? []) {
        const e = walk(c, depth + 1);
        if (e) return e;
      }
      return null;
    }
    if (type === 'hardBreak') return null;
    if (type === 'text') {
      if (typeof node.text !== 'string') return 'Rich text: text node needs string text';
      if (node.text.length > MAX_PLAIN_CHARS) return 'Rich text: text node too long';
      const marks = node.marks;
      if (marks !== undefined) {
        if (!Array.isArray(marks)) return 'Rich text: marks must be an array';
        for (const m of marks) {
          if (!isRecord(m) || typeof m.type !== 'string') return 'Rich text: invalid mark';
          if (!ALLOWED_MARK.has(m.type)) return `Rich text: disallowed mark "${m.type}"`;
          if (m.type === 'link') {
            const attrs = m.attrs;
            if (!isRecord(attrs)) return 'Rich text: link mark needs attrs';
            const href = sanitizeCmsHref(typeof attrs.href === 'string' ? attrs.href : undefined);
            if (!href) return 'Rich text: invalid or disallowed link href';
          }
        }
      }
      return null;
    }
    if (!ALLOWED_BLOCK.has(String(type))) return `Rich text: disallowed node "${String(type)}"`;
    if (type === 'heading') {
      const attrs = node.attrs;
      const level = isRecord(attrs) && typeof attrs.level === 'number' ? attrs.level : undefined;
      if (level !== 2 && level !== 3) return 'Rich text: heading level must be 2 or 3';
    }
    const content = node.content;
    if (content !== undefined) {
      if (!Array.isArray(content)) return 'Rich text: node.content must be an array';
      for (const c of content) {
        const e = walk(c, depth + 1);
        if (e) return e;
      }
    }
    return null;
  };
  return walk(doc, 0);
}

function applyMarks(text: string, marks: unknown[] | undefined, keyBase: string): ReactNode {
  let el: ReactNode = text;
  if (!marks || !Array.isArray(marks)) return el;
  let mi = 0;
  for (const m of marks) {
    if (!isRecord(m) || typeof m.type !== 'string') continue;
    const mk = `${keyBase}-m${mi++}`;
    if (m.type === 'bold') el = createElement('strong', { key: mk }, el);
    else if (m.type === 'italic') el = createElement('em', { key: mk }, el);
    else if (m.type === 'link') {
      const attrs = m.attrs;
      const raw = isRecord(attrs) && typeof attrs.href === 'string' ? attrs.href : '';
      const href = sanitizeCmsHref(raw);
      if (href) {
        const external = /^https?:\/\//i.test(href);
        el = createElement(
          'a',
          {
            key: mk,
            href,
            rel: external ? 'noopener noreferrer nofollow' : undefined,
            target: external ? '_blank' : undefined,
          },
          el,
        );
      }
    }
  }
  return el;
}

function renderNode(node: unknown, key: string): ReactNode {
  if (!isRecord(node)) return null;
  const type = node.type;
  if (type === 'text') {
    const text = typeof node.text === 'string' ? node.text : '';
    return createElement(Fragment, { key }, applyMarks(text, node.marks as unknown[] | undefined, key));
  }
  if (type === 'hardBreak') {
    return createElement('br', { key });
  }
  if (type === 'paragraph') {
    const kids = Array.isArray(node.content) ? node.content.map((c, i) => renderNode(c, `${key}-p-${i}`)) : [];
    return createElement('p', { key }, ...kids);
  }
  if (type === 'heading') {
    const level = isRecord(node.attrs) && node.attrs.level === 3 ? 3 : 2;
    const Tag = level === 3 ? 'h3' : 'h2';
    const kids = Array.isArray(node.content) ? node.content.map((c, i) => renderNode(c, `${key}-h-${i}`)) : [];
    return createElement(Tag, { key }, ...kids);
  }
  return null;
}

/** Renders validated rich-text JSON or legacy plain string as safe React elements. */
export function renderCmsRichText(value: unknown): ReactNode {
  if (typeof value === 'string') {
    return createElement('p', null, value);
  }
  if (!isCmsRichTextDoc(value)) return null;
  if (validateCmsRichTextDoc(value)) {
    return createElement('p', null, '[Content could not be rendered safely]');
  }
  const children = Array.isArray(value.content)
    ? value.content.map((c, i) => renderNode(c, `n-${i}`))
    : [];
  return createElement(Fragment, null, ...children);
}
