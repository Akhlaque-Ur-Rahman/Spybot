'use client';

import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo } from 'react';
import { normalizeCmsRichTextInput, sanitizeCmsHref } from '@/lib/cms/rich-text';
import fieldChrome from '@/components/admin/fields.module.css';
import styles from '@/components/admin/RichTextField.module.css';

function buildExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      blockquote: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      listKeymap: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      strike: false,
      link: false,
      underline: false,
      trailingNode: false,
      heading: { levels: [2, 3] },
    }),
    LinkExtension.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { class: styles.richLink },
    }),
    Placeholder.configure({ placeholder }),
  ];
}

export default function RichTextField({
  label,
  value,
  onChange,
  placeholder = 'Write copy… Use toolbar for headings, bold, italic, links.',
  compact,
  required,
  emphasizeRequired = true,
}: {
  label: string;
  value: unknown;
  onChange: (next: JSONContent) => void;
  placeholder?: string;
  compact?: boolean;
  required?: boolean;
  emphasizeRequired?: boolean;
}) {
  const shell = Boolean(required && emphasizeRequired);
  const initialContent = useMemo(() => normalizeCmsRichTextInput(value) as JSONContent, [value]);
  const extensions = useMemo(() => buildExtensions(placeholder), [placeholder]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: initialContent,
      editorProps: {
        attributes: {
          class: 'ProseMirror',
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getJSON());
      },
    },
    [extensions],
  );

  useEffect(() => {
    if (!editor) return;
    const next = normalizeCmsRichTextInput(value) as JSONContent;
    const cur = editor.getJSON();
    if (JSON.stringify(cur) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <label className={`${styles.label} ${shell ? fieldChrome.labelRequiredShell : ''}`}>
        {required ? (
          <span className={fieldChrome.labelHeading}>
            <span>{label}</span>
            <abbr className={fieldChrome.requiredAsterisk} title="Required">
              *
            </abbr>
          </span>
        ) : (
          <span>{label}</span>
        )}
        <div className={`${styles.editor} ${compact ? styles.editorCompact : ''}`} aria-busy="true">
          Loading editor…
        </div>
      </label>
    );
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const raw = window.prompt('Link URL (https://, http://, mailto:, or /path)', prev ?? 'https://');
    if (raw === null) return;
    const href = sanitizeCmsHref(raw.trim());
    if (!href) {
      window.alert('Invalid URL. Use https://, http://, mailto:, or a site path like /contact.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  function run(cmd: () => void) {
    if (!editor) return;
    cmd();
  }

  return (
    <label className={`${styles.label} ${shell ? fieldChrome.labelRequiredShell : ''}`}>
      {required ? (
        <span className={fieldChrome.labelHeading}>
          <span>{label}</span>
          <abbr className={fieldChrome.requiredAsterisk} title="Required">
            *
          </abbr>
        </span>
      ) : (
        <span>{label}</span>
      )}
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
        <button
          type="button"
          className={`${styles.toolBtn} ${editor.isActive('bold') ? styles.toolBtnActive : ''}`}
          onClick={() => run(() => editor!.chain().focus().toggleBold().run())}
        >
          Bold
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${editor.isActive('italic') ? styles.toolBtnActive : ''}`}
          onClick={() => run(() => editor!.chain().focus().toggleItalic().run())}
        >
          Italic
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${editor.isActive('heading', { level: 2 }) ? styles.toolBtnActive : ''}`}
          onClick={() => run(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())}
        >
          H2
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${editor.isActive('heading', { level: 3 }) ? styles.toolBtnActive : ''}`}
          onClick={() => run(() => editor!.chain().focus().toggleHeading({ level: 3 }).run())}
        >
          H3
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${editor.isActive('paragraph') ? styles.toolBtnActive : ''}`}
          onClick={() => run(() => editor!.chain().focus().setParagraph().run())}
        >
          Paragraph
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => setLink()}>
          Link
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => run(() => editor!.chain().focus().unsetLink().run())}
          disabled={!editor.isActive('link')}
        >
          Unlink
        </button>
      </div>
      <div className={`${styles.editor} ${compact ? styles.editorCompact : ''}`}>
        <EditorContent editor={editor} />
      </div>
      <p className={styles.hint}>
        Line breaks with Shift+Enter. Links are restricted to safe URLs. Plain text from older content is preserved.
      </p>
    </label>
  );
}
